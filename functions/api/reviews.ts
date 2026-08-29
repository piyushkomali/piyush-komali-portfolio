import { listReviews } from "../../lib/db"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export async function handleReviewsRequest(
  request: Request,
  databaseUrl: string,
  loadReviews: typeof listReviews = listReviews,
): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"])
  try {
    const reviews = await loadReviews(databaseUrl, 200)
    return json(
      { reviews },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
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
  handleReviewsRequest(context.request, context.env.DATABASE_URL)
