"use client"

import { useState } from "react"
import { Star, StarHalf } from "lucide-react"

import { PRIORITY_REVIEW_POSTERS, type ApiReview } from "@/lib/review-types"
import { reviewsResource } from "@/lib/page-data"
import { usePageData } from "@/lib/use-page-data"
import { tmdbPosterVariants } from "@/lib/poster-images"

const INTER_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const POSTER_CLASS = "shrink-0 w-[60px] h-[90px] max-[480px]:w-[50px] max-[480px]:h-[75px] rounded-[3px] overflow-hidden bg-muted border"
const CARD_CLASS = "flex flex-1 min-w-0 items-center gap-3 rounded-md border bg-accent px-3 py-2 max-[480px]:px-2 max-[480px]:py-1.5"

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
    <div className={POSTER_CLASS}>
      {!broken && src ? (
        // Set loading and sizes before selecting the image source.
        // oxlint-disable-next-line nextjs/no-img-element -- Responsive TMDB variants are selected directly by the browser.
        <img
          loading={eager ? "eager" : "lazy"}
          sizes={variants ? "(max-width: 480px) 50px, 60px" : undefined}
          srcSet={variants ? `${variants.small} 92w, ${variants.medium} 154w, ${variants.large} 185w` : undefined}
          src={variants?.medium ?? src}
          alt={alt}
          width={60}
          height={90}
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="flex h-full items-center justify-center px-0.5 text-center text-[7px] leading-tight text-[color:var(--muted-foreground)]">
          <span aria-hidden="true">No poster</span>
          <span className="sr-only">{alt} poster unavailable</span>
        </span>
      )}
    </div>
  )
}

function DateMarker({ label, muted }: { label: string; muted: boolean }) {
  return (
    <div
      className={`w-14 shrink-0 text-[11px] leading-6 tracking-wider uppercase whitespace-nowrap ${
        muted ? "text-muted-foreground text-right pr-1" : "text-white font-bold"
      }`}
    >
      {label}
    </div>
  )
}

function ReviewsPlaceholder() {
  return (
    <div aria-hidden="true" className="reviews-placeholder">
      <ul className="space-y-2 motion-safe:animate-pulse">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-14 shrink-0 pt-2">
              <div className={`h-2 rounded bg-white/10 ${i === 0 ? "w-12" : "ml-auto mr-1 w-3"}`} />
            </div>
            <div className={CARD_CLASS}>
              <div className={POSTER_CLASS} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded bg-white/10" />
                <div className="h-2 w-2/3 rounded bg-white/5" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ReviewsSection() {
  const { data, error } = usePageData(reviewsResource)
  const list = data?.reviews.map(toDisplay) ?? []
  const loading = !data && !error

  return (
    <section aria-labelledby="reviews-heading" aria-busy={loading} className="max-w-xl" style={{ fontFamily: INTER_FONT }}>
      <h2 id="reviews-heading" className="sr-only">Reviews</h2>
      {error && list.length > 0 && (
        <p className="mb-4 text-xs text-muted-foreground">
          Reviews unavailable right now. Showing the last loaded results.
        </p>
      )}
      {loading ? (
        <ReviewsPlaceholder />
      ) : list.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          {error ? "Reviews unavailable right now." : "No reviews yet."}
        </p>
      ) : (
        <ul className="reviews-list space-y-2">
          {list.map((review, i) => {
            const previous = list[i - 1]
            const sameMonth = previous?.month === review.month && previous.year === review.year
            return (
              <li key={review.id} className="flex items-start gap-2">
                <DateMarker label={sameMonth ? String(review.day) : `${review.month} ${review.year}`} muted={sameMonth} />
                <div className={`${CARD_CLASS} transition-colors duration-150 hover:border-muted-foreground`}>
                  <PosterImage src={review.poster} alt={review.title} eager={i < PRIORITY_REVIEW_POSTERS} />

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
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
