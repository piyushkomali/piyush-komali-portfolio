import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw/http"
import { setupServer } from "msw/node"
import { makeSessionCookie } from "@/lib/auth"

import { handleReviewsRequest } from "@/functions/api/reviews"
import { createReviewRepository } from "@/lib/db"
import { onRequest as protectAdmin } from "@/functions/admin/[[path]]"

const databaseUrl = "postgresql://test:test@ep-test.us-east-2.aws.neon.tech/test"
const databaseEndpoint = "https://api.us-east-2.aws.neon.tech/sql"
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledFrame: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const env = {
  AI: {} as Ai,
  DATABASE_URL: "postgresql://example.invalid/db",
  ADMIN_PASSWORD: "password",
  ADMIN_SESSION_SECRET: "test-secret",
}

describe("public reviews function", () => {
  it("returns a successful empty collection", async () => {
    server.use(http.post(databaseEndpoint, async ({ request }) => {
      const query = await request.json() as { query: string; params: unknown[] }
      expect(query.query).toContain("FROM reviews")
      expect(query.params).toEqual(["200"])
      return HttpResponse.json({ fields: [], rows: [] })
    }))
    const response = await handleReviewsRequest(
      new Request("https://example.com/api/reviews"),
      createReviewRepository(databaseUrl),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ reviews: [] })
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
    )
  })

  it("returns a stable 503 without leaking database details", async () => {
    let databaseRequested = false
    server.use(http.post(databaseEndpoint, () => {
      databaseRequested = true
      return HttpResponse.json({ message: "secret connection details" }, { status: 400 })
    }))
    const response = await handleReviewsRequest(
      new Request("https://example.com/api/reviews"),
      createReviewRepository(databaseUrl),
    )
    expect(response.status).toBe(503)
    expect(databaseRequested).toBe(true)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(await response.json()).toEqual({
      reviews: [],
      error: {
        code: "reviews_unavailable",
        message: "Reviews are temporarily unavailable",
      },
    })
  })

  it("returns 503 when the database URL is missing", async () => {
    const response = await handleReviewsRequest(
      new Request("https://example.com/api/reviews"),
      createReviewRepository(""),
    )
    expect(response.status).toBe(503)
  })
})

describe("admin static route protection", () => {
  it("allows the login page with a trailing slash", async () => {
    server.use(http.get("https://example.com/admin/login/", () => HttpResponse.text("login")))
    const next = () => fetch("https://example.com/admin/login/")
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/login/"),
      env,
      next,
    } as Parameters<typeof protectAdmin>[0])
    expect(await response.text()).toBe("login")
  })

  it("redirects an unauthenticated admin request", async () => {
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/"),
      env,
      next: async (): Promise<Response> => { throw new Error("Unauthenticated requests must not reach static assets") },
    } as Parameters<typeof protectAdmin>[0])
    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/login?next=%2Fadmin%2F",
    )
  })

  it("allows a valid signed session", async () => {
    const session = await makeSessionCookie(env.ADMIN_SESSION_SECRET)
    server.use(http.get("https://example.com/admin/", () => HttpResponse.text("admin")))
    const next = () => fetch("https://example.com/admin/")
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/", {
        headers: { Cookie: `pk_admin=${session}` },
      }),
      env,
      next,
    } as Parameters<typeof protectAdmin>[0])
    expect(await response.text()).toBe("admin")
  })
})
