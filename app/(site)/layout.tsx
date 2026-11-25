import type { ReactNode } from "react"
import { SiteShell } from "@/components/site-shell"
import { REVIEWS_API_URL } from "@/lib/review-types"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preload" href={REVIEWS_API_URL} as="fetch" crossOrigin="anonymous" />
      <SiteShell>{children}</SiteShell>
    </>
  )
}
