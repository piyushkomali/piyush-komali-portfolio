import { createReviewRepository, type ReviewRepository } from "../../lib/db"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export async function handleReviewsRequest(
  request: Request,
  reviewRepository: Pick<ReviewRepository, "listReviews">,
): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"])
  try {
    const started = performance.now()
    const reviews = await reviewRepository.listReviews(200)
    return json(
      { reviews },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          "X-Reviews-Fetched-At": String(Date.now()),
          "Server-Timing": `reviews-cache;desc="MISS", reviews-db;dur=${Math.round(performance.now() - started)}`,
        },
      },
    )
  } catch {
    console.error("reviews_unavailable")
    return json(
      {
        reviews: [],
        error: { code: "reviews_unavailable", message: "Reviews are temporarily unavailable" },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export const onRequest: AppPagesFunction = async (context) => {
  const { request, env } = context
  if (request.method !== "GET") return methodNotAllowed(["GET"])

  // This public collection is identical for every visitor. Scope the key to
  // this deployment's host and bypass the cache on platforms that lack it.
  const cacheKey = new Request(new URL("/_reviews-cache/v1", request.url))
  let cache: Cache | undefined
  try {
    cache = await globalThis.caches?.open("portfolio-reviews-v1")
    const hit = await cache?.match(cacheKey)
    if (hit) {
      const response = new Response(hit.body, hit)
      response.headers.set("Server-Timing", 'reviews-cache;desc="HIT"')
      return response
    }
  } catch {
    console.error("reviews_cache_read_failed")
  }

  const response = await handleReviewsRequest(request, createReviewRepository(env.DATABASE_URL))
  if (cache && response.ok) {
    context.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {
      console.error("reviews_cache_write_failed")
    }))
  }
  return response
}
