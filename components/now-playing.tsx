"use client"

import { useEffect, useRef, useState } from "react"

interface Track {
  name: string
  artist: string
  album: string
  image: string | null
  url: string | null
  isPlaying: boolean
}

const STORAGE_KEY = "lastfm-last-seen-track-v1"

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const lastSeenRef = useRef<Track | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) lastSeenRef.current = JSON.parse(raw) as Track
    } catch {}
  }, [])

  const fetchTrack = async () => {
    try {
      const res = await fetch(`/api/now-playing?t=${Date.now()}`, {
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()

      if (data && data.name) {
        const incoming: Track = data
        if (incoming.isPlaying) {
          lastSeenRef.current = incoming
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming))
          } catch {}
          setTrack(incoming)
          return
        }

        const cached = lastSeenRef.current
        if (
          cached &&
          (cached.name !== incoming.name || cached.artist !== incoming.artist)
        ) {
          setTrack({ ...cached, isPlaying: false })
          return
        }

        setTrack(incoming)
      } else {
        const cached = lastSeenRef.current
        if (cached) setTrack({ ...cached, isPlaying: false })
        else setTrack(null)
      }
    } catch {
      // keep previous
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrack()
    const interval = setInterval(fetchTrack, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !track) return null

  return (
    <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
      <a
        href={track.url ?? "https://www.last.fm/user/piyushk12"}
        target="_blank"
        rel="noopener noreferrer"
        className="micro group flex items-center gap-3 hairline rounded-[6px] bg-bg/80 backdrop-blur px-2.5 py-2 max-w-[280px] hover:border-border-strong"
        aria-label={`${track.isPlaying ? "Now playing" : "Last played"}: ${track.name} by ${track.artist}`}
      >
        {track.image ? (
          <img
            src={track.image}
            alt=""
            className="w-8 h-8 rounded-[4px] object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-[4px] bg-hover flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {track.isPlaying ? (
              <span className="meta flex items-center gap-1.5" style={{ fontSize: 10 }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22c55e]"></span>
                </span>
                Now Playing
              </span>
            ) : (
              <span className="meta" style={{ fontSize: 10 }}>Last Played</span>
            )}
          </div>
          <p className="text-[12.5px] text-fg truncate leading-tight">
            {track.name}
          </p>
          <p className="text-[11px] text-muted truncate leading-tight mt-0.5">
            {track.artist}
          </p>
        </div>
      </a>
    </div>
  )
}
