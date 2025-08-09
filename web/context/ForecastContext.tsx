"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { forecastService, ForecastData } from "@/lib/database"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

interface ModelMetrics {
  mape: number
  bias: number
  mae: number
  rmse: number
  r2: number
}

interface DataSummary {
  total_records: number
  date_range: {
    start: string
    end: string
  }
  average_daily_sales: number
}

interface ForecastContextType {
  forecastData: ForecastData[]
  modelMetrics: ModelMetrics | null
  dataSummary: DataSummary | null
  setForecastData: (data: ForecastData[]) => void
  setModelMetrics: (metrics: ModelMetrics | null) => void
  setDataSummary: (summary: DataSummary | null) => void
  saveForecastToDatabase: (data: Omit<ForecastData, 'user_id' | 'id' | 'created_at'>[]) => Promise<void>
  loadForecastFromDatabase: () => Promise<void>
  clearForecastData: () => void
  isLoading: boolean
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined)

export const ForecastProvider = ({ children }: { children: React.ReactNode }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null)
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  // Load user's forecast data when they log in
  useEffect(() => {
    if (user) {
      loadForecastFromDatabase()
    } else {
      // Clear data when user logs out
      setForecastData([])
      setModelMetrics(null)
      setDataSummary(null)
    }
  }, [user])

  const loadForecastFromDatabase = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await forecastService.loadForecast(supabase, user.id)
      setForecastData(data)
    } catch (error) {
      console.error('Failed to load forecast data:', error, JSON.stringify(error))
      toast.error('Failed to load your forecast data', {
        description: error instanceof Error ? error.message : JSON.stringify(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveForecastToDatabase = async (data: Omit<ForecastData, 'user_id' | 'id' | 'created_at'>[]) => {
    if (!user) {
      toast.error('You must be logged in to save forecast data')
      return
    }

    try {
      setIsLoading(true)
      // Clear existing data first
      await forecastService.deleteForecast(supabase, user.id)
      // Save new data
      const savedData = await forecastService.saveForecast(supabase, user.id, data)
      setForecastData(savedData)
      toast.success('Forecast data saved successfully')
    } catch (error) {
      console.error('Failed to save forecast data:', error, JSON.stringify(error))
      toast.error('Failed to save forecast data', {
        description: error instanceof Error ? error.message : JSON.stringify(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearForecastData = () => {
    setForecastData([])
    setModelMetrics(null)
    setDataSummary(null)
  }

  return (
    <ForecastContext.Provider value={{ 
      forecastData, 
      modelMetrics,
      dataSummary,
      setForecastData, 
      setModelMetrics,
      setDataSummary,
      saveForecastToDatabase, 
      loadForecastFromDatabase, 
      clearForecastData,
      isLoading 
    }}>
      {children}
    </ForecastContext.Provider>
  )
}

export const useForecast = () => {
  const context = useContext(ForecastContext)
  if (!context) throw new Error("useForecast must be used within a ForecastProvider")
  return context
}
