import { isAdmin } from "../../_shared/auth"
import { json } from "../../_shared/http"
import type { AppPagesFunction } from "../../types"

export const onRequest: AppPagesFunction = async (context) => {
  const pathname = new URL(context.request.url).pathname
  const normalizedPath = pathname.replace(/\/+$/, "") || "/"
  if (normalizedPath === "/api/admin/login" || (await isAdmin(context.request, context.env))) {
    return context.next()
  }
  return json({ error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 })
}
