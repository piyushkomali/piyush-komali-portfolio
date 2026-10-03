import { createReviewRepository } from "../../../lib/db"
import { json, methodNotAllowed } from "../../_shared/http"
import type { AppPagesFunction } from "../../types"

export const onRequest: AppPagesFunction = async (context) => {
  const reviewRepository = createReviewRepository(context.env.DATABASE_URL)
  if (context.request.method === "GET") {
    const reviews = await reviewRepository.listReviews(500)
    return json({ reviews }, { headers: { "Cache-Control": "no-store" } })
  }
  if (context.request.method === "DELETE") {
    const id = new URL(context.request.url).searchParams.get("id")
    if (!id) return json({ error: "id required" }, { status: 400 })
    const ok = await reviewRepository.deleteReview(id)
    return json({ ok })
  }
  return methodNotAllowed(["GET", "DELETE"])
}
