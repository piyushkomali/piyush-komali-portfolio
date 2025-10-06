"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CompactNavigation } from "@/components/compact-navigation"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="min-h-screen flex items-flex justify-center px-8 lg:ml-30 sm:px-12 lg:px-16 pt-16 md:pt-12">
      <div className="max-w-2xl mx-auto w-full">
        {/* Left-aligned block-style content */}
        <div className="space-y-6 text-left">
          
          {/* Name */}
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight">
              Piyush Komali
            </h1>
            <CompactNavigation />
          </div>

          {/* Computer Science - VT */}
          <div className="mt-14">
            <h2 className="text-base sm:text-lg lg:text-xl text-gray-300 font-normal flex items-center gap-2">
              <span>Computer Science —</span>
              <Image 
                src="/images/virginia-tech.png" 
                alt="Virginia Tech" 
                width={120} 
                height={24} 
                className="h-5 w-auto object-contain opacity-90" 
              />
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-300 max-w-xl">
            <p>
              hi! i'm piyush, a computer science student at virginia tech. I love watching <span className="text-white font-medium">films</span> and playing <span className="text-white font-medium">ultimate frisbee</span>.
            </p>
            <p>
              professionally, i'm an aspiring software engineer who loves building full-stack web applications and exploring new technologies and learning as much as possible.
            </p>
          </div>

          {/* Favorite Films Section */}
          <section className="pt-4">
            <div className="max-w-xl">
              <h2 className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">
                FAVORITE FILMS
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Good Will Hunting */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-all duration-300 group-hover:border-gray-600 group-hover:scale-105">
                    <img
                      src="/images/good-will.png"
                      alt="Good Will Hunting"
                      className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-medium text-xs">Good Will Hunting</h3>
                      <p className="text-gray-300 text-[10px]">1997 • Drama</p>
                    </div>
                  </div>
                </div>

                {/* Dunkirk */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-all duration-300 group-hover:border-gray-600 group-hover:scale-105">
                    <img
                      src="/images/dunkirk.png"
                      alt="Dunkirk"
                      className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-medium text-xs">Dunkirk</h3>
                      <p className="text-gray-300 text-[10px]">2017 • War/Thriller</p>
                    </div>
                  </div>
                </div>

                {/* Dune */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-all duration-300 group-hover:border-gray-600 group-hover:scale-105">
                    <img
                      src="/images/dune.png"
                      alt="Dune"
                      className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-medium text-xs">Dune</h3>
                      <p className="text-gray-300 text-[10px]">2021 • Sci-Fi/Adventure</p>
                    </div>
                  </div>
                </div>

                {/* Yeh Jawaani Hai Deewani */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-all duration-300 group-hover:border-gray-600 group-hover:scale-105">
                    <img
                      src="/images/yjhd.png"
                      alt="Yeh Jawaani Hai Deewani"
                      className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-medium text-xs">Yeh Jawaani Hai Deewani</h3>
                      <p className="text-gray-300 text-[10px]">2013 • Romance/Comedy</p>
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