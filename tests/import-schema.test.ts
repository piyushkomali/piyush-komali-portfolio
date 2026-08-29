import { describe, expect, it } from "vitest"
import { importReviewsSchema } from "@/functions/api/chat"

const review = (title: string) => ({
  title,
  rating: 4.5,
  liked: false,
  rewatch: false,
  review: "",
  watched_on: "2026-08-29",
  tags: [],
  letterboxd_url: null,
})

describe("review import validation", () => {
  it("accepts a ten-review batch", () => {
    const result = importReviewsSchema.safeParse({
      reviews: Array.from({ length: 10 }, (_, index) => review(`Movie ${index}`)),
    })
    expect(result.success).toBe(true)
  })

  it("rejects a batch over 25 before execution", () => {
    const result = importReviewsSchema.safeParse({
      reviews: Array.from({ length: 26 }, (_, index) => review(`Movie ${index}`)),
    })
    expect(result.success).toBe(false)
  })

  it("rejects the complete batch when one member is invalid", () => {
    const reviews = [review("Valid"), review("")]
    expect(importReviewsSchema.safeParse({ reviews }).success).toBe(false)
  })

  it("rejects impossible dates", () => {
    expect(
      importReviewsSchema.safeParse({
        reviews: [{ ...review("Invalid date"), watched_on: "2026-02-30" }],
      }).success,
    ).toBe(false)
  })
})
