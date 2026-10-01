/**
 * Minimal TMDB helper. Uses TMDB v3 API with an API key.
 * Free key: https://www.themoviedb.org/settings/api
 *
 * The caller supplies a TMDB v3 API key (not the read-access token).
 */

export type TmdbMovie = {
  id: number
  title: string
  year: number | null
  poster_url: string | null
  overview: string | null
}

const IMG_BASE = "https://image.tmdb.org/t/p/w300"

function normalizeMovieTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function isTmdbMovieMatch(
  sourceTitle: string,
  sourceYear: number | null | undefined,
  hit: TmdbMovie,
): boolean {
  if (normalizeMovieTitle(sourceTitle) !== normalizeMovieTitle(hit.title)) return false
  if (sourceYear != null && hit.year !== sourceYear) return false
  return true
}

export async function searchMovie(
  key: string | undefined,
  query: string,
  year?: number | null,
): Promise<TmdbMovie | null> {
  if (!key) return null

  const params = new URLSearchParams({
    api_key: key,
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  })
  if (year) params.set("year", String(year))

  try {
    // This helper runs in a Cloudflare Pages Function, not the Next.js server
    // runtime. Avoid Next-only fetch options such as `next.revalidate` here.
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params.toString()}`)
    if (!res.ok) return null
    const data = (await res.json()) as {
      results?: Array<{
        id: number
        title: string
        release_date?: string
        poster_path?: string | null
        overview?: string
      }>
    }
    const hit = data.results?.[0]
    if (!hit) return null

    const releaseYear = hit.release_date ? Number(hit.release_date.slice(0, 4)) : null

    return {
      id: hit.id,
      title: hit.title,
      year: releaseYear,
      poster_url: hit.poster_path ? `${IMG_BASE}${hit.poster_path}` : null,
      overview: hit.overview ?? null,
    }
  } catch {
    return null
  }
}
