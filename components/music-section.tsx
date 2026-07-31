"use client"

import { useEffect, useRef, useState } from "react"

const INTER_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type Track = {
  name: string
  artist: string
  album: string
  image: string | null
  url: string | null
  isPlaying: boolean
  playedAt: number | null
}

type Artist = {
  name: string
  playcount: number
  url: string | null
  image: string | null
}

type Album = {
  name: string
  artist: string
  playcount: number
  url: string | null
  image: string | null
}

type Stats = {
  playcount: number
  artistCount: number
  albumCount: number
  trackCount: number
  profileUrl: string
}

type MusicData = {
  username: string
  nowPlaying: Track | null
  lastTrack: Track | null
  recentTracks: Track[]
  topArtists: Artist[]
  topAlbums: Album[]
  stats: Stats
}

const STORAGE_KEY = "lastfm-last-seen-track-v1"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function relativeTime(uts: number | null): string {
  if (!uts) return ""
  const now = Date.now() / 1000
  const diff = now - uts
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  const days = Math.floor(diff / 86400)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

/* --------------------------------------------------------------------- */
/* Sub-components                                                        */
/* --------------------------------------------------------------------- */

function AlbumArt({
  src,
  alt,
  size,
}: {
  src: string | null
  alt: string
  size: "sm" | "md" | "lg" | "xl"
}) {
  const [broken, setBroken] = useState(false)

  const dims: Record<typeof size, string> = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-full aspect-square",
  }

  const iconSize = size === "xl" ? 32 : size === "lg" ? 22 : 14

  return (
    <div
      className={`${dims[size]} rounded-[3px] overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex-shrink-0 flex items-center justify-center relative`}
    >
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </div>
  )
}

