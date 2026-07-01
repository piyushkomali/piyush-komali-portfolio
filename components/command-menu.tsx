"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { useTheme } from "next-themes"

type Item = {
  group: string
  label: string
  hint?: string
  shortcut?: string
  action: () => void
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = (href: string) => () => {
    setOpen(false)
    if (href.startsWith("http")) window.open(href, "_blank")
    else router.push(href)
  }

  const items: Item[] = [
    { group: "Navigate", label: "Home", action: go("/") },
    { group: "Navigate", label: "Writing", action: go("/writing") },
    { group: "Navigate", label: "Work", action: go("/#work") },
    { group: "Navigate", label: "Now Listening", action: go("/#listening") },

    {
      group: "Source",
      label: "View source on GitHub",
      hint: "github.com/piyushkomali",
      action: go("https://github.com/piyushkomali"),
    },
    {
      group: "Source",
      label: "GitHub profile",
      hint: "@piyushkomali",
      action: go("https://github.com/piyushkomali"),
    },

    {
      group: "Contact",
      label: "Email",
      hint: "komali.piyush@gmail.com",
      action: () => {
        window.location.href = "mailto:komali.piyush@gmail.com"
        setOpen(false)
      },
    },
    {
      group: "Contact",
      label: "LinkedIn",
      action: go("https://www.linkedin.com/in/piyush-komali-53bb09240"),
    },
    {
      group: "Contact",
      label: "Letterboxd",
      action: go("https://letterboxd.com/piyushkomali"),
    },
    {
      group: "Contact",
      label: "Last.fm",
      action: go("https://www.last.fm/user/piyushk12"),
    },

    {
      group: "Theme",
      label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      action: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        setOpen(false)
      },
    },
  ]

  return (
    <>
      {/* Floating trigger hint (desktop only, bottom-right corner) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="micro fixed bottom-5 right-5 z-40 hidden md:inline-flex items-center gap-2 px-3 h-9 hairline rounded-[6px] bg-bg/80 backdrop-blur text-[12px] text-muted hover:text-fg hover:border-border-strong"
      >
        <span>Press</span>
        <span className="kbd">⌘</span>
        <span className="kbd">K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] rounded-[6px] hairline bg-bg shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <Command label="Command menu" className="w-full">
              <div className="hairline-b">
                <Command.Input
                  autoFocus
                  placeholder="Search — type a command…"
                  className="w-full px-4 h-12 bg-transparent outline-none text-[14px] placeholder:text-muted"
                />
              </div>
              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-[13px] text-muted">
                  No results.
                </Command.Empty>

                {["Navigate", "Source", "Contact", "Theme"].map((group) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="[&_[cmdk-group-heading]]:meta [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                  >
                    {items
                      .filter((i) => i.group === group)
                      .map((i) => (
                        <Command.Item
                          key={`${group}-${i.label}`}
                          onSelect={i.action}
                          className="micro flex items-center justify-between gap-3 px-3 h-9 rounded-[4px] text-[13.5px] data-[selected=true]:bg-hover cursor-pointer"
                        >
                          <span className="truncate">{i.label}</span>
                          {i.hint && (
                            <span className="text-[12px] text-muted font-mono truncate">
                              {i.hint}
                            </span>
                          )}
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              <div className="hairline-t flex items-center justify-between px-3 h-9 text-[11px] text-muted">
                <div className="flex items-center gap-2">
                  <span className="kbd">↵</span>
                  <span>select</span>
                  <span className="opacity-40">·</span>
                  <span className="kbd">↑</span>
                  <span className="kbd">↓</span>
                  <span>navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="kbd">esc</span>
                  <span>close</span>
                </div>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}
