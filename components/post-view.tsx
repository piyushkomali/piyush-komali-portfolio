"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { PostMeta, TocEntry } from "@/lib/posts"

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z")
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function Breadcrumb({ category }: { category: string }) {
  return (
    <div className="text-xs tracking-wide">
      <Link
        href="/posts"
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        Blog
      </Link>
      <span className="text-gray-600 mx-1.5">/</span>
      <span className="text-white">{category}</span>
    </div>
  )
}

function TocList({
  toc,
  activeId,
}: {
  toc: TocEntry[]
  activeId: string | null
}) {
  return (
    <ul className="space-y-2 text-[13px]">
      {toc.map((entry) => {
        const isActive = entry.id === activeId
        return (
          <li
            key={entry.id}
            className={entry.level === 3 ? "pl-3" : undefined}
          >
            <a
              href={`#${entry.id}`}
              className={[
                "block leading-snug transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300",
              ].join(" ")}
            >
              {entry.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function PostView({
  meta,
  toc,
  children,
}: {
  meta: PostMeta
  toc: TocEntry[]
  children: ReactNode
}) {
  const [activeId, setActiveId] = useState<string | null>(
    toc[0]?.id ?? null,
  )
  const articleRef = useRef<HTMLElement | null>(null)

  const ids = useMemo(() => toc.map((t) => t.id), [toc])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (ids.length === 0) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visibleMap = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleMap.set(entry.target.id, entry.intersectionRatio)
          } else {
            visibleMap.delete(entry.target.id)
          }
        }

        if (visibleMap.size > 0) {
          // pick the id that appears first in `ids` order among visible
          const firstVisible = ids.find((id) => visibleMap.has(id))
          if (firstVisible) setActiveId(firstVisible)
        }
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [ids])

  return (
    <div className="relative">
      {/* Desktop TOC — placed to the left of the centered article column */}
      <aside
        aria-label="Table of contents"
        className="hidden lg:block fixed top-40 z-10"
        style={{ left: "max(1.5rem, calc(50% - 24rem - 12rem))", width: "10.5rem" }}
      >
        <div className="mb-5">
          <Breadcrumb category={meta.category} />
        </div>
        <nav>
          <TocList toc={toc} activeId={activeId} />
        </nav>
      </aside>

      {/* Mobile / tablet: breadcrumb + collapsible TOC */}
      <div className="lg:hidden mb-6">
        <div className="mb-4">
          <Breadcrumb category={meta.category} />
        </div>
        {toc.length > 0 && (
          <details className="rounded-md border border-white/10 bg-white/[0.02]">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs text-gray-400 hover:text-gray-200 select-none">
              contents
            </summary>
            <div className="px-3 pb-3 pt-1">
              <TocList toc={toc} activeId={activeId} />
            </div>
          </details>
        )}
      </div>

      <article ref={articleRef} className="max-w-2xl">
        <div className="mb-4 text-xs text-gray-500 tabular-nums">
          {formatDate(meta.date)}
          <span className="mx-1.5">·</span>
          {meta.readingTime}
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-8 leading-tight">
          {meta.title}
        </h1>
        <div className="mdx-body">{children}</div>
      </article>
    </div>
  )
}
