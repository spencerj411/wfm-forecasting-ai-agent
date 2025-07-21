"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForecastTable } from "../../components/forecast-table"
import { TrendingUp } from "lucide-react"
import { useForecast } from "../../context/ForecastContext"
import { PageWrapper } from "@/components/page-wrapper"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { forecastData, isLoading } = useForecast()
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (forecastData.length > 0) {
      setIsInitialLoading(true)
      const timer = setTimeout(() => setIsInitialLoading(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [forecastData.length])

  if (loading || !user) return null

  if (isLoading || isInitialLoading) {
    return (
      <PageWrapper>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 overflow-x-hidden bg-white">
          <div className="animate-pulse space-y-12 sm:space-y-16">
            <div className="space-y-4">
              <div className="h-12 w-80 card-rounded bg-gray-100"></div>
              <div className="h-8 w-64 card-rounded bg-gray-100"></div>
            </div>
            <div className="grid gap-6 sm:gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="h-48 card-rounded bg-gray-100"></div>
                <div className="h-48 card-rounded bg-gray-100 sm:col-span-2 lg:col-span-2"></div>
              </div>
              <div className="h-96 card-rounded bg-gray-100"></div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (forecastData.length === 0) {
    return (
      <PageWrapper>
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 py-20 sm:py-32 lg:py-48 overflow-x-hidden bg-white">
          <div className="text-center space-y-12 sm:space-y-16 animate-fade-in">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight text-balance">
                Upload data to see forecasts
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light px-4 text-balance">
                Upload your historical sales data to generate intelligent forecasts and unlock actionable insights for
                your business decisions.
              </p>
            </div>
            <div className="mt-12">
              <Link href="/upload">
                <Button variant="gradient" size="xl">
                  Upload Data
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const totalForecast = forecastData.reduce((sum, item) => sum + item.forecast, 0)
  const avgConfidence = forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 overflow-x-hidden bg-white">
        <div className="mb-12 sm:mb-16 space-y-4 text-left animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">Forecast Dashboard</h1>
          <p className="text-xl text-gray-600 font-light">
            7-day intelligent demand forecast with confidence intervals
          </p>
        </div>

        {/* Enhanced Stats Cards with Animations */}
        <div className="mb-12 sm:mb-16 space-y-8">
          {/* Primary metric */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-8 animate-fade-in">
              <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full">
                <CardContent className="p-8 sm:p-12">
                  <div className="space-y-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Forecast Revenue</p>
                    <p className="text-5xl sm:text-6xl font-bold text-green-600 tracking-tight">
                      ${totalForecast.toLocaleString()}
                    </p>
                    <p className="text-lg text-gray-600 font-light text-balance">
                      Projected revenue for the next 7 days based on historical patterns and trends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 animate-fade-in-delay-1">
              <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full">
                <CardContent className="p-8 sm:p-12 h-full flex flex-col justify-center">
                  <div className="space-y-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg. Confidence</p>
                    <p className="text-5xl sm:text-6xl font-bold text-green-600 tracking-tight">
                      {avgConfidence.toFixed(0)}%
                    </p>
                    <p className="text-lg text-gray-600 font-light">Forecast accuracy level</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Supporting metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="animate-fade-in">
              <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl">
                <CardContent className="p-8 sm:p-12">
                  <div className="space-y-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Analysis Period</p>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">7 Days</p>
                    <p className="text-lg text-gray-600 font-light">Current forecast window</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-in-delay-1">
              <Link href="/chat" className="block group">
                <Card className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md border-0 card-rounded shadow-2xl text-white cursor-pointer h-full">
                  <CardContent className="p-8 sm:p-12 flex flex-col justify-center h-full">
                    <div className="space-y-6">
                      <p className="text-base font-bold text-white uppercase tracking-wider">AI Insights Available</p>
                      <p className="text-3xl font-bold tracking-tight">Ready for Analysis</p>
                      <div className="text-white/80 text-lg font-semibold">Explore Insights →</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="animate-fade-in-delay-2 forecast-table-container">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-2xl overflow-hidden">
            <CardHeader className="p-8 sm:p-12 pb-6 sm:pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-6 sm:space-y-0 sm:space-x-6">
                <div className="space-y-3 min-w-0 text-left">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                    </div>
                    <span className="truncate">7-Day Forecast Analysis</span>
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 leading-relaxed text-balance">
                    Detailed predictions with confidence intervals and trend analysis
                  </CardDescription>
                </div>
                <Link href="/chat">
                  <Button variant="gradient" size="lg" className="font-semibold">
                    View Chat Insights
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ForecastTable data={forecastData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
