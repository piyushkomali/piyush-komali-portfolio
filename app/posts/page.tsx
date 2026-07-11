import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
import { PostsList } from "@/components/posts-list"
import { posts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Posts — Piyush Komali",
  description: "Short essays and notes.",
}

export default function PostsPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        <SiteShell>
          <div className="space-y-8">
            <p
              className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              writing. short essays and notes on things i've been thinking about.
            </p>
            <PostsList posts={posts} />
          </div>
          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
