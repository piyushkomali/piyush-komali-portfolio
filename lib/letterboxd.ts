const LETTERBOXD_HOSTS = new Set(["letterboxd.com", "www.letterboxd.com"])
const REVIEW_PATH = /^\/([^/]+)\/film\/([^/]+)(?:\/(\d+))?\/?$/i

/** Normalize a Letterboxd review URL while preserving numbered rewatches. */
export function normalizeLetterboxdUrl(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null

  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error("Letterboxd URL is not a valid URL")
  }

  if (!LETTERBOXD_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("Letterboxd URL must use letterboxd.com")
  }

  const match = url.pathname.match(REVIEW_PATH)
  if (!match) {
    throw new Error(
      "Letterboxd URL must look like /username/film/movie-slug/ with an optional review number",
    )
  }

  const [, username, slug, reviewNumber] = match
  const suffix = reviewNumber ? `/${reviewNumber}` : ""
  return `https://letterboxd.com/${username.toLowerCase()}/film/${slug.toLowerCase()}${suffix}/`
}
