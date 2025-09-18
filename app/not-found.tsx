"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NotFound() {
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />

      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-muted/20 rounded-full blur-lg animate-bounce delay-500" />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-foreground/10 select-none animate-pulse">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              404
            </span>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Page Not Found</h2>

          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mx-auto max-w-sm">
            <p className="text-sm text-muted-foreground mb-2">Redirecting to home in</p>
            <div className="text-4xl font-bold text-primary animate-bounce">{countdown}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              Go Home Now
            </Link>
            <Link
              href="/experience"
              className="px-8 py-3 bg-card/50 backdrop-blur-sm border border-border/50 text-foreground rounded-full font-medium hover:bg-card/80 transition-all duration-300 hover:scale-105"
            >
              View My Work
            </Link>
          </div>
        </div>

        <div className="absolute -top-10 -left-10 w-20 h-20 border-2 border-primary/20 rounded-full animate-spin-slow" />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 border-2 border-accent/20 rounded-full animate-spin-slow delay-1000" />
      </div>
    </div>
  )
}
