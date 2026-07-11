"use client"

import { SiteShell } from "@/components/site-shell"
import { ReviewsSection } from "@/components/reviews-section"

export default function ReviewsPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        <SiteShell>
          <ReviewsSection />
          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