function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[color:var(--border)] mb-4">
      <h2 className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase">
        {children}
      </h2>
      {right && (
        <span className="text-[11px] text-[color:var(--muted-foreground)] tracking-wide">
          {right}
        </span>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Hero: Now Playing / Last Played                                       */
/* --------------------------------------------------------------------- */

function NowPlayingHero({ track }: { track: Track | null }) {
  if (!track) {
    return (
      <div className="rounded-[4px] border border-[#2a2a2a] bg-[#111111] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <AlbumArt src={null} alt="No track" size="lg" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-medium text-[#555] uppercase tracking-wider">
              Nothing scrobbled yet
            </span>
            <p className="text-[13px] text-[#666] mt-1">
              Once I play something on Spotify, it&apos;ll show up here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isLive = track.isPlaying

  return (
    <a
      href={track.url ?? "https://www.last.fm/user/piyushk12"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[4px] border border-[#2a2a2a] hover:border-[#444444] bg-[#111111] transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-stretch gap-4 sm:gap-5 p-4 sm:p-5">
        {/* Album art with soft glow when playing */}
        <div className="relative flex-shrink-0">
          {isLive && track.image && (
            <div
              aria-hidden
              className="absolute inset-0 rounded-[3px] blur-xl opacity-40 -z-0"
              style={{
                backgroundImage: `url(${track.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="relative z-10">
            <AlbumArt src={track.image} alt={track.album || track.name} size="lg" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#1DB954] uppercase tracking-[0.15em]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]"></span>
                </span>
                now playing
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#666] uppercase tracking-[0.15em]">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#444]" />
                last played
                {track.playedAt && (
                  <span className="normal-case tracking-normal text-[#555]">
                    · {relativeTime(track.playedAt)}
                  </span>
                )}
              </span>
            )}
          </div>

          <p className="text-[15px] sm:text-base font-semibold text-white leading-tight truncate">
            {track.name}
          </p>
          <p className="text-[13px] text-[#888] leading-tight truncate mt-1">
            {track.artist}
          </p>
          {track.album && (
            <p className="text-[11px] text-[#555] leading-tight truncate mt-1 italic">
              {track.album}
            </p>
          )}
        </div>
      </div>

      {/* Audio-bar decoration */}
      {isLive && (
        <div className="flex items-end gap-[3px] h-4 px-4 sm:px-5 pb-3">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <span
              key={i}
              className="flex-1 h-full bg-[#1DB954]/70 rounded-[1px] animate-eq"
              style={{
                animationDelay: `${(i % 4) * 0.15}s`,
                animationDuration: `${0.9 + (i % 3) * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </a>
  )
}

/* --------------------------------------------------------------------- */
/* Recent tracks                                                         */
/* --------------------------------------------------------------------- */

function RecentTracksList({ tracks }: { tracks: Track[] }) {
  if (tracks.length === 0) {
    return (
      <p className="text-sm text-[color:var(--muted-foreground)]">
        No recent scrobbles.
      </p>
    )
  }

  return (
    <ul className="space-y-1.5">
      {tracks.map((t, i) => (
        <li key={`${t.name}-${t.artist}-${i}`}>
          <a
            href={t.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-[3px] px-2 py-2 -mx-2 hover:bg-[#151515] transition-colors duration-150"
          >
            {/* Index or playing indicator */}
            <span className="w-4 flex-shrink-0 flex items-center justify-center">
              {t.isPlaying ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1DB954]"></span>
                </span>
              ) : (
                <span className="text-[10px] text-[#444] tabular-nums group-hover:text-[#666] transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
            </span>

            <AlbumArt src={t.image} alt={t.album || t.name} size="sm" />

            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white truncate leading-tight group-hover:text-white">
                {t.name}
              </p>
              <p className="text-[11px] text-[#666] truncate leading-tight mt-0.5">
                {t.artist}
              </p>
            </div>

            <span className="text-[10px] text-[#555] uppercase tracking-wider flex-shrink-0 tabular-nums hidden sm:block">
              {t.isPlaying ? "live" : relativeTime(t.playedAt)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/* --------------------------------------------------------------------- */
/* Top Artists                                                           */
/* --------------------------------------------------------------------- */

function TopArtistsList({ artists }: { artists: Artist[] }) {
  if (artists.length === 0) {
    return (
      <p className="text-sm text-[color:var(--muted-foreground)]">
        Not enough listening data yet.
      </p>
    )
  }

  const maxPlays = Math.max(...artists.map((a) => a.playcount), 1)

  return (
    <ul className="space-y-2">
      {artists.map((a, i) => {
        const pct = Math.max(6, Math.round((a.playcount / maxPlays) * 100))
        return (
          <li key={a.name}>
            <a
              href={a.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-[3px] px-2 py-2 -mx-2 hover:bg-[#151515] transition-colors duration-150"
            >
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[10px] text-[#444] tabular-nums w-4 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] text-white font-medium truncate flex-1 min-w-0">
                  {a.name}
                </span>
                <span className="text-[10px] text-[#666] tabular-nums flex-shrink-0 tracking-wide">
                  {formatNumber(a.playcount)} plays
                </span>
              </div>
              <div className="ml-6 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#333] to-[#666] group-hover:from-[#1DB954]/60 group-hover:to-[#1DB954] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/* --------------------------------------------------------------------- */
/* Top Albums grid                                                        */
/* --------------------------------------------------------------------- */

function TopAlbumsGrid({ albums }: { albums: Album[] }) {
  if (albums.length === 0) {
    return (
      <p className="text-sm text-[color:var(--muted-foreground)]">
        No top albums yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
      {albums.map((a) => (
        <a
          key={`${a.name}-${a.artist}`}
          href={a.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="relative">
            <AlbumArt src={a.image} alt={a.name} size="xl" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-[3px] flex items-end p-2 opacity-0 group-hover:opacity-100">
              <span className="text-[10px] text-white tabular-nums tracking-wide">
                {formatNumber(a.playcount)} plays
              </span>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-white leading-tight truncate">
            {a.name}
          </p>
          <p className="text-[11px] text-[#666] leading-tight truncate mt-0.5">
            {a.artist}
          </p>
        </a>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Stats strip                                                           */
/* --------------------------------------------------------------------- */

function StatsStrip({ stats }: { stats: Stats }) {
  const items = [
    { label: "scrobbles", value: formatNumber(stats.playcount) },
    { label: "artists", value: formatNumber(stats.artistCount) },
    { label: "albums", value: formatNumber(stats.albumCount) },
    { label: "tracks", value: formatNumber(stats.trackCount) },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {items.map((s) => (
        <div
          key={s.label}
          className="rounded-[3px] border border-[#2a2a2a] bg-[#111111] px-2 py-3 sm:px-3 sm:py-3 text-center"
        >
          <p className="text-base sm:text-lg font-semibold text-white tabular-nums leading-none">
            {s.value}
          </p>
          <p className="mt-1.5 text-[9px] sm:text-[10px] text-[#666] uppercase tracking-wider">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Skeleton                                                              */
/* --------------------------------------------------------------------- */

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-[120px] rounded-[4px] border border-[#2a2a2a] bg-[#111111]" />
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[62px] rounded-[3px] border border-[#2a2a2a] bg-[#111111]"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[52px] rounded-[3px] bg-[#111111]" />
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Main section                                                          */
/* --------------------------------------------------------------------- */

export function MusicSection() {
  const [data, setData] = useState<MusicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastSeenRef = useRef<Track | null>(null)

  // Load cached last-seen track for smoother transitions
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        lastSeenRef.current = JSON.parse(raw)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/now-playing?t=${Date.now()}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        setError("Couldn't reach Last.fm")
        return
      }
      const json = (await res.json()) as MusicData
      if ((json as unknown as { error?: string }).error) {
        setError("Couldn't reach Last.fm")
        return
      }

      // Cache the currently-playing track
      if (json.nowPlaying) {
        lastSeenRef.current = json.nowPlaying
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.nowPlaying))
        } catch {
          // ignore
        }
      }

      setError(null)
      setData(json)
    } catch {
      setError("Couldn't reach Last.fm")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  const heroTrack = data?.nowPlaying ?? data?.lastTrack ?? null

  return (
    <div className="max-w-xl" style={{ fontFamily: INTER_FONT }}>
      {/* Content */}
      <div>
        {loading && !data ? (
          <Skeleton />
        ) : error && !data ? (
          <div className="rounded-[4px] border border-[#2a2a2a] bg-[#111111] p-5 text-center">
            <p className="text-[13px] text-[#888]">{error}</p>
            <p className="text-[11px] text-[#555] mt-1">
              Try refreshing in a moment.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-10">
            {/* Hero */}
            <NowPlayingHero track={heroTrack} />

            {/* Stats */}
            <div>
              <SectionHeading right={`period · 1 month`}>Stats</SectionHeading>
              <StatsStrip stats={data.stats} />
            </div>

            {/* Recent tracks */}
            <div>
              <SectionHeading right={`${data.recentTracks.length} tracks`}>
                Recently Played
              </SectionHeading>
              <RecentTracksList
                tracks={data.recentTracks.slice(
                  data.nowPlaying ? 1 : 0,
                  data.nowPlaying ? 8 : 7
                )}
              />
            </div>

            {/* Top artists */}
            <div>
              <SectionHeading right="last 30 days">Top Artists</SectionHeading>
              <TopArtistsList artists={data.topArtists} />
            </div>

            {/* Top albums */}
            <div>
              <SectionHeading right="last 30 days">Top Albums</SectionHeading>
              <TopAlbumsGrid albums={data.topAlbums} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
