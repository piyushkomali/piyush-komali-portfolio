import Link from "next/link"
import type { PostMeta } from "@/lib/posts"

const CARD_BG = "#1b1812"

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z")
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function readMinutes(readingTime: string): string {
  // Turn "6 min read" into "6m" per Cursor row style
  const match = readingTime.match(/(\d+)/)
  return match ? `${match[1]}m` : readingTime
}

export function PostsList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        nothing here yet. check back soon.
      </p>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-white/10"
      style={{ backgroundColor: CARD_BG }}
    >
      <ul className="divide-y divide-white/10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group block px-4 sm:px-5 py-3.5 transition-colors hover:bg-[#221e17]"
            >
              <article
                className={[
                  "grid grid-cols-1 items-start gap-x-4 gap-y-1",
                  "md:grid-cols-[minmax(0,7fr)_minmax(0,17fr)]",
                  "lg:grid-cols-[minmax(0,6fr)_minmax(0,18fr)]",
                  "xl:grid-cols-[minmax(0,5fr)_minmax(0,12fr)_minmax(0,1fr)_minmax(0,5fr)_minmax(0,1fr)]",
                ].join(" ")}
              >
                {/* Date · Category */}
                <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5 self-start text-[13px] sm:text-sm text-gray-400 xl:col-start-1">
                  <time dateTime={post.date} className="tabular-nums">
                    {formatDate(post.date)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{post.category}</span>
                </div>

                {/* Title */}
                <div className="min-w-0 self-start xl:col-start-2">
                  <p className="text-[15px] sm:text-base text-pretty text-gray-200 group-hover:text-white transition-colors">
                    {post.title}
                  </p>
                </div>

                {/* Author (xl+ only) */}
                <div className="hidden self-start text-[13px] sm:text-sm text-gray-400 xl:col-start-4 xl:block xl:min-w-0 xl:text-pretty">
                  <span>Piyush Komali</span>
                </div>

                {/* Read time (xl+ only) */}
                <div className="hidden self-start text-[13px] sm:text-sm text-gray-500 xl:col-start-5 xl:block xl:text-right tabular-nums">
                  {readMinutes(post.readingTime)}
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
