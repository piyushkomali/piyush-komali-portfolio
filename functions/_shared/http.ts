export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json; charset=utf-8")
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function methodNotAllowed(allowed: string[]): Response {
  return json(
    { error: { code: "method_not_allowed", message: "Method not allowed" } },
    { status: 405, headers: { Allow: allowed.join(", ") } },
  )
}
