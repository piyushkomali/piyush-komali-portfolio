"use client"

import { type ReactNode } from "react"
import Link from "next/link"

const NAV_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const navItems = [
  { label: "work", href: "/work" },
  { label: "posts", href: "/posts" },
  { label: "reviews", href: "/reviews" },
  { label: "music", href: "/music" },
]

const socialItems = [
  { label: "github", href: "https://github.com/piyushkomali" },
  { label: "linkedin", href: "https://www.linkedin.com/in/piyush-komali-53bb09240" },
  { label: "email", href: "mailto:komali.piyush@gmail.com" },
  { label: "twitter", href: "https://x.com/piyushkomali" },
]

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex items-start justify-center px-8 lg:ml-30 sm:px-12 lg:px-16 pt-16 md:pt-12 pb-12">
      <div className="max-w-2xl mx-auto w-full lg:-translate-x-4 xl:-translate-x-5">
        <div className="space-y-6 text-left">
          {/* Name */}
          <div>
            <Link
              href="/"
              className="inline-block"
              aria-label="Home"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight hover:opacity-80 transition-opacity duration-150">
                Piyush Komali
              </h1>
            </Link>

            {/* Navigation */}
            <div className="mt-3 flex gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-lg text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
                  style={{ fontFamily: NAV_FONT }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Page-specific content */}
          <div className="mt-12">{children}</div>

          {/* Contact links */}
          <footer className="pt-8 mt-10 border-t border-white/10">
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-gray-500 uppercase">
              Connect
            </p>
            <nav aria-label="Social links" className="flex flex-wrap gap-2.5">
              {socialItems.map((item) => {
                const isExternal = item.href.startsWith("http")

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 py-2 text-sm tracking-wide text-gray-300 transition-colors duration-150 hover:border-white/40 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    style={{ fontFamily: NAV_FONT }}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>
          </footer>
        </div>
      </div>
    </section>
  )
}
