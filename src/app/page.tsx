import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Upload, MessageCircle, ArrowUpRight, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden pt-20">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
        <div className="max-w-4xl space-y-8 lg:space-y-12">
          <div className="space-y-6 lg:space-y-8 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              <span className="text-blue-600 opacity-90">Agentic AI </span> for Workforce Management Demand Forecasting
            </h1>
            <div className="max-w-2xl">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed font-light">
                Upload data to analyse forecasts and gain insights. Our AI-powered platform helps you make data-driven
                decisions with accurate demand predictions.
              </p>
            </div>
          </div>
          <div className="pt-4 lg:pt-8">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 h-11 text-base sm:text-lg font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-102 border-0"
            >
              <Link href="/upload">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {/* Feature 1 - Easy Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <Link href="/upload" className="block group">
                <div className="relative bg-gray-50/90 backdrop-blur-md rounded-xl p-8 sm:p-12 lg:p-16 h-48 sm:h-64 lg:h-80 shadow-lg transform -rotate-1 transition-all duration-300 ease-out group-hover:scale-102 group-hover:shadow-xl group-hover:rotate-1 cursor-pointer">
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="relative">
                      <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 opacity-70" strokeWidth={1} />
                      <ArrowUpRight
                        className="absolute -top-2 -right-2 h-6 w-6 text-blue-600 opacity-50"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900">Quick CSV Upload</h4>
                      <p className="text-sm sm:text-base text-gray-600 max-w-xs">
                        Drag & drop your sales data and get instant validation
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2 text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                Effortless Upload
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
                Simply upload your CSV files with date and sales data to get started. Our intelligent system
                automatically validates your data and provides instant, actionable feedback with real-time error
                detection.
              </p>
            </div>
          </div>

          {/* Feature 2 - Smart Forecasting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8 text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                Intelligent Forecasting
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
                Generate precise 7-day demand forecasts with confidence intervals. Our advanced machine learning
                algorithms identify complex patterns, seasonal trends, and market fluctuations to deliver accurate
                predictions.
              </p>
            </div>
            <div className="lg:col-span-6">
              <Link href="/dashboard" className="block group">
                <div className="relative bg-gray-50/90 backdrop-blur-md rounded-xl p-8 sm:p-12 lg:p-16 h-48 sm:h-64 lg:h-80 shadow-lg transform rotate-1 transition-all duration-300 ease-out group-hover:scale-102 group-hover:shadow-xl group-hover:rotate-2 cursor-pointer">
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="relative">
                      <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 opacity-70" strokeWidth={1} />
                      <BarChart3
                        className="absolute -bottom-2 -right-2 h-6 w-6 text-blue-600 opacity-50"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900">7-Day Forecasts</h4>
                      <p className="text-sm sm:text-base text-gray-600 max-w-xs">
                        View detailed predictions with confidence intervals
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Feature 3 - AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <Link href="/chat" className="block group">
                <div className="relative bg-blue-600/10 backdrop-blur-md rounded-xl p-12 sm:p-16 lg:p-20 h-48 sm:h-56 lg:h-64 shadow-xl transition-all duration-300 ease-out group-hover:scale-102 group-hover:shadow-2xl group-hover:rotate-1 cursor-pointer">
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 opacity-90" strokeWidth={1} />
                    <div className="text-center space-y-2">
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900">AI Chat Assistant</h4>
                      <p className="text-sm sm:text-base text-gray-600">Ask questions about your forecasts</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2 text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                Conversational Insights
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
                Engage with our AI assistant to decode your forecasts and discover actionable insights that transform
                data into strategic business decisions with natural language queries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
