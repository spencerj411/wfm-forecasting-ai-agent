"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { forecastService, ForecastData } from "@/lib/database"
import { toast } from "sonner"

interface ForecastContextType {
  forecastData: ForecastData[]
  setForecastData: (data: ForecastData[]) => void
  saveForecastToDatabase: (data: Omit<ForecastData, 'user_id' | 'id' | 'created_at'>[]) => Promise<void>
  loadForecastFromDatabase: () => Promise<void>
  clearForecastData: () => void
  isLoading: boolean
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined)

export const ForecastProvider = ({ children }: { children: React.ReactNode }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Load user's forecast data when they log in
  useEffect(() => {
    if (user) {
      loadForecastFromDatabase()
    } else {
      // Clear data when user logs out
      setForecastData([])
    }
  }, [user])

  const loadForecastFromDatabase = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await forecastService.loadForecast(user.id)
      setForecastData(data)
    } catch (error) {
      console.error('Failed to load forecast data:', error)
      toast.error('Failed to load your forecast data')
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
      await forecastService.deleteForecast(user.id)
      // Save new data
      const savedData = await forecastService.saveForecast(user.id, data)
      setForecastData(savedData)
      toast.success('Forecast data saved successfully')
    } catch (error) {
      console.error('Failed to save forecast data:', error)
      toast.error('Failed to save forecast data')
    } finally {
      setIsLoading(false)
    }
  }

  const clearForecastData = () => {
    setForecastData([])
  }

  return (
    <ForecastContext.Provider value={{ 
      forecastData, 
      setForecastData, 
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
