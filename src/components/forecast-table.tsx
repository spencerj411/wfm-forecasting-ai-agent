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

  return (
    <div className="overflow-x-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-lg mx-6 sm:mx-8 lg:mx-12 mb-6 sm:mb-8 lg:mb-12">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/30">
                <TableHead className="font-semibold text-gray-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 text-sm sm:text-base">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:opacity-70 transition-opacity duration-300 text-sm sm:text-base"
                  >
                    Date{getSortIndicator("date")}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 text-sm sm:text-base">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("forecast")}
                    className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:opacity-70 transition-opacity duration-300 text-sm sm:text-base"
                  >
                    Forecast Sales{getSortIndicator("forecast")}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 text-sm sm:text-base">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("confidence")}
                    className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:opacity-70 transition-opacity duration-300 text-sm sm:text-base"
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
                  className={`border-gray-100 hover:bg-blue-50/30 transition-colors duration-300 group ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                  }`}
                >
                  <TableCell className="font-medium text-gray-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 text-sm sm:text-base">
                    <span className="block sm:hidden" title={formatDate(row.date).full}>
                      {formatDate(row.date).short}
                    </span>
                    <span className="hidden sm:block">{formatDate(row.date).full}</span>
                  </TableCell>
                  <TableCell className="text-gray-900 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10 font-semibold text-sm sm:text-base">
                    <span className="truncate block" title={`$${row.forecast.toLocaleString()} ± $${row.confidence}`}>
                      ${row.forecast.toLocaleString()} ± ${row.confidence}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-3 max-w-16 sm:max-w-24 lg:max-w-32">
                        <div
                          className="bg-blue-600 bg-opacity-90 h-2 sm:h-3 rounded-full transition-all duration-700 group-hover:bg-opacity-100"
                          style={{ width: `${row.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-600 min-w-[2.5rem] sm:min-w-[3rem] lg:min-w-[4rem]">
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
      <div className="md:hidden px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="space-y-4">
          {sortedData.map((row, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-blue-50/20 ${
                index % 2 === 0 ? "" : "bg-gray-50/30"
              }`}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">{formatDate(row.date).short}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{formatDate(row.date).full}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Forecast Sales</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      ${row.forecast.toLocaleString()} ± ${row.confidence}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="font-semibold text-gray-600 text-sm">{row.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 bg-opacity-90 h-2 rounded-full transition-all duration-700"
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
