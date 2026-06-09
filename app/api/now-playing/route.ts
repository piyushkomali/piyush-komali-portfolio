import { NextResponse } from "next/server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const LASTFM_USERNAME = "piyushk12"

export async function GET() {
  const LASTFM_API_KEY = process.env.LASTFM_API_KEY

  if (!LASTFM_API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) {
      return NextResponse.json({ error: "Last.fm request failed" }, { status: res.status })
    }

    const data = await res.json()
    const tracks = data?.recenttracks?.track

    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ isPlaying: false, track: null })
    }

    const latest = Array.isArray(tracks) ? tracks[0] : tracks
    const isPlaying = latest["@attr"]?.nowplaying === "true"

    const track = {
      name: latest.name ?? "Unknown",
      artist: latest.artist?.["#text"] ?? "Unknown Artist",
      album: latest.album?.["#text"] ?? "",
      image:
        latest.image?.find((img: { size: string; "#text": string }) => img.size === "large")?.["#text"] ??
        latest.image?.[2]?.["#text"] ??
        null,
      url: latest.url ?? null,
      isPlaying,
    }

    return NextResponse.json(track, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
