"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import type { createBrowserResource } from "./browser-resource"

export function usePageData<T>(resource: ReturnType<typeof createBrowserResource<T>>, poll?: number) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getServerSnapshot)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    resource.restore()
    const refresh = (force = false) => {
      setNow(Date.now())
      if (document.visibilityState === "visible") void resource.refresh(force)
    }
    const resume = () => refresh()
    refresh()
    window.addEventListener("focus", resume)
    document.addEventListener("visibilitychange", resume)
    const interval = poll ? window.setInterval(() => refresh(true), poll) : undefined
    return () => {
      window.removeEventListener("focus", resume)
      document.removeEventListener("visibilitychange", resume)
      window.clearInterval(interval)
    }
  }, [resource, poll])

  // Stop presenting a cached track as live exactly when its freshness expires,
  // even while a slow background request is still pending.
  useEffect(() => {
    if (!snapshot.data) return
    const delay = snapshot.fetchedAt + resource.freshness - Date.now()
    if (delay <= 0) { setNow(Date.now()); return }
    const timeout = window.setTimeout(() => setNow(Date.now()), delay + 1)
    return () => window.clearTimeout(timeout)
  }, [snapshot.fetchedAt, snapshot.data, resource])

  return { ...snapshot, stale: Math.max(now, Date.now()) - snapshot.fetchedAt >= resource.freshness }
}
