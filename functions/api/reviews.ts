import { createReviewRepository, type ReviewRepository } from "../../lib/db"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export async function handleReviewsRequest(
  request: Request,
  reviewRepository: Pick<ReviewRepository, "listReviews">,
): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"])
  try {
    const reviews = await reviewRepository.listReviews(200)
    return json(
      { reviews },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
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

export const onRequest: AppPagesFunction = (context) =>
  handleReviewsRequest(context.request, createReviewRepository(context.env.DATABASE_URL))
