import { afterEach, describe, expect, it, vi } from "vitest"
import { getLastFmDashboard } from "@/lib/lastfm"

const responses: Record<string, unknown> = {
  "user.getrecenttracks": { recenttracks: { track: [{ name: "Song", artist: { "#text": "Artist" }, "@attr": { nowplaying: "true" } }] } },
  "user.gettopartists": { topartists: { artist: [] } },
  "user.gettopalbums": { topalbums: { album: [] } },
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

it("caches recent tracks for 15s and rankings for 10m, without caching credentials", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(100_000)
  const fetcher = vi.fn(async (url: string) => Response.json(responses[new URL(url).searchParams.get("method")!]))
  vi.stubGlobal("fetch", fetcher)
  const entries = new Map<string, { response: Response; expires: number }>()
  const cache = {
    match: vi.fn(async (key: RequestInfo | URL) => {
      const saved = entries.get((key as Request).url)
      return saved && saved.expires > Date.now() ? saved.response.clone() : undefined
    }),
    put: vi.fn(async (key: RequestInfo | URL, response: Response) => {
      expect((key as Request).url).not.toContain("test-secret")
      const ttl = Number(response.headers.get("Cache-Control")!.split("=")[1])
      entries.set((key as Request).url, { response: response.clone(), expires: Date.now() + ttl * 1000 })
    }),
  }
  const work: Promise<unknown>[] = []
  const caching = { cache, origin: "https://example.com", waitUntil: (promise: Promise<unknown>) => { work.push(promise) } }
  const first = await getLastFmDashboard("test-secret", caching)
  await Promise.all(work)
  expect(first.nowPlaying?.name).toBe("Song")
  expect(fetcher).toHaveBeenCalledTimes(3)
  vi.advanceTimersByTime(10_000)
  const hit = await getLastFmDashboard("test-secret", caching)
  expect(hit.fetchedAt).toBe(100_000)
  expect(fetcher).toHaveBeenCalledTimes(3)
  vi.advanceTimersByTime(6_000)
  await getLastFmDashboard("test-secret", caching)
  await Promise.all(work)
  expect(fetcher).toHaveBeenCalledTimes(4)
  expect(new URL(fetcher.mock.calls[3][0]).searchParams.get("method")).toBe("user.getrecenttracks")
})

describe("Last.fm upstream failures", () => {
  it.each([Response.json({ error: 29 }), new Response("unavailable", { status: 503 })])("does not cache upstream errors", async (failure) => {
    vi.stubGlobal("fetch", vi.fn(async () => failure.clone()))
    const cache = { match: vi.fn(async () => undefined), put: vi.fn() }
    await expect(getLastFmDashboard("secret", { cache, origin: "https://example.com", waitUntil: vi.fn() })).rejects.toThrow()
    expect(cache.put).not.toHaveBeenCalled()
  })

  it("falls back to upstream if the cache is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(responses[new URL(url).searchParams.get("method")!])))
    const cache = { match: vi.fn(async () => { throw Error() }), put: vi.fn(async () => {}) }
    const work: Promise<unknown>[] = []
    const data = await getLastFmDashboard("secret", { cache, origin: "https://example.com", waitUntil: (promise) => { work.push(promise) } })
    await Promise.all(work)
    expect(data.nowPlaying?.name).toBe("Song")
  })
})
