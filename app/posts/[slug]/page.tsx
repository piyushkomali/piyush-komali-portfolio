import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { PostView } from "@/components/post-view"
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts"

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: "Post not found" }
  return {
    title: `${post.meta.title} — Piyush Komali`,
    description: post.meta.excerpt,
  }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return notFound()
  const MDX = post.default

  return (
    <SiteShell>
      <PostView meta={post.meta} toc={post.toc}>
        <MDX />
      </PostView>
    </SiteShell>
  )
}
