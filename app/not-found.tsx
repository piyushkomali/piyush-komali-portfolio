import Link from "next/link"
import { SiteNav } from "@/components/site-nav"

export default function NotFound() {
  return (
    <main>
      <SiteNav />
      <div className="mx-auto max-w-[720px] px-6 sm:px-8 py-24 sm:py-32">
        <p className="meta mb-4">404</p>
        <h1 className="text-[32px] sm:text-[40px] font-[540] tracking-[-0.04em] text-fg">
          Not found.
        </h1>
        <p className="mt-3 text-[15px] text-muted leading-[1.6] max-w-[58ch]">
          That route doesn&apos;t exist. Probably never did.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/"
            className="micro inline-flex items-center h-9 px-3 hairline rounded-[6px] text-[13px] hover:border-border-strong"
          >
            ← Index
          </Link>
          <Link
            href="/writing"
            className="micro inline-flex items-center h-9 px-3 hairline rounded-[6px] text-[13px] hover:border-border-strong"
          >
            Writing
          </Link>
        </div>
      </div>
    </main>
  )
}
