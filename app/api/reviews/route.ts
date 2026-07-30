import { NextResponse } from "next/server"
import { ensureSchema, listReviews } from "@/lib/db"

// Public read-only endpoint. No auth. Used by the /reviews page.
export const runtime = "nodejs"
export const revalidate = 60 // ISR-ish: cache for 60s at the edge

export async function GET() {
  try {
    await ensureSchema()
    const reviews = await listReviews(200)
    return NextResponse.json(
      { reviews },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    )
  } catch (e) {
    return NextResponse.json(
      {
        reviews: [],
        error:
          e instanceof Error
            ? e.message
            : "Failed to load reviews (DATABASE_URL not configured?)",
      },
      { status: 200 }, // don't break the public page — just show empty
    )
  }
}
