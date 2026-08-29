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

export async function getLastFmDashboard(apiKey: string) {
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

  const responses = await Promise.all([
    fetch(requestUrl("user.getrecenttracks", { limit: "8" })),
    fetch(requestUrl("user.gettopartists", { period: "1month", limit: "5" })),
    fetch(requestUrl("user.gettopalbums", { period: "1month", limit: "6" })),
    fetch(requestUrl("user.getinfo", {})),
  ])
  const [recentData, topArtistsData, topAlbumsData, userInfoData] = (await Promise.all(
    responses.map(async (response) => (response.ok ? response.json() : null)),
  )) as Array<LastFmPayload | null>

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

  const user = userInfoData?.user
  const stats = user
    ? {
        playcount: Number(user.playcount ?? 0),
        artistCount: Number(user.artist_count ?? 0),
        albumCount: Number(user.album_count ?? 0),
        trackCount: Number(user.track_count ?? 0),
        profileUrl: user.url ?? `https://www.last.fm/user/${LASTFM_USERNAME}`,
      }
    : {
        playcount: 0,
        artistCount: 0,
        albumCount: 0,
        trackCount: 0,
        profileUrl: `https://www.last.fm/user/${LASTFM_USERNAME}`,
      }

  return {
    username: LASTFM_USERNAME,
    nowPlaying: recentTracks.find((track) => track.isPlaying) ?? null,
    lastTrack: recentTracks.find((track) => !track.isPlaying) ?? recentTracks[0] ?? null,
    recentTracks,
    topArtists,
    topAlbums,
    stats,
  }
}
