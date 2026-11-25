import type { UIMessage } from "ai"

const catalogFollowUps = new Set([
  "is that all", "is that all of them", "thats all of them", "that's all of them",
  "are these all", "are those all", "are these all of them", "are those all of them",
  "show me all", "show all", "show me all of them", "show all of them",
  "show me the rest", "show the rest", "all of them", "what about the rest",
])

const inventoryQuestions = [
  /^(?:show|list|display|give)(?: me)? (?:all(?: of)? )?(?:(?:the|my) )?(?:movies|films|reviews)(?: here| in (?:the |my |your )?(?:database|db|catalog))?(?: not just \d+)?$/,
  /^what (?:movies|films|reviews) (?:are (?:here|there|saved)|do (?:i|you|we) have|are in (?:the |my |your )?(?:database|db|catalog))$/,
  /^how many (?:movies|films|reviews)(?: are (?:here|there|saved)| do (?:i|you|we) have| are in (?:the |my |your )?(?:database|db|catalog))?$/,
]

/** Match complete inventory requests without intercepting imports or title-specific questions. */
export function catalogRequest(text: string, hasCatalogHistory: boolean): { limit?: number } | null {
  const normalized = text.toLowerCase().trim().replace(/[?!.]+$/g, "").replace(/\s+/g, " ")
    .replace(/^please /, "").replace(/ please$/, "")
  if (hasCatalogHistory && catalogFollowUps.has(normalized)) return {}
  if (inventoryQuestions.some((question) => question.test(normalized))) return {}

  const limited = /^(?:show|list|display|give)(?: me)?(?: the)? (?:latest|last|most recent) (\d+) (?:movies|films|reviews)$/.exec(normalized)
  if (!limited) return null
  const limit = Number(limited[1])
  return Number.isSafeInteger(limit) && limit > 0 && limit <= 500 ? { limit } : null
}

export function hasCatalogResult(messages: UIMessage[]): boolean {
  return messages.some((message) => message.role === "assistant" && message.parts.some((part) => part.type === "tool-listReviews"))
}

/** Old catalog rows are snapshots. Keep them out of subsequent model context. */
export function withoutCatalogRows(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map((part) => {
      if (part.type !== "tool-listReviews" || !("state" in part) || part.state !== "output-available") return part
      return { ...part, output: { instruction: "A catalog was displayed earlier. Call listReviews again for current rows and counts." } }
    }),
  }))
}
