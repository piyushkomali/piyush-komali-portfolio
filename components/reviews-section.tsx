"use client"

import { useState } from "react"
import { Star, StarHalf } from "lucide-react"

import type { ApiReview } from "@/lib/review-types"
import { reviewsResource } from "@/lib/page-data"
import { usePageData } from "@/lib/use-page-data"
import { tmdbPosterVariants } from "@/lib/poster-images"

const INTER_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type DisplayReview = {
  id: string
  title: string
  poster: string
  rating: number
  snippet: string
  month: string
  year: number
  day: number
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function toDisplay(r: ApiReview): DisplayReview {
  const [y, m, d] = r.watched_on.split("-").map((n) => Number.parseInt(n, 10))
  return {
    id: r.id,
    title: r.title,
    poster: r.poster_url || "",
    rating: Number(r.rating),
    snippet: r.review || "",
    month: MONTHS[Math.max(0, Math.min(11, (m || 1) - 1))],
    year: y,
    day: d || 1,
  }
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const empties = 5 - full - (hasHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-[2px]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="w-3 h-3 text-white" fill="currentColor" strokeWidth={0} />
      ))}
      {hasHalf && (
        <div className="relative w-3 h-3">
          <Star className="absolute inset-0 w-3 h-3 text-white/15" fill="currentColor" strokeWidth={0} />
          <StarHalf className="absolute inset-0 w-3 h-3 text-white" fill="currentColor" strokeWidth={0} />
        </div>
      )}
      {Array.from({ length: empties }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-3 h-3 text-white/15" fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  )
}

function PosterImage({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  const [broken, setBroken] = useState(false)
  const variants = tmdbPosterVariants(src)

  return (
    <div className="shrink-0 w-[60px] h-[90px] max-[480px]:w-[50px] max-[480px]:h-[75px] rounded-[3px] overflow-hidden bg-[color:var(--muted)] border border-[color:var(--border)]">
      {!broken && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={variants?.medium ?? src}
          srcSet={variants ? `${variants.small} 92w, ${variants.medium} 154w, ${variants.large} 185w` : undefined}
          sizes={variants ? "(max-width: 480px) 50px, 60px" : undefined}
          alt={alt}
          width={60}
          height={90}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  )
}

function DateMarker({ label, muted }: { label: string; muted: boolean }) {
  return (
    <div
      className={`w-14 shrink-0 pt-1 text-[11px] leading-none tracking-wider uppercase text-right pr-1 ${
        muted ? "text-[color:var(--muted-foreground)]" : "text-white font-bold"
      }`}
      style={{ fontFamily: INTER_FONT }}
    >
      {label}
    </div>
  )
}

export function ReviewsSection() {
  const { data, error } = usePageData(reviewsResource)
  const reviews = data ? data.reviews.map(toDisplay) : error ? [] : null
  const errored = !!error

  // Compute date markers: first entry per month and year gets a period label, subsequent entries get a day number.
  const list = reviews ?? []
  const markers: { label: string; muted: boolean }[] = []
  let currentPeriod = ""
  for (const r of list) {
    const period = `${r.month} ${r.year}`
    if (period !== currentPeriod) {
      markers.push({ label: period, muted: false })
      currentPeriod = period
    } else {
      markers.push({ label: String(r.day), muted: true })
    }
  }

  return (
    <div className="max-w-xl" style={{ fontFamily: INTER_FONT }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[color:var(--border)]">
        <h2 className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase">
          Recent Reviews
        </h2>
        <span className="text-[11px] text-[color:var(--muted-foreground)] tracking-wide">
          {reviews === null ? "…" : `${list.length} reviews`}
        </span>
      </div>

      {/* List */}
      {errored && list.length > 0 && (
        <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
          Reviews unavailable right now. Showing the last loaded results.
        </p>
      )}
      {reviews === null ? (
        <p className="mt-6 text-sm text-[color:var(--muted-foreground)]">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-sm text-[color:var(--muted-foreground)]">
          {errored ? "Reviews unavailable right now." : "No reviews yet."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((review, i) => {
            const marker = markers[i]
            return (
              <li key={review.id} className="flex items-start gap-2">
                <DateMarker label={marker.label} muted={marker.muted} />

                <div className="flex-1 min-w-0">
                  <div className="group flex items-center gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--accent)] px-3 py-2 max-[480px]:px-2 max-[480px]:py-1.5 transition-colors duration-150 hover:border-[color:var(--muted-foreground)]">
                    <PosterImage src={review.poster} alt={review.title} eager={i < 5} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-[13px] max-[480px]:text-[12px] font-semibold text-white truncate">
                          {review.title}
                        </h3>
                        <Stars rating={review.rating} />
                      </div>

                      <p
                        className="mt-1 text-[12px] max-[480px]:text-[11px] leading-snug text-[color:var(--muted-foreground)] whitespace-nowrap overflow-hidden"
                        style={{
                          maskImage: "linear-gradient(to right, black 60%, transparent 95%)",
                          WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 95%)",
                        }}
                      >
                        {review.snippet}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
