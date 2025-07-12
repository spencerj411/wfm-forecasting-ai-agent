"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForecastTable } from "@/components/forecast-table"
import { TrendingUp } from "lucide-react"
import { useForecast } from "@/context/ForecastContext"

interface ForecastData {
  date: string
  forecast: number
  confidence: number
}

export default function DashboardPage() {
  const { forecastData } = useForecast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (forecastData.length > 0) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [forecastData.length])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 pt-28 overflow-x-hidden">
        <div className="animate-pulse space-y-8 sm:space-y-12 lg:space-y-16">
          <div className="space-y-3 sm:space-y-4">
            <div className="h-8 sm:h-10 lg:h-12 w-64 sm:w-80 lg:w-96 rounded-xl bg-gray-100"></div>
            <div className="h-4 sm:h-5 lg:h-6 w-48 sm:w-64 lg:w-80 rounded-xl bg-gray-100"></div>
          </div>
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="h-32 sm:h-36 lg:h-40 rounded-xl bg-gray-100"></div>
              <div className="h-32 sm:h-36 lg:h-40 rounded-xl bg-gray-100 sm:col-span-2 lg:col-span-2"></div>
            </div>
            <div className="h-64 sm:h-80 lg:h-96 rounded-xl bg-gray-100"></div>
          </div>
        </div>
      </div>
    )
  }

  if (forecastData.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-40 pt-28 overflow-x-hidden">
        <div className="text-center space-y-8 sm:space-y-12">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <TrendingUp className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" strokeWidth={1} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              No forecast data available
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light px-4">
              Upload your historical sales data to generate intelligent forecasts and unlock actionable insights for
              your business.
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 h-11 rounded-xl border-0 text-base sm:text-lg font-medium shadow-xl hover:shadow-2xl hover:scale-102 transition-all duration-300"
          >
            <Link href="/upload">Upload Data</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalForecast = forecastData.reduce((sum, item) => sum + item.forecast, 0)
  const avgConfidence = forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 pt-28 overflow-x-hidden">
      <div className="mb-8 sm:mb-12 lg:mb-20 space-y-3 sm:space-y-4 lg:space-y-6 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Forecast Dashboard</h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-light">
          7-day intelligent demand forecast with confidence intervals
        </p>
      </div>

      {/* Enhanced Stats Cards with Animations */}
      <div className="mb-8 sm:mb-12 lg:mb-20 space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Primary metric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-8">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-lg h-full hover:scale-102 hover:shadow-xl hover:rotate-1 transition-all duration-300 ease-out">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Total Forecast Revenue
                  </p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 tracking-tight">
                    ${totalForecast.toLocaleString()}
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-light">
                    Projected revenue for the next 7 days based on historical patterns and trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-lg h-full hover:scale-102 hover:shadow-xl hover:rotate-1 transition-all duration-300 ease-out">
              <CardContent className="p-6 sm:p-8 lg:p-12 h-full flex flex-col justify-center">
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Avg. Confidence
                  </p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                    {avgConfidence.toFixed(0)}%
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 font-light">Forecast accuracy level</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supporting metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-lg hover:scale-102 hover:shadow-xl hover:rotate-1 transition-all duration-300 ease-out">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-4 sm:space-y-6">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Analysis Period
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">7 Days</p>
                <p className="text-sm sm:text-base text-gray-600 font-light">Current forecast window</p>
              </div>
            </CardContent>
          </Card>

          <Link href="/chat" className="block group">
            <Card className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md border-0 rounded-xl shadow-xl text-white hover:scale-102 hover:shadow-2xl hover:rotate-1 transition-all duration-300 ease-out cursor-pointer">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-xs sm:text-sm font-semibold text-blue-100 uppercase tracking-wider">
                    AI Insights Available
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">Ready for Analysis</p>
                  <div className="text-white text-sm sm:text-base font-medium">Explore Insights →</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Forecast Table */}
      <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-xl overflow-hidden hover:scale-102 hover:shadow-2xl hover:rotate-1 transition-all duration-300 ease-out">
        <CardHeader className="p-6 sm:p-8 lg:p-12 pb-4 sm:pb-6 lg:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="space-y-2 sm:space-y-4 min-w-0 text-left">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight flex items-center space-x-2 sm:space-x-3">
                <TrendingUp
                  className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 opacity-70 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <span className="truncate">7-Day Forecast Analysis</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Detailed predictions with confidence intervals and trend analysis
              </CardDescription>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-8 py-3 h-11 border-0 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-300 flex-shrink-0"
            >
              <Link href="/chat">View Detailed Insights</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ForecastTable data={forecastData} />
        </CardContent>
      </Card>
    </div>
  )
}
