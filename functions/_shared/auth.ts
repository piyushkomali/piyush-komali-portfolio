import { ADMIN_COOKIE, verifySessionCookie } from "../../lib/auth"
import type { Env } from "../types"

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") || ""
  for (const item of header.split(";")) {
    const [key, ...valueParts] = item.trim().split("=")
    if (key === name) return valueParts.join("=") || null
  }
  return null
}

export function sessionSecret(env: Env): string {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || ""
}

export async function isAdmin(request: Request, env: Env): Promise<boolean> {
  return verifySessionCookie(getCookie(request, ADMIN_COOKIE), sessionSecret(env))
}
