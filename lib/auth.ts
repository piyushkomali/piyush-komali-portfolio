/**
 * Simple admin auth.
 *
 * - Single admin password stored in env var ADMIN_PASSWORD.
 * - On successful login, we set an HMAC-signed cookie.
 * - Middleware and route handlers verify the cookie.
 *
 * NOTE: Uses Web Crypto (subtle) so it works in both edge and node runtimes.
 */

export const ADMIN_COOKIE = "pk_admin"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ""
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : ""
  const b64 = s.replaceAll("-", "+").replaceAll("_", "/") + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return b64urlEncode(sig)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

/** Build a signed cookie value: `<payload_b64>.<sig_b64>`. Payload contains issued-at ms. */
export async function makeSessionCookie(secret: string): Promise<string> {
  if (!secret) throw new Error("ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) is not set")
  const payload = JSON.stringify({ iat: Date.now() })
  const payloadB64 = b64urlEncode(new TextEncoder().encode(payload))
  const sig = await hmac(secret, payloadB64)
  return `${payloadB64}.${sig}`
}

export async function verifySessionCookie(
  value: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!value) return false
  if (!secret) return false
  const parts = value.split(".")
  if (parts.length !== 2) return false
  const [payloadB64, sig] = parts
  try {
    const expected = await hmac(secret, payloadB64)
    if (!timingSafeEqual(sig, expected)) return false
    const payloadJson = new TextDecoder().decode(b64urlDecode(payloadB64))
    const payload = JSON.parse(payloadJson) as { iat?: number }
    if (!payload.iat) return false
    // Reject sessions older than max age
    if (Date.now() - payload.iat > COOKIE_MAX_AGE * 1000) return false
    return true
  } catch {
    return false
  }
}

export const COOKIE_OPTIONS = {
  name: ADMIN_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
}
