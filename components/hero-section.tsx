"use client"

import { SiteShell } from "@/components/site-shell"

export function HeroSection() {
  return (
    <SiteShell>
      {/* Description */}
      <div className="space-y-3 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-300 max-w-xl">
        <p>
          hi! i'm piyush, a computer science student at virginia tech raised in charlotte. i love watching <a href="https://boxd.it/38Jc1" target="_blank" rel="noopener noreferrer" className="text-white font-medium underline decoration-dotted decoration-[#555] hover:decoration-white underline-offset-[3px] decoration-[1.5px] transition-colors duration-200">films</a> and playing <a href="https://www.ultirzr.app/player/650f06dbd595c47d2820421f" target="_blank" rel="noopener noreferrer" className="text-white font-medium underline decoration-dotted decoration-[#555] hover:decoration-white underline-offset-[3px] decoration-[1.5px] transition-colors duration-200">ultimate frisbee</a> in my free time.
        </p>
        <p>
          i love tinkering with the newest ai technologies and just finished as an intern at ibm. i'm heading into my final year of school so if you want to learn more about me feel free to look around.
        </p>
      </div>

      {/* Favorite Films Section */}
      <section className="pt-4 mt-6">
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

            {/* Past Lives */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-all duration-300 group-hover:border-gray-600 group-hover:scale-105">
                <img
                  src="/images/past-lives.png"
                  alt="Past Lives"
                  className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-medium text-xs">Past Lives</h3>
                  <p className="text-gray-300 text-[10px]">2023 • Romance/Drama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
