import { randomUUID } from "node:crypto"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw/http"
import { setupServer } from "msw/node"
import { PGlite } from "@electric-sql/pglite"
import type { UIMessage } from "ai"
import { makeSessionCookie } from "@/lib/auth"
import { createReviewRepository, type ReviewCatalog } from "@/lib/db"
import { catalogRequest, withoutCatalogRows } from "@/lib/review-chat"
import { AdminChatMessage } from "@/components/admin-chat-message"
import { onRequest } from "@/functions/api/chat"

const databaseUrl = "postgresql://test:test@ep-review-chat.us-east-2.aws.neon.tech/test"
const endpoint = "https://api.us-east-2.aws.neon.tech/sql"
const server = setupServer()
const database = new PGlite()
let databaseCalls = 0
let modelCalls = 0
let cookie = ""
const env = {
  DATABASE_URL: databaseUrl,
  ADMIN_PASSWORD: "test-password",
  ADMIN_SESSION_SECRET: "test-session-secret",
  AI: { run: async () => {
    modelCalls++
    const response = await fetch("https://workers-ai.test/run")
    return response.body
  } } as unknown as Ai,
}

beforeAll(async () => {
  server.listen({ onUnhandledFrame: "error" })
  cookie = `pk_admin=${await makeSessionCookie(env.ADMIN_SESSION_SECRET)}`
  await database.exec(`CREATE TABLE reviews (
    id uuid PRIMARY KEY, title text NOT NULL, year integer, rating numeric(2,1),
    watched_on date, created_at timestamptz DEFAULT now()
  )`)
})
beforeEach(async () => {
  databaseCalls = 0
  modelCalls = 0
  await database.exec("TRUNCATE reviews")
  server.use(http.post(endpoint, async ({ request }) => {
    databaseCalls++
    const { query, params } = await request.json() as { query: string; params: unknown[] }
    // Execute the real repository SQL locally. Every test remains isolated from Neon.
    const result = await database.query<Record<string, unknown>>(query, params)
    return HttpResponse.json({
      fields: result.fields,
      rows: result.rows.map((row) => result.fields.map(({ name }) => {
        const value = row[name]
        return typeof value === "object" && value !== null ? JSON.stringify(value) : value
      })),
    })
  }))
})
afterEach(() => server.resetHandlers())
afterAll(async () => { server.close(); await database.close() })

async function seed(count = 37) {
  for (let index = 0; index < count; index++) {
    await database.query(
      "INSERT INTO reviews (id, title, year, rating, watched_on) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), index < 2 ? "Repeat viewing" : `Saved movie ${index}`, 2024, 4.3, "2026-08-29"],
    )
  }
}

function message(text: string): UIMessage {
  return { id: randomUUID(), role: "user", parts: [{ type: "text", text }] }
}
async function chat(messages: UIMessage[], authenticated = true) {
  return onRequest({
    request: new Request("https://example.test/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(authenticated ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ messages }),
    }),
    env,
  } as Parameters<typeof onRequest>[0])
}
async function events(response: Response) {
  return (await response.text()).split("\n").filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")
    .map((line) => JSON.parse(line.slice(6)) as Record<string, unknown>)
}
function catalogMessage(catalog: ReviewCatalog, text = ""): UIMessage {
  return {
    id: randomUUID(), role: "assistant", parts: [
      { type: "text", text },
      { type: "tool-listReviews", toolCallId: "catalog", state: "output-available", input: {}, output: catalog },
    ],
  }
}

const repository = createReviewRepository(databaseUrl)

describe("catalog query against PostgreSQL", () => {
  it("returns every review and exact movie counts, including repeat viewings", async () => {
    await seed()
    const result = await repository.listReviewCatalog()
    expect(result).toMatchObject({ totalReviews: 37, totalMovies: 36, returnedReviews: 37, hasMore: false })
    expect(result.reviews.filter((row) => row.title === "Repeat viewing")).toHaveLength(2)
    expect(result.reviews[0].rating).toBe(4.3)
    expect(result.reviews[0].watched_on).toBe("2026-08-29")
    expect(databaseCalls).toBe(1)
  })
  it("reports partial results with full counts and stable ordering", async () => {
    await seed()
    const subset = await repository.listReviewCatalog(10)
    const all = await repository.listReviewCatalog()
    expect(subset).toMatchObject({ totalReviews: 37, totalMovies: 36, returnedReviews: 10, hasMore: true })
    expect(subset.reviews).toEqual(all.reviews.slice(0, 10))
  })
  it("counts normalized titles, remakes, and missing years consistently", async () => {
    for (const [title, year] of [["Dune", 1984], ["Dune", 2021], [" dune ", 2021], ["Unknown", null], ["unknown", null]]) {
      await database.query("INSERT INTO reviews (id, title, year, rating, watched_on) VALUES ($1,$2,$3,4,'2026-01-01')", [randomUUID(), title, year])
    }
    expect(await repository.listReviewCatalog()).toMatchObject({ totalReviews: 5, totalMovies: 3 })
  })
  it("returns explicit zero counts for an empty database", async () => {
    expect(await repository.listReviewCatalog()).toEqual({ reviews: [], totalReviews: 0, totalMovies: 0, returnedReviews: 0, hasMore: false })
  })
  it("does not truncate the full catalog at 50, 100, or 500", async () => {
    await database.exec(`INSERT INTO reviews (id, title, year, rating, watched_on)
      SELECT md5(i::text)::uuid, 'Movie ' || i, 2024, 4, '2026-01-01'::date FROM generate_series(1, 501) i`)
    expect(await repository.listReviewCatalog()).toMatchObject({ totalReviews: 501, returnedReviews: 501, hasMore: false })
  })
})

