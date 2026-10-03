import { isAdmin } from "../_shared/auth"
import type { AppPagesFunction } from "../types"

export const onRequest: AppPagesFunction<"path"> = async (context) => {
  const pathname = new URL(context.request.url).pathname
  const normalizedPath = pathname.replace(/\/+$/, "") || "/"
  if (normalizedPath === "/admin/login" || (await isAdmin(context.request, context.env))) {
    return context.next()
  }

  const login = new URL("/admin/login", context.request.url)
  login.searchParams.set("next", pathname)
  return Response.redirect(login, 302)
}
