import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import { z } from "zod"
import { createReview, deleteReview, ensureSchema, listReviews } from "@/lib/db"
import { searchMovie } from "@/lib/tmdb"

// Node runtime — Neon HTTP driver + fetch are both fine here.
export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM_PROMPT = `You are the CMS assistant for Piyush Komali's personal film review database.

The user will paste raw text from their Letterboxd reviews (or describe a review casually). Your job is to:
1. Parse out the structured fields for each review (title, year, rating, watched date, liked, rewatch, tags, review text).
2. For each review, call the "lookupMoviePoster" tool to fetch the TMDB poster & canonical title/year.
3. Then call "createReview" to persist it.
4. Confirm what you did in a short reply. If the user pastes multiple reviews at once, process them all.

FIELD RULES
- rating: number 0..5, halves allowed (e.g. 3.5). If missing, default to 0.
- watched_on: ISO date "YYYY-MM-DD". If only a month/day is given, use current year. If nothing given, use today's date.
- liked: true if the user indicated a heart/like or explicitly said they liked it.
- rewatch: true if labeled as a rewatch.
- tags: array of short lowercase strings; can be empty.
- review: the actual prose review body, cleaned up but preserving the user's voice. Empty string if none.
- letterboxd_url: only include if explicitly present in the pasted text.

Never invent details. If a field isn't present in the input, omit it or use the default. If the input is ambiguous, ask a brief clarifying question BEFORE calling any tools.

The user can also ask you to list or delete reviews — use "listReviews" and "deleteReview" for that.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Ensure DB schema exists (idempotent, cheap on subsequent calls).
  try {
    await ensureSchema()
  } catch (e) {
    return new Response(
      JSON.stringify({
        error:
          "Database not reachable. Set DATABASE_URL to your Neon connection string. " +
          (e instanceof Error ? e.message : ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(8),
    tools: {
      lookupMoviePoster: tool({
        description:
          "Look up a movie on TMDB to get its official poster URL, canonical title, year, and TMDB id. Call this before createReview so the poster is filled in.",
        inputSchema: z.object({
          title: z.string().describe("Movie title as best you can extract"),
          year: z
            .number()
            .int()
            .nullish()
            .describe("Release year if known, otherwise omit"),
        }),
        execute: async ({ title, year }) => {
          const hit = await searchMovie(title, year ?? null)
          if (!hit) {
            return {
              found: false as const,
              message:
                "No TMDB match (or TMDB_API_KEY missing). Proceed without a poster.",
            }
          }
          return {
            found: true as const,
            tmdb_id: hit.id,
            canonical_title: hit.title,
            year: hit.year,
            poster_url: hit.poster_url,
          }
        },
      }),

      createReview: tool({
        description:
          "Insert a new film review into the reviews database. Always call lookupMoviePoster first so poster_url / tmdb_id / year are populated when possible.",
        inputSchema: z.object({
          title: z.string().min(1),
          year: z.number().int().nullish(),
          poster_url: z.string().url().nullish(),
          rating: z
            .number()
            .min(0)
            .max(5)
            .describe("0..5 stars, halves allowed"),
          liked: z.boolean().default(false),
          rewatch: z.boolean().default(false),
          review: z.string().nullish(),
          watched_on: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .describe("ISO date YYYY-MM-DD"),
          tags: z.array(z.string()).default([]),
          letterboxd_url: z.string().url().nullish(),
          tmdb_id: z.number().int().nullish(),
        }),
        execute: async (input) => {
          const row = await createReview(input)
          return { ok: true as const, id: row.id, title: row.title }
        },
      }),

      listReviews: tool({
        description:
          "List existing reviews (most recent first). Use when the user wants to see, review, or find something to delete.",
        inputSchema: z.object({
          limit: z.number().int().min(1).max(50).default(20),
        }),
        execute: async ({ limit }) => {
          const rows = await listReviews(limit)
          return rows.map((r) => ({
            id: r.id,
            title: r.title,
            year: r.year,
            rating: r.rating,
            watched_on: r.watched_on,
          }))
        },
      }),

      deleteReview: tool({
        description:
          "Delete a review by id. Ask for confirmation from the user before calling this.",
        inputSchema: z.object({
          id: z.string().uuid(),
        }),
        execute: async ({ id }) => {
          const ok = await deleteReview(id)
          return { ok }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