describe("admin chat entry point", () => {
  it.each(["what movies are here", "show me all movies not just 10", "list reviews", "how many movies do I have?"])("reads the complete catalog for %s without model inference", async (text) => {
    await seed()
    const response = await chat([message(text)])
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    const chunks = await events(response)
    expect(chunks.find((chunk) => chunk.type === "tool-output-available")?.output).toMatchObject({ totalReviews: 37, totalMovies: 36, returnedReviews: 37 })
    expect(modelCalls).toBe(0)
    expect(databaseCalls).toBe(1)
  })
  it("refreshes the database when challenging an earlier limited response", async () => {
    await seed()
    const earlier = await repository.listReviewCatalog(10)
    await database.query("DELETE FROM reviews WHERE id = $1", [earlier.reviews[0].id])
    databaseCalls = 0
    const chunks = await events(await chat([message("latest 10"), catalogMessage(earlier), message("thats all of them?")]))
    expect(chunks.find((chunk) => chunk.type === "tool-output-available")?.output).toMatchObject({ returnedReviews: 36, totalReviews: 36, hasMore: false })
    expect(databaseCalls).toBe(1)
    expect(modelCalls).toBe(0)
  })
  it("honors an explicit latest-N request", async () => {
    await seed()
    const chunks = await events(await chat([message("show me the latest 10 movies")]))
    expect(chunks.find((chunk) => chunk.type === "tool-output-available")?.output).toMatchObject({ returnedReviews: 10, totalReviews: 37, hasMore: true })
  })
  it("shows a database failure without returning catalog rows or secrets", async () => {
    server.use(http.post(endpoint, () => HttpResponse.json({ message: "secret postgres details" }, { status: 500 })))
    const response = await chat([message("what movies are here")])
    const output = await response.text()
    expect(output).toContain('"type":"tool-output-error"')
    expect(output).not.toContain("secret postgres details")
    expect(output).not.toContain('"tool-output-available"')
    expect(modelCalls).toBe(0)
  })
  it("requires authentication before reading the database", async () => {
    expect((await chat([message("list reviews")], false)).status).toBe(401)
    expect(databaseCalls).toBe(0)
    expect(modelCalls).toBe(0)
  })
  it("rejects malformed history before executing tools", async () => {
    expect((await chat([{ id: "bad", role: "user", parts: [{ type: "text", text: 42 }] } as unknown as UIMessage])).status).toBe(400)
    expect(databaseCalls).toBe(0)
  })
  it("executes a model-selected catalog tool and stops before a generated recount", async () => {
    await seed()
    const payload = [
      { choices: [{ delta: { tool_calls: [{ index: 0, id: "catalog-call", type: "function", function: { name: "listReviews", arguments: "{}" } }] }, finish_reason: null }] },
      { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
    ].map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n"
    server.use(http.get("https://workers-ai.test/run", () => new HttpResponse(payload, { headers: { "Content-Type": "text/event-stream" } })))
    const chunks = await events(await chat([message("Could you retrieve the saved film collection for me?")]))
    expect(chunks.find((chunk) => chunk.type === "tool-output-available")?.output).toMatchObject({ returnedReviews: 37, hasMore: false })
    expect(modelCalls).toBe(1)
    expect(databaseCalls).toBe(1)
  })
  it("allows deletion lookup to continue to signed confirmation without deleting a row", async () => {
    await seed()
    const catalog = await repository.listReviewCatalog()
    const id = catalog.reviews[0].id
    server.use(http.get("https://workers-ai.test/run", () => {
      const call = modelCalls === 1
        ? { name: "listReviews", arguments: "{}" }
        : { name: "requestDeleteReview", arguments: JSON.stringify({ id }) }
      const delta = modelCalls < 3
        ? { tool_calls: [{ index: 0, id: `call-${modelCalls}`, type: "function", function: call }] }
        : { content: "Send the displayed confirmation phrase." }
      return new HttpResponse(`data: ${JSON.stringify({ choices: [{ delta, finish_reason: modelCalls < 3 ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`, { headers: { "Content-Type": "text/event-stream" } })
    }))
    const chunks = await events(await chat([message("delete The Long Way Home")]))
    const confirmation = chunks.find((chunk) => chunk.type === "tool-output-available" && (chunk.output as { confirmationPhrase?: string })?.confirmationPhrase)
    expect(confirmation?.output).toHaveProperty("confirmationPhrase", expect.stringContaining(`CONFIRM DELETE ${id}`))
    expect(modelCalls).toBe(3)
    expect((await repository.listReviewCatalog()).totalReviews).toBe(37)
  })
})

describe("chat rendering and history", () => {
  it("renders database rows and counts while suppressing an invented model summary", async () => {
    await seed()
    const catalog = await repository.listReviewCatalog()
    const html = renderToStaticMarkup(createElement(AdminChatMessage, { message: catalogMessage(catalog, "Only 10 movies, including Preview Winter Otter") }))
    expect(html).toContain("37 reviews across 36 movies")
    expect(html.match(/scope="row"/g)).toHaveLength(37)
    expect(html).not.toContain("Preview Winter Otter")
    expect(html).toContain("Showing all 37 reviews")
  })
  it("labels partial catalogs and preserves zero ratings and missing years", () => {
    const catalog: ReviewCatalog = { totalReviews: 35, totalMovies: 34, returnedReviews: 1, hasMore: true, reviews: [{ id: "one", title: "<script>alert(1)</script>", year: null, rating: 0, watched_on: "2026-01-01" }] }
    const html = renderToStaticMarkup(createElement(AdminChatMessage, { message: catalogMessage(catalog) }))
    expect(html).toContain("latest 1 of 35")
    expect(html).toContain("0 / 5")
    expect(html).toContain("—")
    expect(html).not.toContain("<script>")
  })
  it("renders GFM tables, bold text and lists while blocking HTML and javascript links", () => {
    const text = "**Saved**\n\n| Movie | Rating |\n|---|---|\n| Dune | 5 |\n\n- Done\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))"
    const html = renderToStaticMarkup(createElement(AdminChatMessage, { message: { ...message(text), role: "assistant" } }))
    expect(html).toContain("<table")
    expect(html).toContain("<strong>Saved</strong>")
    expect(html).toContain("<ul>")
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("javascript:")
  })
  it("preserves pasted user text literally", () => {
    const html = renderToStaticMarkup(createElement(AdminChatMessage, { message: message("**My review** <div>original prose</div>") }))
    expect(html).toContain("**My review** &lt;div&gt;original prose&lt;/div&gt;")
    expect(html).not.toContain("<strong>")
  })
  it("keeps the signed deletion phrase visible alongside a catalog result", () => {
    const catalog: ReviewCatalog = { reviews: [], totalReviews: 0, totalMovies: 0, returnedReviews: 0, hasMore: false }
    const assistant = catalogMessage(catalog, "A model-generated summary")
    assistant.parts.push({ type: "tool-requestDeleteReview", toolCallId: "confirm", state: "output-available", input: { id: "one" }, output: { confirmationPhrase: "CONFIRM DELETE signed-phrase" } })
    const html = renderToStaticMarkup(createElement(AdminChatMessage, { message: assistant }))
    expect(html).toContain("CONFIRM DELETE signed-phrase")
    expect(html).not.toContain("A model-generated summary")
  })
  it("does not feed earlier rows or counts back into the model", () => {
    const catalog: ReviewCatalog = { reviews: [], totalReviews: 35, totalMovies: 23, returnedReviews: 0, hasMore: true }
    const history = withoutCatalogRows([catalogMessage(catalog)])
    expect(JSON.stringify(history)).not.toContain('"totalReviews":35')
    expect(JSON.stringify(history)).toContain("Call listReviews again")
    expect(catalog.totalReviews).toBe(35)
  })
  it.each(["delete all reviews", "Dune (2021) ★★★★ Watched 2026-01-01", "what movies are here and delete them", "show movies rated 5", "show me the latest 0 movies"])("leaves other requests to the agent for %s", (text) => {
    expect(catalogRequest(text, false)).toBeNull()
  })
})
