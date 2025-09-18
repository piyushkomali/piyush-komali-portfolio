"use client"

import { useEffect, useState } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-0">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        {/* Left Column - Name and Title */}
        <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-balance">Piyush Komali</h1>
            <h2 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium">
              Computer Science Student
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              I build scalable, pixel-perfect digital experiences for the web.
            </p>
          </div>
        </div>

        {/* Right Column - Description */}
        <div className="space-y-6 lg:space-y-8 text-base sm:text-lg leading-relaxed text-muted-foreground">
          <p>
            I'm a Computer Science student passionate about crafting accessible, pixel-perfect user interfaces that
            blend thoughtful design with robust engineering. My favorite work lies at the intersection of design and
            development, creating experiences that not only look great but are meticulously built for performance and
            usability.
          </p>

          <p>
            Currently, I'm a <strong className="text-foreground">Software Engineer Intern</strong> at{" "}
            <strong className="text-foreground">Echio</strong>, specializing in full-stack development. I contribute to
            building scalable web applications using Next.js, implementing video streaming solutions, and optimizing
            performance across client and server-side rendering.
          </p>

          <p>
            In the past, I've had the opportunity to develop software across a variety of settings — from{" "}
            <strong className="text-foreground">hackathon leadership</strong> and{" "}
            <strong className="text-foreground">teaching assistance</strong> to{" "}
            <strong className="text-foreground">freelance projects</strong> and{" "}
            <strong className="text-foreground">open-source contributions</strong>. Additionally, I also serve as
            Captain of the <strong className="text-foreground">Virginia Tech Men's Club Ultimate Frisbee</strong> team.
          </p>

          <p>
            In my spare time, I'm usually coding personal projects, playing ultimate frisbee, or exploring new
            technologies and frameworks.
          </p>
        </div>
      </div>
    </section>
  )
}
