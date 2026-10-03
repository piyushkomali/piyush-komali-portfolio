import type { UIMessage } from "ai"

const CONFIRMATION_LIFETIME_MS = 10 * 60 * 1000
const TOKEN_PATTERN = /^([0-9a-f-]{36})\.(\d{13})\.([0-9a-f-]{36})\.([0-9a-f]{64})$/

async function confirmationKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function createDeleteConfirmation(id: string, secret: string): Promise<string> {
  if (!secret) throw new Error("Admin session secret is not configured")
  const expiresAt = Date.now() + CONFIRMATION_LIFETIME_MS
  const nonce = crypto.randomUUID()
  const payload = `${id}.${expiresAt}.${nonce}`
  const signature = await crypto.subtle.sign(
    "HMAC",
    await confirmationKey(secret),
    new TextEncoder().encode(payload),
  )
  return `CONFIRM DELETE ${payload}.${hex(signature)}`
}

export async function verifyDeleteConfirmation(
  message: string | null,
  id: string,
  secret: string,
): Promise<boolean> {
  if (!message || !secret || !message.startsWith("CONFIRM DELETE ")) return false
  const token = message.slice("CONFIRM DELETE ".length)
  const match = TOKEN_PATTERN.exec(token)
  if (!match) return false
  const [, confirmedId, expiry, nonce, signature] = match
  const expiresAt = Number(expiry)
  const now = Date.now()
  if (confirmedId !== id || expiresAt < now || expiresAt > now + CONFIRMATION_LIFETIME_MS) {
    return false
  }

  const signatureBytes = new Uint8Array(signature.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
  return crypto.subtle.verify(
    "HMAC",
    await confirmationKey(secret),
    signatureBytes,
    new TextEncoder().encode(`${confirmedId}.${expiry}.${nonce}`),
  )
}

export async function isConfirmedDeleteMessage(
  messages: UIMessage[],
  id: string,
  secret: string,
): Promise<boolean> {
  const latestMessage = messages.at(-1)
  if (latestMessage?.role !== "user" || latestMessage.parts.length !== 1) return false
  const part = latestMessage.parts[0]
  return part.type === "text" && verifyDeleteConfirmation(part.text, id, secret)
}
