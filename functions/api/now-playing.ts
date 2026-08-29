import { getLastFmDashboard } from "../../lib/lastfm"
import { json, methodNotAllowed } from "../_shared/http"
import type { AppPagesFunction } from "../types"

export const onRequest: AppPagesFunction = async (context) => {
  if (context.request.method !== "GET") return methodNotAllowed(["GET"])
  if (!context.env.LASTFM_API_KEY) {
    return json({ error: "Missing API key" }, { status: 500 })
  }
  try {
    return json(await getLastFmDashboard(context.env.LASTFM_API_KEY), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    console.error("lastfm_unavailable", error)
    return json({ error: "Internal server error" }, { status: 500 })
  }
}
