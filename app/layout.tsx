import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { NowPlaying } from "@/components/now-playing"
import { CommandMenu } from "@/components/command-menu"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://piyushkomali.com"),
  title: {
    default: "Piyush Komali",
    template: "%s — Piyush Komali",
  },
  description:
    "AI engineer building production software. CS at Virginia Tech. AI Engineer Intern at IBM oLabs.",
  icons: {
    icon: "/images/piyush-komali.jpeg",
  },
  openGraph: {
    title: "Piyush Komali",
    description:
      "AI engineer building production software. CS at Virginia Tech. AI Engineer Intern at IBM oLabs.",
    url: "https://piyushkomali.com",
    siteName: "Piyush Komali",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-bg text-fg">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <CommandMenu />
            {children}
            <NowPlaying />
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
