const LASTFM_USERNAME = "piyushk12"
const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/"

type LastFmImage = { size: string; "#text": string }
type LastFmPayload = Record<string, any>

function pickImage(images: LastFmImage[] | undefined): string | null {
  if (!images?.length) return null
  return (
    images.find((image) => image.size === "extralarge")?.["#text"] ||
    images.find((image) => image.size === "large")?.["#text"] ||
    images[images.length - 1]?.["#text"] ||
    null
  )
}

export type LastFmCache = Pick<Cache, "match" | "put">

export async function getLastFmDashboard(apiKey: string, caching?: {
  cache: LastFmCache
  origin: string
  waitUntil: (promise: Promise<unknown>) => void
}) {
  const requestUrl = (method: string, options: Record<string, string>) => {
    const params = new URLSearchParams({
      method,
      user: LASTFM_USERNAME,
      api_key: apiKey,
      format: "json",
      ...options,
    })
    return `${LASTFM_BASE}?${params}`
  }

  async function request(method: string, options: Record<string, string>, ttl: number) {
    // Cache keys contain no credentials and are isolated by deployment hostname.
    const key = new Request(`${caching?.origin ?? "https://cache.invalid"}/_lastfm-cache/v1/${LASTFM_USERNAME}/${method}`)
    if (caching) {
      try {
        const hit = await caching.cache.match(key)
        if (hit) return { payload: await hit.json() as LastFmPayload, fetchedAt: Number(hit.headers.get("X-Fetched-At")) }
      } catch {
        // A cache outage must not prevent a live request.
      }
    }
    const response = await fetch(requestUrl(method, options), { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error("Last.fm unavailable")
    const payload = await response.json() as LastFmPayload
    if (payload.error || !payload[method === "user.getrecenttracks" ? "recenttracks" : method === "user.gettopartists" ? "topartists" : "topalbums"]) {
      throw new Error("Invalid Last.fm response")
    }
    const fetchedAt = Date.now()
    if (caching) {
      const stored = new Response(JSON.stringify(payload), { headers: {
        "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttl}`, "X-Fetched-At": String(fetchedAt),
      } })
      caching.waitUntil(caching.cache.put(key, stored).catch(() => { console.error("lastfm_cache_write_failed") }))
    }
    return { payload, fetchedAt }
  }

  const [recent, artists, albums] = await Promise.all([
    request("user.getrecenttracks", { limit: "8" }, 15),
    request("user.gettopartists", { period: "1month", limit: "5" }, 600),
    request("user.gettopalbums", { period: "1month", limit: "6" }, 600),
  ])
  const recentData = recent.payload
  const topArtistsData = artists.payload
  const topAlbumsData = albums.payload

  const asArray = <T>(value: T | T[] | undefined): T[] =>
    Array.isArray(value) ? value : value ? [value] : []

  const recentTracks = asArray<any>(recentData?.recenttracks?.track).map((track) => ({
    name: track.name ?? "Unknown",
    artist:
      typeof track.artist === "string"
        ? track.artist
        : track.artist?.["#text"] ?? "Unknown Artist",
    album: track.album?.["#text"] ?? "",
    image: pickImage(track.image),
    url: track.url ?? null,
    isPlaying: track["@attr"]?.nowplaying === "true",
    playedAt: track.date?.uts ? Number(track.date.uts) : null,
  }))

  const topArtists = asArray<any>(topArtistsData?.topartists?.artist).map((artist) => ({
    name: artist.name ?? "Unknown Artist",
    playcount: Number(artist.playcount ?? 0),
    url: artist.url ?? null,
    image: pickImage(artist.image),
  }))

  const topAlbums = asArray<any>(topAlbumsData?.topalbums?.album).map((album) => ({
    name: album.name ?? "Unknown Album",
    artist:
      typeof album.artist === "string"
        ? album.artist
        : album.artist?.name ?? "Unknown Artist",
    playcount: Number(album.playcount ?? 0),
    url: album.url ?? null,
    image: pickImage(album.image),
  }))

  return {
    username: LASTFM_USERNAME,
    nowPlaying: recentTracks.find((track) => track.isPlaying) ?? null,
    lastTrack: recentTracks.find((track) => !track.isPlaying) ?? recentTracks[0] ?? null,
    recentTracks,
    topArtists,
    topAlbums,
    fetchedAt: recent.fetchedAt,
  }
}
