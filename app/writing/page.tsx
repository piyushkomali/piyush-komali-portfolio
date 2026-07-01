import Link from "next/link"
import type { Metadata } from "next"
import { SiteNav } from "@/components/site-nav"
import { getAllPosts } from "@/lib/writing"

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on protocols, agents, and frontend systems.",
}

export default async function WritingIndex() {
  const posts = await getAllPosts()

  return (
    <main>
      <SiteNav />

      <div className="mx-auto max-w-[720px] px-6 sm:px-8 py-16 sm:py-20">
        <div className="hairline-b pb-6 mb-2">
          <p className="meta mb-2">Writing</p>
          <h1 className="text-[28px] sm:text-[32px] font-[540] tracking-[-0.04em] text-fg">
            Notes
          </h1>
          <p className="mt-3 text-[14.5px] text-muted leading-[1.6] max-w-[58ch]">
            Long-form posts on protocols, agents, and how things actually work
            under the hood. Sparse — I publish when I have something concrete
            to say.
          </p>
        </div>

        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="micro group block py-5 hover:bg-hover -mx-3 px-3 rounded-[4px]"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="text-[15.5px] font-[510] tracking-[-0.025em] text-fg group-hover:underline underline-offset-[3px] decoration-border-strong">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="meta whitespace-nowrap font-mono"
                  >
                    {post.date}
                  </time>
                </div>
                <p className="mt-1.5 text-[14px] text-muted leading-[1.55] max-w-[62ch]">
                  {post.description}
                </p>
                {post.readingTime && (
                  <p className="meta mt-2" style={{ fontSize: 10.5 }}>
                    {post.readingTime}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-24 pt-6 hairline-t flex items-center justify-between text-[12px] text-muted">
          <Link href="/" className="micro hover:text-fg">
            ← Index
          </Link>
          <span className="font-mono">/writing</span>
        </footer>
      </div>
    </main>
  )
}
