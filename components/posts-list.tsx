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
      className="overflow-hidden rounded-sm border"
      style={{ backgroundColor: CARD_BG, borderColor: "#211d16" }}
    >
      <ul className="divide-y divide-white/10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group block px-3 sm:px-4 py-3.5 transition-colors hover:bg-[#221e17]"
            >
              <article
                className={[
                  "grid grid-cols-1 items-center gap-x-[1.875rem] gap-y-1",
                  "md:grid-cols-[minmax(0,7fr)_minmax(0,17fr)]",
                  "lg:grid-cols-[13rem_minmax(0,1fr)_max-content_max-content]",
                ].join(" ")}
              >
                {/* Date · Category */}
                <div
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5 self-center whitespace-nowrap text-[15px] sm:text-[15px] lg:col-start-1"
                  style={{ color: "#92908e" }}
                >
                  <time dateTime={post.date} className="tabular-nums">
                    {formatDate(post.date)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{post.category}</span>
                </div>

                {/* Title — single line with right-side fade if too long */}
                <div className="min-w-0 self-center lg:col-start-2">
                  <div className="relative min-w-0 overflow-hidden">
                    <p
                      className="whitespace-nowrap text-[15px] sm:text-base text-gray-200 group-hover:text-white transition-colors"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to right, black 85%, transparent 100%)",
                        maskImage:
                          "linear-gradient(to right, black 85%, transparent 100%)",
                      }}
                    >
                      {post.title}
                    </p>
                  </div>
                </div>

                {/* Author (lg+ only) */}
                <div
                  className="hidden self-center whitespace-nowrap text-[15px] lg:col-start-3 lg:block"
                  style={{ color: "#92908e" }}
                >
                  <span>Piyush Komali</span>
                </div>

                {/* Read time (lg+ only) */}
                <div
                  className="hidden self-center whitespace-nowrap text-[15px] lg:col-start-4 lg:block lg:text-right tabular-nums"
                  style={{ color: "#92908e" }}
                >
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
