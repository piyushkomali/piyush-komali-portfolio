"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Contact", href: "/contact" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-fit hidden md:block">
      <div className="bg-black/20 opacity-95 backdrop-blur-[4px] border border-white/10 rounded-[15px] px-6 py-2">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-lg font-bold text-white hover:text-red-400 transition-colors duration-200">
            PK
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 px-3 py-1 rounded-full",
                  pathname === item.href
                    ? "text-white bg-[#e7576d]"
                    : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-white/10",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
