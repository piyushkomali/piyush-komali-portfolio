import { createWorkersAI } from "workers-ai-provider"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  hasToolCall,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  toUIMessageStream,
  tool,
} from "ai"
import { z } from "zod"
import { createReviewRepository, type NewReview, type ReviewRepository } from "../../lib/db"
import { createDeleteConfirmation, isConfirmedDeleteMessage } from "../../lib/delete-confirmation"
import { normalizeLetterboxdUrl } from "../../lib/letterboxd"
import { catalogRequest, hasCatalogResult, withoutCatalogRows } from "../../lib/review-chat"
import { searchMovie } from "../../lib/tmdb"
import { isAdmin, sessionSecret } from "../_shared/auth"
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
  const results: R[] = []
  let nextIndex = 0
  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex++
      results[index] = await mapper(values[index], index)
    }
  }

  const workerCount = Math.min(concurrency, values.length)
  // workerCount = 5 → [Promise, Promise, Promise, Promise, Promise]
  const workerPromises = Array.from({ length: workerCount }, () => worker())
  await Promise.all(workerPromises)

  return results
}

async function importReviews(env: Env, reviewRepository: ReviewRepository, reviews: ParsedReview[]) {
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
      // Letterboxd is the source of truth for movie identity. TMDB is enrichment only.
      title: review.title,
      year: review.year ?? null,
      poster_url: hit?.poster_url ?? null,
      tmdb_id: hit?.id ?? null,
    } satisfies NewReview
  })

  const result = await reviewRepository.createReviews(enriched)
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

  let body: unknown
  try {
    body = await context.request.json()
  } catch {
    return json({ error: { code: "invalid_body", message: "Invalid request body type" } }, { status: 400 })
  }
  const parsed = z.object({
    messages: z.array(z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      parts: z.array(z.object({ type: z.string() }).passthrough()),
    }).passthrough()).min(1),
  }).safeParse(body)
  if (!parsed.success) {
    return json({ error: { code: "invalid_messages", message: "Invalid chat messages" } }, { status: 400 })
  }
  const validated = await safeValidateUIMessages({ messages: parsed.data.messages })
  if (!validated.success) {
    return json({ error: { code: "invalid_messages", message: "Invalid chat messages" } }, { status: 400 })
  }
  const messages = validated.data
  const latest = messages.at(-1)!
  if (latest.role !== "user" || latest.parts.some((part) => part.type === "text" && typeof part.text !== "string")) {
    return json({ error: { code: "invalid_messages", message: "The last message must contain user text" } }, { status: 400 })
  }
  const reviewRepository = createReviewRepository(context.env.DATABASE_URL)

  const latestText = latest.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n")
  const isDeleteTurn = /\b(?:delete|remove)\b/i.test(latestText)
  const inventory = catalogRequest(latestText, hasCatalogResult(messages))
  if (inventory) {
    return createUIMessageStreamResponse({
      headers: { "Cache-Control": "no-store" },
      stream: createUIMessageStream({
        onError: () => "Could not load reviews. Please retry.",
        execute: async ({ writer }) => {
          const toolCallId = crypto.randomUUID()
          writer.write({ type: "tool-input-available", toolCallId, toolName: "listReviews", input: inventory })
          try {
            const catalog = await reviewRepository.listReviewCatalog(inventory.limit)
            writer.write({ type: "tool-output-available", toolCallId, output: catalog })
          } catch {
            writer.write({ type: "tool-output-error", toolCallId, errorText: "Could not load reviews. Please retry." })
          }
        },
      }),
    })
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
- preserve the user's review prose and voice exactly; use an empty string when absent.
- include letterboxd_url only when explicitly present.
- never invent details.

CATALOG RULES
- For every question about saved movies, reviews, counts, or completeness, call listReviews again in this turn. Earlier messages and tool outputs may be stale.
- Omit limit to retrieve all reviews. Set limit only when the user explicitly requests a latest-N subset.
- The UI displays listReviews results directly. For a catalog question, end the turn after that tool. Never copy its rows, calculate counts, or write a catalog summary yourself. For a deletion request, continue to the required confirmation tool after finding the review.
- totalReviews counts saved reviews, including repeat viewings. totalMovies counts distinct normalized title and release-year pairs. hasMore identifies partial results.
- If a database tool fails, report that failure. Never fill in missing records from memory or earlier conversation.
- Use short Markdown paragraphs or lists for other responses. Preserve imported review prose exactly.

After a tool result, clearly report created reviews, skipped duplicates, and poster warnings. You may also list reviews. To delete, first call requestDeleteReview with the review id and show the returned confirmation phrase exactly. Ask the user to send that phrase as their entire next message. Only then call deleteReview for the same id. Never call both deletion tools in one turn.`,
    messages: await convertToModelMessages(withoutCatalogRows(messages), { ignoreIncompleteToolCalls: true }),
    stopWhen: isDeleteTurn ? stepCountIs(5) : [stepCountIs(5), hasToolCall("listReviews")],
    abortSignal: context.request.signal,
    tools: {
      importReviews: tool({
        description: `Validate and atomically import one complete batch of 1 to ${MAX_IMPORT_SIZE} reviews. Call exactly once per user paste.`,
        inputSchema: importReviewsSchema,
        execute: async ({ reviews }) => {
          if (importCalled) {
            return { error: "Only one importReviews call is allowed per user message" }
          }
          importCalled = true
          return importReviews(context.env, reviewRepository, reviews)
        },
      }),
      listReviews: tool({
        description: "Read current saved reviews and exact catalog counts. Omit limit for ALL reviews. Use limit only for an explicitly requested latest-N subset. The UI renders the result directly.",
        inputSchema: z.object({ limit: z.number().int().min(1).max(500).optional() }),
        execute: ({ limit }) => reviewRepository.listReviewCatalog(limit),
      }),
      requestDeleteReview: tool({
        description: "Prepare a short-lived confirmation phrase for deleting a review. Show the full phrase to the user and wait for their next message.",
        inputSchema: z.object({ id: z.string().uuid() }),
        execute: async ({ id }) => ({
          confirmationPhrase: await createDeleteConfirmation(id, sessionSecret(context.env)),
          instruction: "Ask the user to send this exact phrase as their entire next message.",
        }),
      }),
      deleteReview: tool({
        description: "Delete a review by id only after the user's latest message exactly matches the signed confirmation phrase from requestDeleteReview.",
        inputSchema: z.object({ id: z.string().uuid() }),
        execute: async ({ id }) => {
          // Client-supplied assistant history cannot authorize deletion.
          if (!(await isConfirmedDeleteMessage(messages, id, sessionSecret(context.env)))) {
            return { ok: false, error: "Confirmation required. Call requestDeleteReview and wait for the user's exact reply." }
          }
          return { ok: await reviewRepository.deleteReview(id) }
        },
      }),
    },
  })

  return createUIMessageStreamResponse({
    headers: { "Cache-Control": "no-store" },
    stream: toUIMessageStream({ stream: result.stream, sendReasoning: false, onError: () => "The chat request failed. Please retry." }),
  })
}
