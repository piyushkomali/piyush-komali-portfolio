import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { SiteNav } from "@/components/site-nav"
import { getAllPosts, getPost } from "@/lib/writing"
import { mdxComponents } from "@/components/mdx-components"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not found" }
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date,
    },
  }
}

export default async function WritingPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const content = await MDXRemote({
    source: post.content,
    components: mdxComponents,
  })

  return (
    <main>
      <SiteNav />

      <article className="mx-auto max-w-[680px] px-6 sm:px-8 py-16 sm:py-20">
        {/* Header */}
        <header className="mb-10">
          <Link
            href="/writing"
            className="micro meta inline-block mb-6 hover:text-fg"
          >
            ← Writing
          </Link>
          <h1 className="text-[32px] sm:text-[40px] leading-[1.05] tracking-[-0.04em] font-[540] text-fg">
            {post.meta.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-[12.5px] text-muted">
            <time dateTime={post.meta.date} className="font-mono">
              {post.meta.date}
            </time>
            {post.meta.readingTime && (
              <>
                <span className="text-muted-2">·</span>
                <span>{post.meta.readingTime}</span>
              </>
            )}
          </div>
        </header>

        {/* Body */}
        <div className="prose-writing">
          {content}
        </div>

        <footer className="mt-20 pt-6 hairline-t flex items-center justify-between text-[12px] text-muted">
          <Link href="/writing" className="micro hover:text-fg">
            ← All writing
          </Link>
          <span className="font-mono">{post.meta.date}</span>
        </footer>
      </article>
    </main>
  )
}
