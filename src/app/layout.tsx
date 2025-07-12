import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Demand Forecasting Agent",
  description: "Upload data to analyse forecasts and gain insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-system antialiased bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        <Navigation />
        <main className="min-h-screen overflow-x-hidden">{children}</main>
        <Toaster richColors  />
      </body>
    </html>
  )
}
