"use client"

import { useEffect, useState } from "react"

interface Track {
  name: string
  artist: string
  album: string
  image: string | null
  url: string | null
  isPlaying: boolean
}

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTrack = async () => {
    try {
      const res = await fetch("/api/now-playing")
      if (!res.ok) return
      const data = await res.json()
      if (data.name) {
        setTrack(data)
      } else {
        setTrack(null)
      }
    } catch {
      setTrack(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrack()
    const interval = setInterval(fetchTrack, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return null
  if (!track) return null

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <a
        href={track.url ?? "https://www.last.fm/user/piyushk12"}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-[#111111] border border-[#2a2a2a] hover:border-[#444444] transition-all duration-200 px-3.5 py-2.5 rounded-[4px] max-w-[260px]"
      >
        {/* Album art */}
        {track.image ? (
          <img
            src={track.image}
            alt={track.album}
            className="w-9 h-9 rounded-[3px] object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-[3px] bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {track.isPlaying ? (
              <span className="flex items-center gap-1 text-[10px] font-medium text-[#888] uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]"></span>
                </span>
                now playing
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[#555] uppercase tracking-wider">last played</span>
            )}
          </div>
          <p className="text-[13px] font-medium text-white truncate leading-tight">{track.name}</p>
          <p className="text-[11px] text-[#666] truncate leading-tight mt-0.5">{track.artist}</p>
        </div>
      </a>
    </div>
  )
}
