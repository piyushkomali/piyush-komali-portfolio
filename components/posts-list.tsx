import Link from "next/link"
import type { PostMeta } from "@/lib/posts"

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z")
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function PostsList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">nothing here yet. check back soon.</p>
    )
  }

  return (
    <ul className="border-t border-white/10">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-white/10">
          <Link
            href={`/posts/${post.slug}`}
            className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6 sm:py-5 transition-colors"
          >
            <span className="shrink-0 text-xs text-gray-500 sm:w-28 sm:text-[13px] tabular-nums">
              {formatDate(post.date)}
            </span>
            <span className="text-[15px] sm:text-base text-gray-200 font-medium leading-snug group-hover:text-white transition-colors">
              {post.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
