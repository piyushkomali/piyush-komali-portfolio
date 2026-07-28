"use client"

import { SiteShell } from "@/components/site-shell"
import { MusicSection } from "@/components/music-section"

export default function MusicPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        <SiteShell>
          <MusicSection />
          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
