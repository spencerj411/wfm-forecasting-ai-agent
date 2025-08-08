import type React from "react"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  variant?: "content" | "centered"
  className?: string
}

export function PageWrapper({ children, variant = "content", className }: PageWrapperProps) {
  if (variant === "centered") {
    return (
      <div className={cn("flex min-h-screen items-center justify-center bg-white px-4", className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-28 sm:pt-32",
        className,
      )}
    >
      {children}
    </div>
  )
}
