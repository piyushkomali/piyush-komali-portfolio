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
          {/* Full-bleed break-out: escape the shell's centered max-w-2xl column
              to a viewport-wide row, then center the list inside. Counter-translate
              undoes the shell's lg/xl left-shift so we land true-center. */}
          <div
            className="w-screen flex justify-center px-6 sm:px-10 lg:translate-x-4 xl:translate-x-5"
            style={{ marginLeft: "calc(50% - 50vw)" }}
          >
            <div className="w-full max-w-4xl">
              <PostsList posts={posts} />
            </div>
          </div>

          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
