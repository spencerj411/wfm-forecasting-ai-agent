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
          ? "bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-lg"
          : "bg-white/80 backdrop-blur-sm border-b border-gray-100/50",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-all duration-500 truncate bounce-hover"
          >
            WFM Forecasting Agent
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12 lg:space-x-16">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-semibold transition-all duration-500 hover:opacity-70 relative whitespace-nowrap py-2 px-4 rounded-lg",
                  pathname === item.href ? "text-blue-600 bg-blue-50/30" : "text-gray-600 hover:bg-gray-50/50",
                )}
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
            className="md:hidden p-3 text-gray-600 hover:text-gray-900 transition-all duration-500 rounded-lg hover:bg-gray-50/50 bounce-hover"
          >
            {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-base font-semibold transition-all duration-500 hover:opacity-70 py-3 px-4 rounded-lg",
                    pathname === item.href ? "text-blue-600 bg-blue-50/30" : "text-gray-600 hover:bg-gray-50/50",
                  )}
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
