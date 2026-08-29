import { createWorkersAI } from "workers-ai-provider"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import { z } from "zod"
import { createReviews, deleteReview, listReviews, type NewReview } from "../../lib/db"
import { normalizeLetterboxdUrl } from "../../lib/letterboxd"
import { searchMovie } from "../../lib/tmdb"
import { isAdmin } from "../_shared/auth"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction, Env } from "../types"

const MODEL = "@cf/zai-org/glm-4.7-flash" as const
const MAX_IMPORT_SIZE = 25

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}, "Must be a real ISO date")

const parsedReviewSchema = z.object({
  title: z.string().trim().min(1),
  year: z.number().int().min(1878).max(2200).nullish(),
  rating: z.number().min(0).max(5),
  liked: z.boolean().default(false),
  rewatch: z.boolean().default(false),
  review: z.string().nullish(),
  watched_on: isoDate,
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  letterboxd_url: z.string().url().nullish(),
})

export const importReviewsSchema = z.object({
  reviews: z.array(parsedReviewSchema).min(1).max(MAX_IMPORT_SIZE),
})

type ParsedReview = z.infer<typeof parsedReviewSchema>

function todayInNewYork(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length)
  let nextIndex = 0
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++
      results[index] = await mapper(values[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker))
  return results
}

async function importReviews(env: Env, reviews: ParsedReview[]) {
  // Normalize the complete batch before any external lookup or database write.
  const normalized = reviews.map((review) => ({
    ...review,
    title: review.title.trim(),
    review: review.review?.trim() || null,
    tags: [...new Set(review.tags.map((tag) => tag.trim().toLowerCase()))],
    letterboxd_url: normalizeLetterboxdUrl(review.letterboxd_url),
  }))

  const seen = new Set<string>()
  const withinBatchDuplicates: ParsedReview[] = []
  const unique = normalized.filter((review) => {
    if (!review.letterboxd_url) return true
    if (seen.has(review.letterboxd_url)) {
      withinBatchDuplicates.push(review)
      return false
    }
    seen.add(review.letterboxd_url)
    return true
  })

  const warnings: string[] = []
  const enriched = await mapWithConcurrency(unique, 5, async (review) => {
    const hit = await searchMovie(env.TMDB_API_KEY, review.title, review.year ?? null)
    if (!hit) warnings.push(`No TMDB poster match for ${review.title}`)
    return {
      ...review,
      title: hit?.title ?? review.title,
      year: hit?.year ?? review.year ?? null,
      poster_url: hit?.poster_url ?? null,
      tmdb_id: hit?.id ?? null,
    } satisfies NewReview
  })

  const result = await createReviews(env.DATABASE_URL, enriched)
  const databaseDuplicates = result.duplicateIndexes.map((index) => enriched[index])
  return {
    created: result.created.map((review) => ({ id: review.id, title: review.title })),
    duplicates: [...withinBatchDuplicates, ...databaseDuplicates].map((review) => ({
      title: review.title,
      letterboxd_url: review.letterboxd_url,
    })),
    warnings,
  }
}

export const onRequest: AppPagesFunction = async (context) => {
  if (!(await isAdmin(context.request, context.env))) {
    return json({ error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 })
  }
  if (context.request.method !== "POST") return methodNotAllowed(["POST"])

  let body: { messages?: UIMessage[] }
  try {
    body = await context.request.json()
  } catch {
    return json({ error: { code: "invalid_body", message: "Invalid request body" } }, { status: 400 })
  }
  if (!Array.isArray(body.messages)) {
    return json({ error: { code: "invalid_messages", message: "messages must be an array" } }, { status: 400 })
  }

  const today = todayInNewYork()
  const workersAI = createWorkersAI({ binding: context.env.AI })
  let importCalled = false
  const result = streamText({
    model: workersAI(MODEL, { reasoning_effort: "low" }),
    system: `You are the CMS assistant for Piyush Komali's film review database.
Today's date in America/New_York is ${today}.

For an import, extract every review into one array and call importReviews exactly once. Never split a single user message across multiple importReviews calls. If there are more than ${MAX_IMPORT_SIZE} reviews, do not call tools; ask the user to split the paste. If any review is ambiguous or missing a required title, ask one brief clarifying question before calling tools.

FIELD RULES
- rating is 0..5. If absent, use 0.
- watched_on is YYYY-MM-DD. If only month/day is present, use ${today.slice(0, 4)}. If absent, use ${today}.
- liked is true only for an explicit heart/like indication.
- rewatch is true only when explicitly marked as a rewatch.
- tags are short lowercase strings.
- preserve the user's review prose and voice; use an empty string when absent.
- include letterboxd_url only when explicitly present.
- never invent details.

After a tool result, clearly report created reviews, skipped duplicates, and poster warnings. You may also list reviews or delete one by id. Ask for confirmation before calling deleteReview.`,
    messages: await convertToModelMessages(body.messages),
    stopWhen: stepCountIs(5),
    tools: {
      importReviews: tool({
        description: `Validate and atomically import one complete batch of 1 to ${MAX_IMPORT_SIZE} reviews. Call exactly once per user paste.`,
        inputSchema: importReviewsSchema,
        execute: async ({ reviews }) => {
          if (importCalled) {
            return { error: "Only one importReviews call is allowed per user message" }
          }
          importCalled = true
          return importReviews(context.env, reviews)
        },
      }),
      listReviews: tool({
        description: "List existing reviews, most recent first.",
        inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
        execute: async ({ limit }) => {
          const rows = await listReviews(context.env.DATABASE_URL, limit)
          return rows.map(({ id, title, year, rating, watched_on }) => ({
            id, title, year, rating, watched_on,
          }))
        },
      }),
      deleteReview: tool({
        description: "Delete a review by id only after the user confirms deletion.",
        inputSchema: z.object({ id: z.string().uuid() }),
        execute: async ({ id }) => ({
          ok: await deleteReview(context.env.DATABASE_URL, id),
        }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
