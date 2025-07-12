"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { toast } from "sonner"
import { Download } from "lucide-react"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const validateCSV = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        if (lines.length < 2) {
          toast.error('Invalid CSV')
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
          toast.error('Missing required columns')
          resolve(false)
          return
        }

        resolve(true)
      }
      reader.readAsText(file)
    })
  }

  const handleRunForecast = async () => {
    if (!file) {
      toast.error('No file selected')
      return
    }

    const isValid = await validateCSV(file)
    if (!isValid) return

    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      toast.success('Forecast completed!')
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
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 pt-28 overflow-x-hidden">
      <div className="mb-8 sm:mb-12 lg:mb-20 space-y-4 sm:space-y-6 lg:space-y-8 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Upload Sales Data</h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl leading-relaxed font-light">
          Upload your CSV file with historical sales data to generate precise, actionable forecasts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        {/* Requirements Card */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-lg h-full hover:scale-102 hover:shadow-xl hover:rotate-1 transition-all duration-300 ease-out">
            <CardHeader className="pb-4 sm:pb-6 pt-6 sm:pt-8 px-6 sm:px-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Data Requirements
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Your CSV file should contain the following essential columns:
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-4 sm:space-x-6">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-blue-600 opacity-90 mt-2 flex-shrink-0"></div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg block truncate">date</span>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        Date in YYYY-MM-DD format for temporal analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 sm:space-x-6">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-blue-600 opacity-90 mt-2 flex-shrink-0"></div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg block truncate">sales</span>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        Sales amount as numeric values for forecasting
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 sm:pt-4">
                  <Button
                    variant="outline"
                    onClick={downloadSampleCSV}
                    className="w-full rounded-xl border-gray-200 bg-white/90 backdrop-blur-sm hover:bg-gray-50 hover:scale-102 transition-all duration-300 px-8 py-3 h-11 text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                    <span>Download Sample CSV</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Card */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <Card className="bg-gray-50/90 backdrop-blur-md border-0 rounded-xl shadow-xl hover:scale-102 hover:shadow-2xl hover:rotate-1 transition-all duration-300 ease-out">
            <CardHeader className="pb-4 sm:pb-6 pt-6 sm:pt-8 px-6 sm:px-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Upload Your Data
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Select your CSV file to begin the intelligent forecasting process
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <FileUploader onFileSelect={setFile} />

                {file && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm">
                    <div className="space-y-2 sm:space-y-3">
                      <p className="font-semibold text-gray-900 text-base sm:text-lg truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">Size: {(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRunForecast}
                  disabled={!file || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-8 py-3 h-11 text-base sm:text-lg font-medium shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-102 disabled:opacity-50 disabled:scale-100 border-0"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
