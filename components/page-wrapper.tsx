import type React from "react"

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-28 sm:pt-32">{children}</div>
  )
}
