"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/chat", label: "Chat" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100/80 shadow-lg"
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100/50",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-5 sm:py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-all duration-500 truncate focus:outline-none focus:ring-2 focus:ring-blue-600/20 rounded-lg px-2 py-2"
            aria-label="WFM Forecasting Agent - Home"
          >
            WFM Forecasting Agent
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 lg:space-x-14" role="menubar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  "text-lg font-semibold transition-all duration-300 hover:opacity-70 relative whitespace-nowrap py-3 px-4 rounded-lg min-h-[48px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-600/20",
                  pathname === item.href
                    ? "text-blue-600 bg-blue-50/30"
                    : "text-gray-600 hover:bg-gray-50/50 hover:text-blue-600",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
                {pathname === item.href && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 text-gray-600 hover:text-gray-900 transition-all duration-500 rounded-lg hover:bg-gray-50/50 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-7 w-7" strokeWidth={1.5} /> : <Menu className="h-7 w-7" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-gray-100 animate-fade-in" role="menu">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className={cn(
                    "text-xl font-semibold transition-all duration-300 hover:opacity-70 py-4 px-4 rounded-lg min-h-[56px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-600/20",
                    pathname === item.href ? "text-blue-600 bg-blue-50/30" : "text-gray-600 hover:bg-gray-50/50",
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
