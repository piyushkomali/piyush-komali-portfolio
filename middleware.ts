import { NextRequest, NextResponse } from "next/server"
import { verifySessionCookie, ADMIN_COOKIE } from "@/lib/auth"

/**
 * Gate everything under /admin, /api/admin, and /api/chat behind the
 * admin session cookie. The public site remains fully unauthenticated.
 *
 * Note: the login page and login API MUST be excluded so unauthed users
 * can actually log in.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page + login API without a session
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value
  const ok = await verifySessionCookie(cookie)
  if (ok) return NextResponse.next()

  // For UI routes, redirect to login and preserve `next` for post-login redirect
  if (pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // For API routes, return 401
  return NextResponse.json({ error: "unauthorized" }, { status: 401 })
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/chat/:path*"],
}
