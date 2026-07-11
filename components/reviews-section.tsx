"use client"

import { useState } from "react"
import { Star, StarHalf } from "lucide-react"

const INTER_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type Review = {
  id: string
  title: string
  poster: string
  rating: number // 0..5, halves allowed
  snippet: string
  month: string // "Jan" | "Feb" | "Mar" | ...
  day: number
}

const reviews: Review[] = [
  {
    id: "dune-2",
    title: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05Nez7H.jpg",
    rating: 4.5,
    snippet:
      "Villeneuve delivers a masterclass in world-building. The sandworm riding sequence alone justifies the price of admission.",
    month: "Mar",
    day: 2,
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: 5,
    snippet:
      "Nolan's most human film is also his most terrifying. Cillian Murphy's haunted eyes carry three hours of moral weight effortlessly.",
    month: "Feb",
    day: 22,
  },
  {
    id: "the-batman",
    title: "The Batman",
    poster: "https://image.tmdb.org/t/p/w200/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 4,
    snippet:
      "A noir-drenched detective story that finally treats Batman as the world's greatest detective. Pattinson brings a wounded vulnerability.",
    month: "Feb",
    day: 14,
  },
  {
    id: "eeaao",
    title: "Everything Everywhere All at Once",
    poster: "https://image.tmdb.org/t/p/w200/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    rating: 5,
    snippet:
      "The Daniels somehow made a film about tax audits, hot dog fingers, and googly eyes that reduced me to tears. Michelle Yeoh is extraordinary.",
    month: "Jan",
    day: 27,
  },
  {
    id: "past-lives",
    title: "Past Lives",
    poster: "https://image.tmdb.org/t/p/w200/k7eYdW0G5FnJFgagb9JIqN3BbJg.jpg",
    rating: 4.5,
    snippet:
      "Celine Song's debut is devastating in its restraint. Two childhood friends reconnect across decades and continents.",
    month: "Jan",
    day: 18,
  },
]

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const empties = 5 - full - (hasHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-[2px]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-3 h-3 text-white"
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
      {hasHalf && (
        <div className="relative w-3 h-3">
          <Star
            className="absolute inset-0 w-3 h-3 text-white/15"
            fill="currentColor"
            strokeWidth={0}
          />
          <StarHalf
            className="absolute inset-0 w-3 h-3 text-white"
            fill="currentColor"
            strokeWidth={0}
          />
        </div>
      )}
      {Array.from({ length: empties }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-3 h-3 text-white/15"
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </div>
  )
}

function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false)

  return (
    <div className="shrink-0 w-[34px] h-[50px] max-[480px]:w-[28px] max-[480px]:h-[42px] rounded-[3px] overflow-hidden bg-[color:var(--muted)] border border-[color:var(--border)]">
      {!broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
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
      className={`w-7 shrink-0 pt-1 text-[11px] leading-none tracking-wider uppercase text-right pr-1 ${
        muted ? "text-[color:var(--muted-foreground)]" : "text-white font-bold"
      }`}
      style={{ fontFamily: INTER_FONT }}
    >
      {label}
    </div>
  )
}

export function ReviewsSection() {
  // Compute date markers: first entry per month gets month label, subsequent get day number.
  const markers: { label: string; muted: boolean }[] = []
  let currentMonth = ""
  for (const r of reviews) {
    if (r.month !== currentMonth) {
      markers.push({ label: r.month, muted: false })
      currentMonth = r.month
    } else {
      markers.push({ label: String(r.day), muted: true })
    }
  }

  return (
    <div className="max-w-xl" style={{ fontFamily: INTER_FONT }}>
      {/* Intro */}
      <div
        className="space-y-3 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-300 max-w-xl mb-10"
      >
        <p>
          movie reviews. a running log of what i&apos;ve been watching lately.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[color:var(--border)]">
        <h2 className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase">
          Recent Reviews
        </h2>
        <span className="text-[11px] text-[color:var(--muted-foreground)] tracking-wide">
          {reviews.length} reviews
        </span>
      </div>

      {/* List */}
      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-[color:var(--muted-foreground)]">
          No reviews yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {reviews.map((review, i) => {
            const marker = markers[i]
            return (
              <li key={review.id} className="flex items-start gap-2">
                <DateMarker label={marker.label} muted={marker.muted} />

                <div className="flex-1 min-w-0">
                  <div className="group flex items-center gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--accent)] px-3 py-2 max-[480px]:px-2 max-[480px]:py-1.5 transition-colors duration-150 hover:border-[color:var(--muted-foreground)]">
                    <PosterImage src={review.poster} alt={review.title} />

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
                          maskImage:
                            "linear-gradient(to right, black 60%, transparent 95%)",
                          WebkitMaskImage:
                            "linear-gradient(to right, black 60%, transparent 95%)",
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
