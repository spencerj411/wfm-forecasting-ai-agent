"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "./ui/button"
import { User } from "@supabase/supabase-js"

function UserAvatar({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = user.email?.substring(0, 2).toUpperCase() || "U"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {initials}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-2 animate-fade-in-fast">
          <div className="px-4 py-2 border-b">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    await logout()
  }

  const navItems = user
    ? [
        { href: "/home", label: "Home" },
        { href: "/upload", label: "Upload & Setup" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/chat", label: "Agentic Chat" },
      ]
    : [{ href: "/", label: "Home" }]

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
            href={user ? "/home" : "/"}
            className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-all duration-500 truncate focus:outline-none focus:ring-2 focus:ring-blue-600/20 rounded-lg px-2 py-2"
            aria-label="Workforce Planning Agent - Home"
          >
            Workforce Planning Agent
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
            {user ? (
              <UserAvatar user={user} onSignOut={handleSignOut} />
            ) : (
              <Link href="/login">
                <Button variant="gradient">Login</Button>
              </Link>
            )}
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
              <div className="pt-4">
                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
                  >
                    <LogOut className="mr-3 h-6 w-6" />
                    Sign Out
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="gradient" size="lg" className="w-full">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
