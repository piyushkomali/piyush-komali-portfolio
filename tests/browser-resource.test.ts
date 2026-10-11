import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createBrowserResource } from "@/lib/browser-resource"

const valid = (data: unknown): data is { title: string } =>
  typeof data === "object" && data !== null && "title" in data && typeof data.title === "string"

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  vi.stubGlobal("window", {})
  const saved = new Map<string, string>()
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

function resource(load = vi.fn(async () => ({ data: { title: "new" }, fetchedAt: Date.now() }))) {
  return { load, cache: createBrowserResource({ key: "test", freshness: 30_000, retention: 900_000, load, validate: valid }) }
}

describe("shared browser resource", () => {
  it("reuses an in-flight prefetch on mount, then skips fresh requests", async () => {
    let complete!: (value: { data: { title: string }; fetchedAt: number }) => void
    const load = vi.fn(() => new Promise<{ data: { title: string }; fetchedAt: number }>((resolve) => { complete = resolve }))
    const { cache } = resource(load)
    const prefetch = cache.refresh()
    expect(cache.refresh()).toBe(prefetch)
    complete({ data: { title: "prefetched" }, fetchedAt: Date.now() })
    await prefetch
    await cache.refresh()
    expect(load).toHaveBeenCalledOnce()
    expect(cache.getSnapshot().data?.title).toBe("prefetched")
    expect(JSON.parse(sessionStorage.getItem("test")!).data.title).toBe("prefetched")
  })

  it("restores stale session data immediately, preserves it on failure, and retries", async () => {
    sessionStorage.setItem("test", JSON.stringify({ data: { title: "saved" }, fetchedAt: 50_000 }))
    const load = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ data: { title: "updated" }, fetchedAt: 105_000 })
    const { cache } = resource(load)
    cache.restore()
    expect(cache.getSnapshot().data?.title).toBe("saved")
    await cache.refresh()
    expect(cache.getSnapshot()).toEqual({ data: { title: "saved" }, fetchedAt: 50_000, error: true })
    await cache.refresh()
    expect(load).toHaveBeenCalledOnce()
    vi.advanceTimersByTime(5_000)
    await cache.refresh()
    expect(cache.getSnapshot().data?.title).toBe("updated")
    expect(cache.getSnapshot().error).toBe(false)
  })

  it.each([
    "invalid JSON",
    JSON.stringify({ data: { wrong: true }, fetchedAt: 99_000 }),
    JSON.stringify({ data: { title: "expired" }, fetchedAt: -900_000 }),
    JSON.stringify({ data: { title: "future" }, fetchedAt: 200_000 }),
  ])("ignores invalid or expired persistence: %s", async (saved) => {
    sessionStorage.setItem("test", saved)
    const { cache, load } = resource()
    cache.restore()
    expect(cache.getSnapshot().data).toBeNull()
    await cache.refresh()
    expect(load).toHaveBeenCalledOnce()
  })

  it("works when browser storage is blocked", async () => {
    vi.stubGlobal("sessionStorage", { getItem: () => { throw Error() }, setItem: () => { throw Error() } })
    const { cache } = resource()
    await cache.refresh()
    expect(cache.getSnapshot()).toEqual({ data: { title: "new" }, fetchedAt: 100_000, error: false })
  })

  it("refreshes after 30 seconds without clearing successful data", async () => {
    const { cache, load } = resource()
    await cache.refresh()
    vi.advanceTimersByTime(30_000)
    const refreshing = cache.refresh()
    expect(cache.getSnapshot().data?.title).toBe("new")
    await refreshing
    expect(load).toHaveBeenCalledTimes(2)
  })
})

it("polling refreshes even if the prior slow response completed less than 30s ago", async () => {
  const { cache, load } = resource()
  await cache.refresh()
  vi.advanceTimersByTime(28_000)
  await cache.refresh(true)
  expect(load).toHaveBeenCalledTimes(2)
})
