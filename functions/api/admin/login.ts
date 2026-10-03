import { ADMIN_COOKIE, COOKIE_OPTIONS, makeSessionCookie } from "../../../lib/auth"
import { sessionSecret } from "../../_shared/auth"
import { json, methodNotAllowed } from "../../_shared/http"
import type { AppPagesFunction } from "../../types"

function cookie(value: string, maxAge: number): string {
  return [
    `${ADMIN_COOKIE}=${value}`,
    `Max-Age=${maxAge}`,
    `Path=${COOKIE_OPTIONS.path}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ")
}

export const onRequest: AppPagesFunction = async (context) => {
  if (context.request.method === "DELETE") {
    return json(
      { ok: true },
      { headers: { "Set-Cookie": cookie("", 0) } },
    )
  }
  if (context.request.method !== "POST") return methodNotAllowed(["POST", "DELETE"])

  if (!context.env.ADMIN_PASSWORD) {
    return json(
      { error: "Server misconfigured: ADMIN_PASSWORD not set" },
      { status: 500 },
    )
  }

  let body: { password?: string }
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "invalid body" }, { status: 400 })
  }

  if (!body.password || body.password !== context.env.ADMIN_PASSWORD) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return json({ error: "invalid password" }, { status: 401 })
  }

  const value = await makeSessionCookie(sessionSecret(context.env))
  return json(
    { ok: true },
    { headers: { "Set-Cookie": cookie(value, COOKIE_OPTIONS.maxAge) } },
  )
}
