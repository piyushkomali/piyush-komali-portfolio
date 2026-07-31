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
          <PostsList posts={posts} />

          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
