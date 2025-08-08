"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/page-wrapper"
import { useForecast } from "@/context/ForecastContext"
import { DollarSign, Zap, BarChart2, Bot, UploadCloud, LayoutDashboard } from "lucide-react"

function SkeletonCard({ variant = "static" }: { variant?: "interactive" | "static" }) {
  return (
    <Card variant={variant} className="shadow-lg bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
      </CardHeader>
      <CardContent>
        <div className="h-7 w-1/2 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  )
}

export default function AuthenticatedHomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { forecastData, isLoading } = useForecast()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const hasData = forecastData && forecastData.length > 0
  const totalForecast = hasData ? forecastData.reduce((sum, item) => sum + item.forecast, 0) : 0
  const avgConfidence = hasData ? forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length : 0

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24">
        <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user.email}</span>
          </h1>
          {hasData && (
            <p className="text-lg sm:text-xl text-gray-600 font-light">Here&apos;s a quick summary of your latest forecast.</p>
          )}
        </div>

        {/* Desktop/Tablet Dashboard Cards - Always show at top */}
        {isLoading ? (
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-20">
            <SkeletonCard variant="static" />
            <SkeletonCard variant="static" />
            <SkeletonCard variant="static" />
          </div>
        ) : hasData ? (
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-20 animate-fade-in-delay-1">
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forecasted Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalForecast.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">Model accuracy level</p>
              </CardContent>
            </Card>
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Length</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7 Days</div>
                <p className="text-xs text-muted-foreground">Analysis period</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="hidden md:block mb-16 sm:mb-20">
            <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-800">Dashboard Quick Peek</h3>
              <p className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-600 max-w-2xl">
                Once you upload data, you'll see your forecast insights here
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <SkeletonCard variant="static" />
              <SkeletonCard variant="static" />
              <SkeletonCard variant="static" />
            </div>
          </div>
        )}

        {/* Mobile Dashboard Cards - Show right after welcome when there's data */}
        {hasData && (
          <div className="block md:hidden mb-8 space-y-4 animate-fade-in-delay-1">
            <div className="mb-6 space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Quick Peek</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">Latest forecast insights</p>
            </div>
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forecasted Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalForecast.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">Model accuracy level</p>
              </CardContent>
            </Card>
            <Card variant="static" className="bg-gray-50/90 backdrop-blur-md border-0 rounded-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Length</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7 Days</div>
                <p className="text-xs text-muted-foreground">Analysis period</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile Loading State - Show right after welcome when loading */}
        {isLoading && (
          <div className="block md:hidden mb-8 space-y-4">
            <div className="mb-6 space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Quick Peek</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">Preparing your insights...</p>
            </div>
            <SkeletonCard variant="static" />
            <SkeletonCard variant="static" />
            <SkeletonCard variant="static" />
          </div>
        )}

        <div className="space-y-6 sm:space-y-8 animate-fade-in-delay-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Conversational Agentic Analyst</h2>
          
          {/* Mobile-First Content Ordering - Apple Inspired */}
          <div className="block lg:hidden space-y-6">
            {/* 1. Upload Data - Most Important on Mobile */}
            <Link href="/upload" className="block group">
              <Card
                variant="interactive"
                className="bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center group-hover:bg-blue-600/20 transition-colors duration-300">
                    <UploadCloud className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Upload Data</h3>
                    <p className="text-gray-500 mt-1 text-sm">Generate a new forecast with your sales data</p>
                  </div>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </div>
                </div>
              </Card>
            </Link>

            {/* 2. View Dashboard */}
            <Link href="/dashboard" className="block group">
              <Card
                variant="interactive"
                className="bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center group-hover:bg-green-600/20 transition-colors duration-300">
                    <LayoutDashboard className="h-8 w-8 text-green-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">View Dashboard</h3>
                    <p className="text-gray-500 mt-1 text-sm">Review your forecast details and insights</p>
                  </div>
                  <div className="text-green-600 group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </div>
                </div>
              </Card>
            </Link>

            {/* 3. Agentic Chat */}
            <Link href="/chat" className="block group">
              <Card
                variant="interactive"
                className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <Bot className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">Agentic Chat</h3>
                    <p className="text-blue-100 mt-1 text-sm">Ask questions and explore workforce scenarios</p>
                  </div>
                  <div className="text-white group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Desktop/Tablet Layout - Original Design */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {/* Primary Action: Agentic Chat */}
            <Link href="/chat" className="block lg:col-span-2 group">
              <Card
                variant="interactive"
                className="h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between transform transition-all duration-300 ease-out group-hover:scale-[1.01]"
              >
                <div>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/30 transition-colors duration-300">
                    <Bot className="h-10 w-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">Agentic Chat</h3>
                  <p className="mt-4 text-lg text-blue-100 max-w-lg">
                    Engage in conversational forecasting. Ask questions, explore scenarios, and let your AI analyst help
                    you manage workforce demand.
                  </p>
                </div>
                <div className="mt-8 font-semibold text-white text-lg group-hover:translate-x-2 transition-transform duration-300">
                  Start Chatting →
                </div>
              </Card>
            </Link>

            {/* Secondary Actions */}
            <div className="space-y-8">
              <Link href="/upload" className="block group">
                <Card
                  variant="interactive"
                  className="h-full bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out group-hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center group-hover:bg-blue-600/20 transition-colors duration-300">
                      <UploadCloud className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Upload Data</h3>
                      <p className="text-gray-500 mt-1">Generate a new forecast.</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/dashboard" className="block group">
                <Card
                  variant="interactive"
                  className="h-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out group-hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center group-hover:bg-green-600/20 transition-colors duration-300">
                      <LayoutDashboard className="h-8 w-8 text-green-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">View Dashboard</h3>
                      <p className="text-gray-500 mt-1">Review your forecast details.</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Dashboard Placeholder Cards - Show at bottom when no data */}
        {!hasData && !isLoading && (
          <div className="block md:hidden mt-16 space-y-6 animate-fade-in-delay-3">
            <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold text-gray-800">Dashboard Quick Peek</h3>
              <p className="text-sm sm:text-base lg:text-sm xl:text-base text-gray-600 max-w-2xl">
                Once you upload data, you'll see your forecast insights here
              </p>
            </div>
            <div className="space-y-4">
              <SkeletonCard variant="static" />
              <SkeletonCard variant="static" />
              <SkeletonCard variant="static" />
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  )
} 