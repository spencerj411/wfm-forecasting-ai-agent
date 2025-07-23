import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import LayoutWithNav from "@/components/LayoutWithNav"

export const metadata: Metadata = {
  title: "WFM Forecasting Agent",
  description: "Upload data to analyse forecasts and gain insights",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-system antialiased bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        <AuthProvider>
          <LayoutWithNav>{children}</LayoutWithNav>
        </AuthProvider>
      </body>
    </html>
  )
}
