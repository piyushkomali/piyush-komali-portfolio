"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const links = [
  { label: "Index", href: "/" },
  { label: "Writing", href: "/writing" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="hairline-b">
      <nav className="mx-auto max-w-[720px] px-6 sm:px-8 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="micro text-[13px] tracking-[-0.01em] text-fg hover:text-muted"
        >
          Piyush&nbsp;Komali
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "micro px-2.5 h-7 inline-flex items-center text-[13px] rounded-[4px]",
                  active ? "text-fg" : "text-muted hover:text-fg",
                ].join(" ")}
              >
                {l.label}
              </Link>
            )
          })}
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="micro ml-1 px-2.5 h-7 inline-flex items-center text-[13px] text-muted hover:text-fg rounded-[4px]"
          >
            {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "Theme"}
          </button>
        </div>
      </nav>
    </header>
  )
}
