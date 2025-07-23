"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface ForecastData {
  date: string
  forecast: number
  confidence: number
}

interface ForecastTableProps {
  data: ForecastData[]
}

export function ForecastTable({ data }: ForecastTableProps) {
  const [sortField, setSortField] = useState<keyof ForecastData>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: keyof ForecastData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      short: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      full: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
  }

  const getSortIndicator = (field: keyof ForecastData) => {
    if (sortField !== field) return ""
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const isHighForecast = (forecast: number) => {
    const avgForecast = data.reduce((sum, item) => sum + item.forecast, 0) / data.length
    return forecast > avgForecast
  }

  return (
    <div className="overflow-x-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white card-rounded border border-gray-100 overflow-hidden shadow-xl mx-8 sm:mx-12 lg:mx-16 mb-8 sm:mb-12 lg:mb-16">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="font-bold text-gray-900 py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12 text-base sm:text-lg">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="h-auto p-0 font-bold text-gray-900 hover:bg-transparent hover:opacity-70 transition-all duration-500 text-base sm:text-lg"
                  >
                    Date{getSortIndicator("date")}
                  </Button>
                </TableHead>
                <TableHead className="font-bold text-gray-900 py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12 text-base sm:text-lg">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("forecast")}
                    className="h-auto p-0 font-bold text-gray-900 hover:bg-transparent hover:opacity-70 transition-all duration-500 text-base sm:text-lg"
                  >
                    Forecast Sales{getSortIndicator("forecast")}
                  </Button>
                </TableHead>
                <TableHead className="font-bold text-gray-900 py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12 text-base sm:text-lg">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("confidence")}
                    className="h-auto p-0 font-bold text-gray-900 hover:bg-transparent hover:opacity-70 transition-all duration-500 text-base sm:text-lg"
                  >
                    Confidence Level{getSortIndicator("confidence")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={`border-gray-100 transition-colors duration-300 group ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  } ${isHighForecast(row.forecast) ? "forecast-high" : ""}`}
                >
                  <TableCell className="font-semibold text-gray-900 py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12 text-base sm:text-lg">
                    <span className="block sm:hidden" title={formatDate(row.date).full}>
                      {formatDate(row.date).short}
                    </span>
                    <span className="hidden sm:block">{formatDate(row.date).full}</span>
                  </TableCell>
                  <TableCell className="text-gray-900 py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12 font-bold text-base sm:text-lg">
                    <span className="truncate block" title={`$${row.forecast.toLocaleString()}`}>
                      ${row.forecast.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-6 sm:py-8 lg:py-10 px-6 sm:px-8 lg:px-12">
                    <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                      <div className="flex-1 bg-gray-100 rounded-full h-3 sm:h-4 max-w-20 sm:max-w-28 lg:max-w-36">
                        <div
                          className={`h-3 sm:h-4 rounded-full transition-all duration-300 ${
                            row.confidence >= 70 ? "bg-green-600" : row.confidence >= 50 ? "bg-blue-600" : "bg-gray-400"
                          }`}
                          style={{ width: `${row.confidence}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm sm:text-base lg:text-lg font-bold min-w-[3rem] sm:min-w-[4rem] lg:min-w-[5rem] ${
                          row.confidence >= 70
                            ? "text-green-600"
                            : row.confidence >= 50
                              ? "text-blue-600"
                              : "text-gray-500"
                        }`}
                      >
                        {row.confidence}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden px-6 sm:px-8 pb-8 sm:pb-12">
        <div className="space-y-6">
          {sortedData.map((row, index) => (
            <div
              key={index}
              className={`bg-white card-rounded border border-gray-100 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                index % 2 === 0 ? "" : "bg-gray-50/50"
              } ${isHighForecast(row.forecast) ? "forecast-high" : ""}`}
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-lg sm:text-xl">{formatDate(row.date).short}</span>
                  <span className="text-sm sm:text-base text-gray-500">{formatDate(row.date).full}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600 font-semibold">Forecast Sales</span>
                    <span className="font-bold text-gray-900 text-base sm:text-lg">
                      ${row.forecast.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-600 font-semibold">Confidence</span>
                      <span
                        className={`font-bold text-base ${
                          row.confidence >= 70
                            ? "text-green-600"
                            : row.confidence >= 50
                              ? "text-blue-600"
                              : "text-gray-500"
                        }`}
                      >
                        {row.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          row.confidence >= 70 ? "bg-green-600" : row.confidence >= 50 ? "bg-blue-600" : "bg-gray-400"
                        }`}
                        style={{ width: `${row.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
