"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { toast } from "sonner"
import { Download, CheckCircle, AlertCircle } from "lucide-react"
import { useForecast } from "@/context/ForecastContext"

interface ForecastData {
  date: string
  forecast: number
  confidence: number
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const { setForecastData } = useForecast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

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

    // Simulate processing
    setTimeout(() => {
      toast.success("Forecast completed!", {
        description: "Your demand forecast has been generated successfully.",
      })
      const mockData: ForecastData[] = [
        { date: "2024-07-23", forecast: 1200, confidence: 50 },
        { date: "2024-07-24", forecast: 1350, confidence: 75 },
        { date: "2024-07-25", forecast: 1100, confidence: 60 },
        { date: "2024-07-26", forecast: 1450, confidence: 80 },
        { date: "2024-07-27", forecast: 1300, confidence: 65 },
        { date: "2024-07-28", forecast: 1600, confidence: 90 },
        { date: "2024-07-29", forecast: 1250, confidence: 55 },
      ]
      setForecastData(mockData)
      setIsProcessing(false)
      router.push("/dashboard")
    }, 3000)
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
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 pt-32 overflow-x-hidden">
      <div className="mb-12 sm:mb-16 lg:mb-24 space-y-6 sm:space-y-8 lg:space-y-12 text-left animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">Upload Sales Data</h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl leading-relaxed font-light">
          Upload your CSV file with historical sales data to generate precise, actionable forecasts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
        {/* Requirements Card */}
        <div className="lg:col-span-5 order-2 lg:order-1 animate-fade-in-delay-1">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-xl h-full scale-hover">
            <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-8 sm:px-10">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Data Requirements
              </CardTitle>
              <CardDescription className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Your CSV file should contain the following essential columns:
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 sm:px-10 pb-8 sm:pb-10">
              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-start space-x-6 sm:space-x-8">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <span className="font-bold text-gray-900 text-lg sm:text-xl block truncate">date</span>
                      <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                        Date in YYYY-MM-DD format for temporal analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6 sm:space-x-8">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                    <div className="space-y-2 sm:space-y-3 min-w-0">
                      <span className="font-bold text-gray-900 text-lg sm:text-xl block truncate">sales</span>
                      <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                        Sales amount as numeric values for forecasting
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 sm:pt-6">
                  <Button
                    variant="outline"
                    onClick={downloadSampleCSV}
                    className="w-full btn-rounded border-gray-200 bg-white/90 backdrop-blur-sm hover:bg-gray-50 bounce-hover px-8 py-4 text-base sm:text-lg font-semibold flex items-center justify-center space-x-3"
                  >
                    <Download className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
                    <span>Download Sample CSV</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Card */}
        <div className="lg:col-span-7 order-1 lg:order-2 animate-fade-in">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 card-rounded shadow-2xl scale-hover">
            <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-8 sm:px-10">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Upload Your Data
              </CardTitle>
              <CardDescription className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Select your CSV file to begin the intelligent forecasting process
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 sm:px-10 pb-8 sm:pb-10">
              <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                <FileUploader onFileSelect={setFile} />

                {validationError && (
                  <div className="bg-red-50/80 backdrop-blur-sm card-rounded p-6 sm:p-8 border-2 border-red-600/20 shadow-sm animate-bounce-in error-state">
                    <div className="flex items-start space-x-4">
                      <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                      <div className="space-y-2">
                        <p className="font-bold text-red-600 text-lg">Validation Error</p>
                        <p className="text-red-600 text-base leading-relaxed">{validationError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {file && !validationError && (
                  <div className="bg-green-50/80 backdrop-blur-sm card-rounded p-6 sm:p-8 lg:p-10 border-2 border-green-600/20 shadow-sm animate-bounce-in">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                      <div className="space-y-3 min-w-0 flex-1">
                        <p className="font-bold text-green-600 text-lg">File Ready</p>
                        <p className="font-bold text-gray-900 text-lg sm:text-xl truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-gray-600 text-base sm:text-lg">Size: {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRunForecast}
                  disabled={!file || isProcessing || !!validationError}
                  className="w-full btn-primary text-white px-12 py-6 text-lg sm:text-xl font-bold shadow-2xl disabled:opacity-50 disabled:scale-100 border-0"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-4 sm:mr-6 h-6 w-6 sm:h-7 sm:w-7 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                      Processing Your Data...
                    </>
                  ) : (
                    "Run Forecast Analysis"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
