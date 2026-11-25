import { getLastFmDashboard } from "../../lib/lastfm"
import { loadMusicDashboard } from "../../lib/music-dashboard"
import { createMusicSnapshotRepository } from "../../lib/music-snapshot"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export const onRequest: AppPagesFunction = async (context) => {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"])
  try {
    const data = await loadMusicDashboard(async () => {
      if (!context.env.LASTFM_API_KEY) throw new Error("Missing API key")
      // Fetch the whole suite together; never combine a failed suite with
      // individually cached sections from another request.
      return getLastFmDashboard(context.env.LASTFM_API_KEY)
    }, createMusicSnapshotRepository(context.env.DATABASE_URL), (promise) => context.waitUntil(promise))
    return json(data, {
      headers: { "Cache-Control": "no-cache", "X-Music-Fetched-At": String(data.fetchedAt) },
    })
  } catch {
    console.error("lastfm_unavailable")
    return json({ error: "Internal server error" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
