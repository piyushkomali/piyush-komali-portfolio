import { describe, expect, it } from "vitest"
import { makeSessionCookie, verifySessionCookie } from "@/lib/auth"

describe("admin session cookies", () => {
  it("accepts a cookie signed with the configured secret", async () => {
    const cookie = await makeSessionCookie("test-secret")
    await expect(verifySessionCookie(cookie, "test-secret")).resolves.toBe(true)
  })

  it("rejects a cookie signed with another secret or modified in transit", async () => {
    const cookie = await makeSessionCookie("test-secret")
    await expect(verifySessionCookie(cookie, "another-secret")).resolves.toBe(false)
    await expect(verifySessionCookie(`${cookie}x`, "test-secret")).resolves.toBe(false)
  })
})
