"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "react-responsive"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Experience", href: "/experience" },
  { name: "Contact", href: "/contact" },
]

export function CompactNavigation() {
  const pathname = usePathname()
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" })

  return (
     !isMobile ? <nav className="group relative ml-4">
      <div className={cn(
        "bg-black/20 border border-white/10 rounded-[1px] px-3 py-2 cursor-pointer w-[225px] flex items-center justify-center",
      )}>
        <span className="text-sm font-medium text-white">------      Home   ------</span>
      </div>
      
      {/* Dropdown menu that expands from bottom */}
      <div className="absolute top-full left-0 mt-1 bg-black/20 border border-white/10 rounded-[2px] px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top transform scale-y-0 group-hover:scale-y-100 w-[225px] overflow-x-auto overflow-y-hidden scrollbar-hide z-50">
        <div className="flex flex-col space-y-1 min-w-max">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200 px-2 py-1 rounded-[9px] whitespace-nowrap",
                pathname === item.href
                  ? "text-white bg-white/10"
                  : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-white/10",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav> : null
  )
}
