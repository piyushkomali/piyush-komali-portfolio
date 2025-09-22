"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        {/* Left Column - Name and Title */}
        <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-balance">Piyush Komali</h1>
            <h2 className="text-lg sm:text-xl ml-4 lg:text-2xl text-muted-foreground font-medium flex items-center gap-2 justify-center lg:justify-start">
              <span>Computer Science —</span>
              <Image src="/images/virginia-tech.png" alt="Virginia Tech" width={140} height={28} className="h-6 w-auto object-contain opacity-90" />
            </h2>
          </div>
          <div className="flex justify-flex lg:justify-start md:justify-center rounded-[10px] overflow-hidden">
            <Image src="/images/piyush-komali.jpeg" alt="Piyush Komali" width={430} height={500} className="rounded-[10px] border-2" />
          </div>
        </div>

        {/* Right Column - Description */}
        <div className="space-y-6 lg:space-y-8 text-base sm:text-lg leading-relaxed text-muted-foreground">
          <p>
            hi! i'm piyush, a computer science student at virginia tech. I love watching <strong className="text-foreground">films</strong> and playing <strong className="text-foreground">ultimate frisbee</strong>.
          </p>

          <p>
              professionally, i'm an aspiring software engineer who loves building full-stack web applications and exploring new technologies and learning as much as possible.
          </p>
          <section>
  <div className="max-w-6xl mx-auto">
    <h2 className="text-gray-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
      FAVORITE FILMS
    </h2>
    
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-2 gap-6">
      {/* Good Will Hunting */}
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105 group-hover:shadow-2xl">
           <img
             src="/images/good-will.png"
             alt="Good Will Hunting"
             className="w-full lg:aspect-[2/4] md:aspect-[3/4] sm:aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
           />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm">Good Will Hunting</h3>
            <p className="text-gray-300 text-sm">1997 • Drama</p>
          </div>
        </div>
      </div>

      {/* Dunkirk */}
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105 group-hover:shadow-2xl">
           <img
             src="/images/dunkirk.png"
             alt="Dunkirk"
             className="w-full lg:aspect-[2/4] md:aspect-[3/4] sm:aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
           />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm">Dunkirk</h3>
            <p className="text-gray-300 text-sm">2017 • War/Thriller</p>
          </div>
        </div>
      </div>

      {/* Dune */}
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105 group-hover:shadow-2xl">
           <img
             src="/images/dune.png"
             alt="Dune"
             className="w-full lg:aspect-[2/4] md:aspect-[3/4] sm:aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
           />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm">Dune</h3>
            <p className="text-gray-300 text-sm">2021 • Sci-Fi/Adventure</p>
          </div>
        </div>
      </div>

      {/* Yeh Jawaani Hai Deewani */}
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 border border-gray-700 transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105 group-hover:shadow-2xl">
           <img
             src="/images/yjhd.png"
             alt="Yeh Jawaani Hai Deewani"
             className="w-full lg:aspect-[2/4] md:aspect-[3/4] sm:aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
           />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm">Yeh Jawaani Hai Deewani</h3>
            <p className="text-gray-300 text-sm">2013 • Romance/Comedy</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        </div>

        
      </div>
    </section>
  )
}
