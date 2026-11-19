import { z } from "zod"
import { createBrowserResource } from "./browser-resource"
import { tmdbPosterVariants } from "./poster-images"
import type { MusicData } from "./music-types"
import type { ApiReview } from "./review-types"

const track = z.object({
  name: z.string(), artist: z.string(), album: z.string(), image: z.string().nullable(),
  url: z.string().nullable(), isPlaying: z.boolean(), playedAt: z.number().nullable(),
})
const artist = z.object({ name: z.string(), playcount: z.number(), url: z.string().nullable(), image: z.string().nullable() })
const musicSchema = z.object({
  username: z.string(), nowPlaying: track.nullable(), lastTrack: track.nullable(),
  recentTracks: z.array(track), topArtists: z.array(artist),
  topAlbums: z.array(artist.extend({ artist: z.string() })),
})
const reviewSchema = z.object({
  id: z.string(), title: z.string(), year: z.number().nullable(), poster_url: z.string().nullable(),
  rating: z.coerce.number(), liked: z.boolean(), rewatch: z.boolean(), review: z.string().nullable(),
  watched_on: z.string(), tags: z.array(z.string()), letterboxd_url: z.string().nullable(),
  tmdb_id: z.number().nullable(), created_at: z.string(),
})
const reviewsSchema = z.object({ reviews: z.array(reviewSchema) })

async function load<T>(url: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  const response = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error("API unavailable")
  const data = schema.parse(await response.json())
  const originTime = Number(response.headers.get("X-Music-Fetched-At"))
  const fetchedAt = originTime > 0 && originTime <= Date.now() ? originTime : Date.now()
  return { data, fetchedAt }
}

// Browser image caching uses the same responsive source selection as the page.
function warmImage(src: string | null, poster = false) {
  if (!src || typeof Image === "undefined") return
  const image = new Image()
  const variants = poster ? tmdbPosterVariants(src) : null
  if (variants) {
    image.sizes = "(max-width: 480px) 50px, 60px"
    image.srcset = `${variants.small} 92w, ${variants.medium} 154w, ${variants.large} 185w`
  }
  image.src = variants?.medium ?? src
}

export const musicResource = createBrowserResource<MusicData>({
  key: "portfolio-music-v1", freshness: 30_000, retention: 15 * 60_000,
  load: () => load("/api/now-playing", musicSchema),
  validate: (data): data is MusicData => musicSchema.safeParse(data).success,
  warm: (data) => {
    warmImage((data.nowPlaying ?? data.lastTrack)?.image ?? null)
    data.topAlbums.slice(0, 3).forEach((album) => warmImage(album.image))
  },
})
export const reviewsResource = createBrowserResource<{ reviews: ApiReview[] }>({
  key: "portfolio-reviews-v1", freshness: 5 * 60_000, retention: 24 * 60 * 60_000,
  load: () => load("/api/reviews", reviewsSchema),
  validate: (data): data is { reviews: ApiReview[] } => reviewsSchema.safeParse(data).success,
  warm: (data) => data.reviews.slice(0, 5).forEach((review) => warmImage(review.poster_url, true)),
})

export function prefetchPage(href: string) {
  if (document.visibilityState !== "visible") return
  if (href === "/music") void musicResource.refresh()
  if (href === "/reviews") void reviewsResource.refresh()
}
