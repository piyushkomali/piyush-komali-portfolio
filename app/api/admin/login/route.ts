import { NextRequest, NextResponse } from "next/server"
import { makeSessionCookie, COOKIE_OPTIONS } from "@/lib/auth"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: "Server misconfigured: ADMIN_PASSWORD not set" },
      { status: 500 },
    )
  }

  let body: { password?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  if (!body.password || body.password !== expected) {
    // Tiny artificial delay to blunt brute-force
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: "invalid password" }, { status: 401 })
  }

  const value = await makeSessionCookie()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_OPTIONS.name, value, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    sameSite: COOKIE_OPTIONS.sameSite,
    secure: COOKIE_OPTIONS.secure,
    path: COOKIE_OPTIONS.path,
    maxAge: COOKIE_OPTIONS.maxAge,
  })
  return res
}

export async function DELETE() {
  // Logout
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_OPTIONS.name, "", {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    sameSite: COOKIE_OPTIONS.sameSite,
    secure: COOKIE_OPTIONS.secure,
    path: COOKIE_OPTIONS.path,
    maxAge: 0,
  })
  return res
}
