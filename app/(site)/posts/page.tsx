import type { Metadata } from "next"
import { PostsList } from "@/components/posts-list"
import { posts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Posts — Piyush Komali",
  description: "Short essays and notes.",
}

export default function PostsPage() {
  return <PostsList posts={posts} />
}
