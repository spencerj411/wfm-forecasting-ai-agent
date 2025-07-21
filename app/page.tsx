"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { FeaturesSection } from "@/components/features-section"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <PageWrapper>
      <div className="relative overflow-x-hidden bg-white">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">
          <div className="max-w-5xl space-y-12 lg:space-y-16 animate-fade-in">
            <div className="space-y-8 lg:space-y-12 text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight text-balance">
                Welcome to the <span className="text-blue-600">Demand Forecasting</span> Agent
              </h1>
              <div className="max-w-3xl">
                <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-light text-balance">
                  Upload data to analyse forecasts and gain insights. Our AI-powered platform helps you make data-driven
                  decisions with accurate demand predictions.
                </p>
              </div>
            </div>
            <div className="pt-8 lg:pt-12">
              <Link href={user ? "/home" : "/login"}>
                <Button variant="gradient" size="xl">
                  {user ? "Go to Home" : "Login"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <FeaturesSection />
      </div>
    </PageWrapper>
  )
}
