"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForecastTable } from "@/components/forecast-table"
import { TrendingUp, MessageCircle } from "lucide-react"
import { useForecast } from "@/context/ForecastContext"

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
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-32 overflow-x-hidden">
        <div className="animate-pulse space-y-12 sm:space-y-16 lg:space-y-20">
          <div className="space-y-4 sm:space-y-6">
            <div className="h-12 sm:h-16 lg:h-20 w-80 sm:w-96 lg:w-[32rem] card-rounded bg-gray-100"></div>
            <div className="h-6 sm:h-8 lg:h-10 w-64 sm:w-80 lg:w-96 card-rounded bg-gray-100"></div>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              <div className="h-40 sm:h-48 lg:h-56 card-rounded bg-gray-100"></div>
              <div className="h-40 sm:h-48 lg:h-56 card-rounded bg-gray-100 sm:col-span-2 lg:col-span-2"></div>
            </div>
            <div className="h-80 sm:h-96 lg:h-[32rem] card-rounded bg-gray-100"></div>
          </div>
        </div>
      </div>
    )
  }

  if (forecastData.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 py-20 sm:py-32 lg:py-48 pt-32 overflow-x-hidden">
        <div className="text-center space-y-12 sm:space-y-16 animate-fade-in">
          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Upload data to see forecasts
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Upload your historical sales data to generate intelligent forecasts and unlock actionable insights for
              your business decisions.
            </p>
          </div>
          <Button
            asChild
            className="btn-primary text-white px-12 py-6 text-xl sm:text-2xl font-bold shadow-2xl border-0"
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
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-32 overflow-x-hidden">
      <div className="mb-12 sm:mb-16 lg:mb-24 space-y-4 sm:space-y-6 lg:space-y-8 text-left animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">Forecast Dashboard</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-light">
          7-day intelligent demand forecast with confidence intervals
        </p>
      </div>

      {/* Enhanced Stats Cards with Animations */}
      <div className="mb-12 sm:mb-16 lg:mb-24 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Primary metric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-8 animate-fade-in">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full scale-hover">
              <CardContent className="p-8 sm:p-12 lg:p-16">
                <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                  <p className="text-sm sm:text-base font-bold text-gray-500 uppercase tracking-wider">
                    Total Forecast Revenue
                  </p>
                  <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-green-600 tracking-tight">
                    ${totalForecast.toLocaleString()}
                  </p>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-light">
                    Projected revenue for the next 7 days based on historical patterns and trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 animate-fade-in-delay-1">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full scale-hover">
              <CardContent className="p-8 sm:p-12 lg:p-16 h-full flex flex-col justify-center">
                <div className="space-y-6 sm:space-y-8">
                  <p className="text-sm sm:text-base font-bold text-gray-500 uppercase tracking-wider">
                    Avg. Confidence
                  </p>
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-600 tracking-tight">
                    {avgConfidence.toFixed(0)}%
                  </p>
                  <p className="text-base sm:text-lg text-gray-600 font-light">Forecast accuracy level</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supporting metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="animate-fade-in">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl scale-hover">
              <CardContent className="p-8 sm:p-12 lg:p-14">
                <div className="space-y-6 sm:space-y-8">
                  <p className="text-sm sm:text-base font-bold text-gray-500 uppercase tracking-wider">
                    Analysis Period
                  </p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">7 Days</p>
                  <p className="text-base sm:text-lg text-gray-600 font-light">Current forecast window</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in-delay-1">
            <Link href="/chat" className="block group">
              <Card className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md border-0 card-rounded shadow-2xl text-white scale-hover cursor-pointer">
                <CardContent className="p-8 sm:p-12 lg:p-14">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-blue-100 uppercase tracking-wider">
                        AI Insights Available
                      </p>
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Ready for Analysis</p>
                    <div className="text-white text-base sm:text-lg font-semibold">Explore Insights →</div>
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
          <CardHeader className="p-8 sm:p-12 lg:p-16 pb-6 sm:pb-8 lg:pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-6 sm:space-y-0 sm:space-x-6">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 min-w-0 text-left">
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" strokeWidth={1.5} />
                  </div>
                  <span className="truncate">7-Day Forecast Analysis</span>
                </CardTitle>
                <CardDescription className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed">
                  Detailed predictions with confidence intervals and trend analysis
                </CardDescription>
              </div>
              <Button
                asChild
                className="btn-primary text-white px-8 py-4 text-base sm:text-lg font-bold shadow-xl border-0 flex-shrink-0 scale-hover"
              >
                <Link href="/chat">View Chat Insights</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ForecastTable data={forecastData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
