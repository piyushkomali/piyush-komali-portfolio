import { describe, expect, it } from "vitest"
import { normalizeLetterboxdUrl } from "@/lib/letterboxd"

describe("normalizeLetterboxdUrl", () => {
  it.each([
    [
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/",
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/",
    ],
    [
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/1/",
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/1/",
    ],
    [
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/2",
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/2/",
    ],
    [
      "http://www.letterboxd.com/PiyushKomali/film/The-Odyssey-2026?from=activity#review",
      "https://letterboxd.com/piyushkomali/film/the-odyssey-2026/",
    ],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeLetterboxdUrl(input)).toBe(expected)
  })

  it.each([null, undefined, "", "   "])("allows a missing URL", (input) => {
    expect(normalizeLetterboxdUrl(input)).toBeNull()
  })

  it.each([
    "not a URL",
    "https://example.com/piyushkomali/film/the-odyssey-2026/",
    "https://letterboxd.com/film/the-odyssey-2026/",
    "https://letterboxd.com/piyushkomali/list/favorites/",
    "https://evil.letterboxd.com/piyushkomali/film/the-odyssey-2026/",
  ])("rejects %s", (input) => {
    expect(() => normalizeLetterboxdUrl(input)).toThrow()
  })
})
