"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { prefetchPage } from "@/lib/page-data"

const NAV_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const navItems = [
  { label: "work", href: "/work" },
  { label: "posts", href: "/posts" },
  { label: "reviews", href: "/reviews" },
  { label: "music", href: "/music" },
]

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Consume the HTML preload as soon as the shared shell hydrates.
    prefetchPage("/reviews")
    // Music stays lower priority on entry, with immediate prefetch on intent.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return
    const timer = window.setTimeout(() => prefetchPage("/music"), 1_000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen items-start justify-center px-8 lg:ml-30 sm:px-12 lg:px-16 pt-32 md:pt-28 pb-12">
      <div className="max-w-2xl mx-auto w-full lg:-translate-x-4 xl:-translate-x-5">
        <header>
          <Link
            href="/"
            className="inline-block"
            aria-label="Home"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight hover:opacity-80 transition-opacity duration-150">
              Piyush Komali
            </h1>
          </Link>

          <nav aria-label="Main navigation" className="mt-3 flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => prefetchPage(item.href)}
                onFocus={() => prefetchPage(item.href)}
                onTouchStart={() => prefetchPage(item.href)}
                className="text-lg text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
                style={{ fontFamily: NAV_FONT }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mt-12 flow-root text-left">{children}</main>
      </div>
    </div>
  )
}
