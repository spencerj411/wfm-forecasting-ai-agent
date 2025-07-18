"use client"

import React, { createContext, useContext, useState } from "react";

interface ForecastData {
  date: string;
  forecast: number;
  confidence: number;
}

interface ForecastContextType {
  forecastData: ForecastData[];
  setForecastData: (data: ForecastData[]) => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: React.ReactNode }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  return (
    <ForecastContext.Provider value={{ forecastData, setForecastData }}>
      {children}
    </ForecastContext.Provider>
  );
};

export const useForecast = () => {
  const context = useContext(ForecastContext);
  if (!context) throw new Error("useForecast must be used within a ForecastProvider");
  return context;
}; 