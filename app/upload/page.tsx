"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "../../components/file-uploader"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, FileText } from "lucide-react"
import { useForecast } from "../../context/ForecastContext"
import { PageWrapper } from "@/components/page-wrapper"
import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

interface ForecastData {
  date: string
  forecast: number
  confidence: number
}

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  const [file, setFile] = useState<File | null>(null)
  const { saveForecastToDatabase } = useForecast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateCSV = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        if (lines.length < 2) {
          setValidationError("Invalid CSV: File must contain at least a header and one data row.")
          toast.error("Invalid CSV file", {
            description: "File must contain at least a header and one data row.",
          })
          resolve(false)
          return
        }

        const headers = lines[0]
          .toLowerCase()
          .split(",")
          .map((h) => h.trim())
        const hasDate = headers.some((h) => h.includes("date"))
        const hasSales = headers.some((h) => h.includes("sales") || h.includes("revenue"))

        if (!hasDate || !hasSales) {
          setValidationError('Missing required columns: CSV must contain "date" and "sales" columns.')
          toast.error("Missing required columns", {
            description: 'CSV must contain "date" and "sales" columns.',
          })
          resolve(false)
          return
        }

        setValidationError(null)
        resolve(true)
      }
      reader.readAsText(file)
    })
  }

  const handleRunForecast = async () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please upload a CSV file first.",
      })
      return
    }

    const isValid = await validateCSV(file)
    if (!isValid) return

    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock forecast data
      const mockData = [
        { date: "2024-07-23", forecast: 1200, confidence: 50 },
        { date: "2024-07-24", forecast: 1350, confidence: 75 },
        { date: "2024-07-25", forecast: 1100, confidence: 60 },
        { date: "2024-07-26", forecast: 1450, confidence: 80 },
        { date: "2024-07-27", forecast: 1300, confidence: 65 },
        { date: "2024-07-28", forecast: 1600, confidence: 90 },
        { date: "2024-07-29", forecast: 1250, confidence: 55 },
      ]

      // Save to database
      await saveForecastToDatabase(mockData)
      
      toast.success("Forecast completed!", {
        description: "Your demand forecast has been generated and saved successfully.",
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error('Forecast processing failed:', error)
      toast.error("Forecast processing failed", {
        description: "Please try again or contact support if the problem persists.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `date,sales
2024-01-01,1200
2024-01-02,1350
2024-01-03,1100
2024-01-04,1450
2024-01-05,1300
2024-01-06,1600
2024-01-07,1250`

    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-sales-data.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Sample CSV downloaded!", {
      description: "Use this template for your sales data.",
    })
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 overflow-x-hidden bg-white">
        <div className="mb-12 sm:mb-16 lg:mb-24 space-y-6 sm:space-y-8 text-left animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight text-balance">
            Upload Sales Data
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl leading-relaxed font-light text-balance">
            Upload your CSV file with historical sales data to generate precise, actionable forecasts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Requirements Card */}
          <div className="lg:col-span-5 order-2 lg:order-1 animate-fade-in-delay-1">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-8 sm:px-10">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
                  <span>Data Requirements</span>
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed text-balance">
                  Your CSV file should contain the following essential columns:
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 sm:px-10 pb-8 sm:pb-10">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-3 w-3 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <div className="space-y-2 min-w-0">
                        <span className="font-bold text-gray-900 text-lg block truncate">date</span>
                        <p className="text-gray-600 leading-relaxed text-base text-balance">
                          Date in YYYY-MM-DD format for temporal analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="h-3 w-3 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <div className="space-y-2 min-w-0">
                        <span className="font-bold text-gray-900 text-lg block truncate">sales</span>
                        <p className="text-gray-600 leading-relaxed text-base text-balance">
                          Sales amount as numeric values for forecasting
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={downloadSampleCSV}
                      variant="outline"
                      size="lg"
                      className="w-full font-semibold bg-transparent"
                      aria-label="Download sample CSV file"
                    >
                      Download Sample CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Card */}
          <div className="lg:col-span-7 order-1 lg:order-2 animate-fade-in">
            <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-8 sm:px-10">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">Upload Your Data</CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed text-balance">
                  Select your CSV file to begin the intelligent forecasting process
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 sm:px-10 pb-8 sm:pb-10">
                <div className="space-y-8">
                  <FileUploader onFileSelect={setFile} error={!!validationError} />

                  {validationError && (
                    <div className="bg-red-50/80 backdrop-blur-sm card-rounded p-6 border-2 border-red-600/20 shadow-sm animate-bounce-in error-state">
                      <div className="flex items-start space-x-4">
                        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <div className="space-y-2">
                          <p className="font-bold text-red-600 text-base">Validation Error</p>
                          <p className="text-red-600 text-base leading-relaxed">{validationError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {file && !validationError && (
                    <div className="bg-green-50/80 backdrop-blur-sm card-rounded p-6 border-2 border-green-600/20 shadow-sm animate-bounce-in">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <div className="space-y-3 min-w-0 flex-1">
                          <p className="font-bold text-green-600 text-base">File Ready</p>
                          <p className="font-bold text-gray-900 text-lg truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-gray-600 text-base">Size: {(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={handleRunForecast}
                      disabled={!file || isProcessing || !!validationError}
                      variant="gradient"
                      size="lg"
                      className="w-full font-semibold"
                      aria-label="Run forecast analysis on uploaded data"
                    >
                      {isProcessing ? "Processing..." : "Run Forecast Analysis"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
