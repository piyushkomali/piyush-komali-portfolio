"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "react-responsive"
import { Home, User, Briefcase, Mail, ChevronDown } from "lucide-react"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: User },
  { name: "Experience", href: "/experience", icon: Briefcase },
  { name: "Contact", href: "/contact", icon: Mail },
]

export function CompactNavigation() {
  const pathname = usePathname()
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
  
  const currentPage = navItems.find((item) => item.href === pathname) || navItems[0]
  const CurrentIcon = currentPage.icon

  return (
     !isMobile ? <nav className="group relative ml-4">
      <div className={cn(
        "bg-black/20 border border-white/20 px-3 py-2 cursor-pointer w-[225px] flex items-center justify-between gap-2 hover:bg-black/30 transition-colors",
      )}>
        <div className="flex items-center justify-center gap-2 flex-1">
          <CurrentIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
          <span className="text-sm font-semibold tracking-wide text-white">{currentPage.name}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-white/60 group-hover:text-white/90 transition-all group-hover:translate-y-0.5" strokeWidth={2.5} />
      </div>
      
      {/* Dropdown menu that expands from bottom */}
      <div className="absolute top-full left-0 mt-1 bg-black/20 border border-white/20  px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top transform scale-y-0 group-hover:scale-y-100 w-[225px] overflow-x-auto overflow-y-hidden scrollbar-hide z-50">
        <div className="flex flex-col space-y-1 min-w-max">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-semibold tracking-wide transition-colors duration-200 px-2 py-1 rounded-[9px] whitespace-nowrap flex items-center gap-2",
                  pathname === item.href
                    ? "text-white bg-white/10"
                    : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-white/10",
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav> : null
  )
}
