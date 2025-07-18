"use client"

import Link from "next/link"
import { TrendingUp, Upload, MessageCircle, BarChart3, CheckCircle, Database, Brain } from "lucide-react"
import { ScrollAnimationWrapper } from "./scroll-animation-wrapper"

export function FeaturesSection() {
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-20 sm:py-32 lg:py-40">
      <div className="space-y-24 sm:space-y-32 lg:space-y-40">
        {/* Feature 1 - Easy Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <ScrollAnimationWrapper animationType="left" className="lg:col-span-6 order-2 lg:order-1">
            <Link href="/upload" className="block group">
              <div className="relative bg-gray-50/90 backdrop-blur-md card-rounded p-12 sm:p-16 lg:p-20 h-auto shadow-xl transform -rotate-2 scale-hover cursor-pointer border border-gray-600/10 hover:scale-[1.02] transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600/10 rounded-full flex items-center justify-center">
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <Database
                      className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-600 opacity-70"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-bold text-gray-900">Easy Upload</h4>
                    <p className="text-base text-gray-600 max-w-sm leading-relaxed text-balance">
                      Drag & drop your CSV files with sales data. Instant validation and error detection keeps your data
                      clean and ready for analysis.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper
            animationType="right"
            className="lg:col-span-6 space-y-6 sm:space-y-8 lg:space-y-12 order-1 lg:order-2 text-left"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
              Effortless Data Upload
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-light text-balance">
              Simply upload your CSV files with date and sales data to get started. Our intelligent system automatically
              validates your data and provides instant, actionable feedback with real-time error detection and helpful
              suggestions.
            </p>
            <div className="flex items-center space-x-4 text-green-600">
              <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-lg font-semibold">Instant validation & feedback</span>
            </div>
          </ScrollAnimationWrapper>
        </div>

        {/* Feature 2 - Smart Forecasting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <ScrollAnimationWrapper
            animationType="left"
            className="lg:col-span-6 space-y-6 sm:space-y-8 lg:space-y-12 text-left"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
              Smart Forecasting
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-light text-balance">
              Generate precise 7-day demand forecasts with confidence intervals. Our advanced machine learning
              algorithms identify complex patterns, seasonal trends, and market fluctuations to deliver accurate
              predictions that drive better business decisions.
            </p>
            <div className="flex items-center space-x-4 text-green-600">
              <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-lg font-semibold">7-day forecasts with confidence levels</span>
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper animationType="right" className="lg:col-span-6">
            <Link href="/dashboard" className="block group">
              <div className="relative bg-green-50/40 backdrop-blur-md card-rounded p-12 sm:p-16 lg:p-20 h-auto shadow-xl transform rotate-2 scale-hover cursor-pointer border border-green-600/10 hover:scale-[1.02] transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-600/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" strokeWidth={1.5} />
                    </div>
                    <BarChart3
                      className="absolute -bottom-2 -right-2 h-8 w-8 text-green-600 opacity-70"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-bold text-gray-900">Smart Forecasting</h4>
                    <p className="text-base text-gray-600 max-w-sm leading-relaxed text-balance">
                      View detailed 7-day predictions with confidence intervals and trend analysis for better planning
                      and decision making.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollAnimationWrapper>
        </div>

        {/* Feature 3 - AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <ScrollAnimationWrapper animationType="left" className="lg:col-span-6 order-2 lg:order-1">
            <Link href="/chat" className="block group">
              <div className="relative bg-blue-50/40 backdrop-blur-md card-rounded p-12 sm:p-16 lg:p-20 h-auto shadow-xl transform -rotate-1 scale-hover cursor-pointer border border-blue-600/10 hover:scale-[1.02] transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <Brain className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-600 opacity-70" strokeWidth={1.5} />
                  </div>
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h4>
                    <p className="text-base text-gray-600 max-w-sm leading-relaxed text-balance">
                      Ask natural language questions about your forecasts and get intelligent, actionable insights
                      powered by advanced AI.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper
            animationType="right"
            className="lg:col-span-6 space-y-6 sm:space-y-8 lg:space-y-12 order-1 lg:order-2 text-left"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-balance">
              Conversational AI Insights
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed font-light text-balance">
              Engage with our AI assistant to decode your forecasts and discover actionable insights that transform data
              into strategic business decisions. Ask questions in natural language and get instant, intelligent
              responses tailored to your specific data patterns.
            </p>
            <div className="flex items-center space-x-4 text-green-600">
              <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-lg font-semibold">Natural language queries & insights</span>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </div>
  )
}
