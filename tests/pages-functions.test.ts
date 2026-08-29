import { describe, expect, it, vi } from "vitest"
import { makeSessionCookie } from "@/lib/auth"

import { handleReviewsRequest } from "@/functions/api/reviews"
import { onRequest as protectAdmin } from "@/functions/admin/[[path]]"

const env = {
  AI: {} as Ai,
  DATABASE_URL: "postgresql://example.invalid/db",
  ADMIN_PASSWORD: "password",
  ADMIN_SESSION_SECRET: "test-secret",
}

describe("public reviews function", () => {
  it("returns a successful empty collection", async () => {
    const response = await handleReviewsRequest(
      new Request("https://example.com/api/reviews"),
      env.DATABASE_URL,
      vi.fn().mockResolvedValue([]),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ reviews: [] })
  })

  it("returns a stable 503 without leaking database details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const response = await handleReviewsRequest(
      new Request("https://example.com/api/reviews"),
      env.DATABASE_URL,
      vi.fn().mockRejectedValue(new Error("secret connection details")),
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      reviews: [],
      error: {
        code: "reviews_unavailable",
        message: "Reviews are temporarily unavailable",
      },
    })
  })
})

describe("admin static route protection", () => {
  it("allows the login page with a trailing slash", async () => {
    const next = vi.fn().mockResolvedValue(new Response("login"))
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/login/"),
      env,
      next,
    } as any)
    expect(await response.text()).toBe("login")
    expect(next).toHaveBeenCalledOnce()
  })

  it("redirects an unauthenticated admin request", async () => {
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/"),
      env,
      next: vi.fn(),
    } as any)
    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/login?next=%2Fadmin%2F",
    )
  })

  it("allows a valid signed session", async () => {
    const session = await makeSessionCookie(env.ADMIN_SESSION_SECRET)
    const next = vi.fn().mockResolvedValue(new Response("admin"))
    const response = await protectAdmin({
      request: new Request("https://example.com/admin/", {
        headers: { Cookie: `pk_admin=${session}` },
      }),
      env,
      next,
    } as any)
    expect(await response.text()).toBe("admin")
  })
})
