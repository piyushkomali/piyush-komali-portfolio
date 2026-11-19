import { getLastFmDashboard, type LastFmCache } from "../../lib/lastfm"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export const onRequest: AppPagesFunction = async (context) => {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"])
  if (!context.env.LASTFM_API_KEY) {
    return json({ error: "Missing API key" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
  try {
    let cache: LastFmCache | undefined
    try {
      cache = await caches.open("portfolio-lastfm-v1")
    } catch {
      // Cache support is an optimization; direct fetching remains available.
    }
    const data = await getLastFmDashboard(context.env.LASTFM_API_KEY, cache ? {
      cache,
      origin: new URL(context.request.url).origin,
      waitUntil: (promise) => context.waitUntil(promise),
    } : undefined)
    return json(data, {
      headers: { "Cache-Control": "no-cache", "X-Music-Fetched-At": String(data.fetchedAt) },
    })
  } catch {
    console.error("lastfm_unavailable")
    return json({ error: "Internal server error" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
