"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { ForecastProvider } from "../context/ForecastContext"
import { Toaster } from "@/components/ui/sonner"

export default function LayoutWithNav({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname === "/" || pathname === "/login"
  return (
    <>
      {!hideNav && <Navigation />}
      <ForecastProvider>
        <main className="min-h-screen overflow-x-hidden">{children}</main>
      </ForecastProvider>
      <Toaster richColors />
    </>
  )
} 