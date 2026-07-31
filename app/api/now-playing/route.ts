import { NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const LASTFM_USERNAME = "piyushk12"
const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/"

type LastFmImage = { size: string; "#text": string }

function pickImage(images: LastFmImage[] | undefined): string | null {
  if (!images || images.length === 0) return null
  const large = images.find((img) => img.size === "large")?.["#text"]
  const extralarge = images.find((img) => img.size === "extralarge")?.["#text"]
  return extralarge || large || images[images.length - 1]?.["#text"] || null
}

export async function GET() {
  const LASTFM_API_KEY = process.env.LASTFM_API_KEY

  if (!LASTFM_API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  try {
    const recentUrl = `${LASTFM_BASE}?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=8`
    const topArtistsUrl = `${LASTFM_BASE}?method=user.gettopartists&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&period=1month&limit=5`
    const topAlbumsUrl = `${LASTFM_BASE}?method=user.gettopalbums&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&period=1month&limit=6`
    const userInfoUrl = `${LASTFM_BASE}?method=user.getinfo&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json`

    const [recentRes, topArtistsRes, topAlbumsRes, userInfoRes] = await Promise.all([
      fetch(recentUrl, { cache: "no-store" }),
      fetch(topArtistsUrl, { cache: "no-store" }),
      fetch(topAlbumsUrl, { cache: "no-store" }),
      fetch(userInfoUrl, { cache: "no-store" }),
    ])

    const recentData = recentRes.ok ? await recentRes.json() : null
    const topArtistsData = topArtistsRes.ok ? await topArtistsRes.json() : null
    const topAlbumsData = topAlbumsRes.ok ? await topAlbumsRes.json() : null
    const userInfoData = userInfoRes.ok ? await userInfoRes.json() : null

    // --- Recent tracks ---
    const rawTracks = recentData?.recenttracks?.track
    const tracksArr = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : []

    const recentTracks = tracksArr.map((t: {
      name?: string
      artist?: { "#text"?: string } | string
      album?: { "#text"?: string }
      image?: LastFmImage[]
      url?: string
      date?: { uts?: string; "#text"?: string }
      "@attr"?: { nowplaying?: string }
    }) => ({
      name: t.name ?? "Unknown",
      artist:
        typeof t.artist === "string"
          ? t.artist
          : t.artist?.["#text"] ?? "Unknown Artist",
      album: t.album?.["#text"] ?? "",
      image: pickImage(t.image),
      url: t.url ?? null,
      isPlaying: t["@attr"]?.nowplaying === "true",
      playedAt: t.date?.uts ? Number(t.date.uts) : null,
    }))

    const nowPlaying = recentTracks.find((t) => t.isPlaying) ?? null
    const lastTrack = recentTracks.find((t) => !t.isPlaying) ?? recentTracks[0] ?? null

    // --- Top artists ---
    const rawArtists = topArtistsData?.topartists?.artist
    const artistsArr = Array.isArray(rawArtists) ? rawArtists : rawArtists ? [rawArtists] : []
    const topArtists = artistsArr.map((a: {
      name?: string
      playcount?: string
      url?: string
      image?: LastFmImage[]
    }) => ({
      name: a.name ?? "Unknown Artist",
      playcount: Number(a.playcount ?? 0),
      url: a.url ?? null,
      image: pickImage(a.image),
    }))

    // --- Top albums ---
    const rawAlbums = topAlbumsData?.topalbums?.album
    const albumsArr = Array.isArray(rawAlbums) ? rawAlbums : rawAlbums ? [rawAlbums] : []
    const topAlbums = albumsArr.map((a: {
      name?: string
      artist?: { name?: string } | string
      playcount?: string
      url?: string
      image?: LastFmImage[]
    }) => ({
      name: a.name ?? "Unknown Album",
      artist:
        typeof a.artist === "string"
          ? a.artist
          : a.artist?.name ?? "Unknown Artist",
      playcount: Number(a.playcount ?? 0),
      url: a.url ?? null,
      image: pickImage(a.image),
    }))

    // --- User stats ---
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

    return NextResponse.json(
      {
        username: LASTFM_USERNAME,
        nowPlaying,
        lastTrack,
        recentTracks,
        topArtists,
        topAlbums,
        stats,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
