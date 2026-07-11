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

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex items-flex justify-center px-8 lg:ml-30 sm:px-12 lg:px-16 pt-16 md:pt-12">
      {/* Contact links — top right */}
      <div className="fixed top-6 right-8 z-40 hidden md:flex items-center gap-5">
        <a
          href="https://github.com/piyushkomali"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
        >
          github
        </a>
        <a
          href="https://www.linkedin.com/in/piyush-komali-53bb09240"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
        >
          linkedin
        </a>
        <a
          href="mailto:komali.piyush@gmail.com"
          className="text-[13px] text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
        >
          email
        </a>
        <a
          href="https://x.com/piyushkomali"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
        >
          twitter
        </a>
      </div>

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
        </div>
      </div>
    </section>
  )
}
