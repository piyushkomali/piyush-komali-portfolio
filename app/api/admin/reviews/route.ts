import { NextRequest, NextResponse } from "next/server"
import { deleteReview, ensureSchema, listReviews } from "@/lib/db"

// Admin routes: gated by middleware (require admin cookie).
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  await ensureSchema()
  const reviews = await listReviews(500)
  return NextResponse.json({ reviews })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await ensureSchema()
  const ok = await deleteReview(id)
  return NextResponse.json({ ok })
}
