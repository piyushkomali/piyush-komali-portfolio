import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Footer } from "@/components/footer"
import {MobileNavigation} from "@/components/mobile-navigation"
import {Navigation} from "@/components/navigation"
import "./globals.css"

export const metadata: Metadata = {
  title: "Piyush Komali - Software Engineer",
  icons: {
    icon: "/images/piyush-komali.jpeg",
  },
  description:
    "Computer Science student at Virginia Tech passionate about full-stack development and seeking internship opportunities.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Navigation />
        <MobileNavigation />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
