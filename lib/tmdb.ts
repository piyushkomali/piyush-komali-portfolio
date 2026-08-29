/**
 * Minimal TMDB helper. Uses TMDB v3 API with an API key.
 * Free key: https://www.themoviedb.org/settings/api
 *
 * Requires env var: TMDB_API_KEY (v3 key, NOT the read-access token)
 */

export type TmdbMovie = {
  id: number
  title: string
  year: number | null
  poster_url: string | null
  overview: string | null
}

const IMG_BASE = "https://image.tmdb.org/t/p/w300"

export async function searchMovie(query: string, year?: number | null): Promise<TmdbMovie | null> {
  const key = process.env.TMDB_API_KEY
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
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params.toString()}`, {
      // Server-side, revalidate frequently — posters basically never change per movie.
      next: { revalidate: 60 * 60 * 24 },
    })
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
