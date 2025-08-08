"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '../file-uploader'
import { PDFUploader } from '../business-rules/PDFUploader'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, FileText, Loader2, Upload, Settings } from 'lucide-react'
import { useForecast } from '../../context/ForecastContext'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

type Step = 'sales-data' | 'business-rules' | 'generate-forecast'

interface StepData {
  salesFile?: File
  businessRulesFile?: File
  businessRulesDocuments?: any[]
  isComplete: boolean
}

export function MultiStepUpload() {
  const { user } = useAuth()
  const router = useRouter()
  const { saveForecastToDatabase, setModelMetrics, setDataSummary } = useForecast()
  
  const [currentStep, setCurrentStep] = useState<Step>('sales-data')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stepData, setStepData] = useState<Record<Step, StepData>>({
    'sales-data': { isComplete: false },
    'business-rules': { isComplete: false, businessRulesDocuments: [] },
    'generate-forecast': { isComplete: false }
  })

  const steps = [
    {
      id: 'sales-data' as const,
      title: 'Historical Sales Data',
      description: 'Upload your CSV file with historical sales data',
      icon: Upload,
      required: true
    },
    {
      id: 'business-rules' as const,
      title: 'Business Rules',
      description: 'Upload employment contracts and policies (optional)',
      icon: Settings,
      required: false
    },
    {
      id: 'generate-forecast' as const,
      title: 'Generate Forecast',
      description: 'Create AI-powered forecasts with your business rules',
      icon: FileText,
      required: true
    }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  // Auto-scroll current step into view on mobile
  useEffect(() => {
    const scrollToCurrentStep = () => {
      const stepElement = document.getElementById(`step-${currentStep}`)
      if (stepElement) {
        stepElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToCurrentStep, 100)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Handle sales data upload
  const handleSalesFileSelect = (file: File) => {
    setStepData(prev => ({
      ...prev,
      'sales-data': {
        ...prev['sales-data'],
        salesFile: file,
        isComplete: true
      }
    }))
  }

  // Handle business rules PDF file selection
  const handleBusinessRulesPDFSelect = (file: File | null) => {
    if (!file) return
    
    setStepData(prev => ({
      ...prev,
      'business-rules': {
        ...prev['business-rules'],
        businessRulesFile: file,
        isComplete: true
      }
    }))
  }


  // Save historical sales data to Supabase
  const saveHistoricalSalesData = async (csvData: string) => {
    const supabase = createClient()
    
    try {
      console.log('Saving historical sales data to Supabase...')
      
      // Parse CSV data
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Find column indices
      const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('timestamp'))
      const salesIndex = headers.findIndex(h => h.includes('sales') || h.includes('revenue') || h.includes('amount'))
      
      if (dateIndex === -1 || salesIndex === -1) {
        throw new Error('CSV must contain date and sales columns')
      }
      
      // Parse data rows
      const salesData = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= Math.max(dateIndex, salesIndex) + 1) {
          const dateStr = values[dateIndex].trim()
          const salesValue = parseFloat(values[salesIndex].trim())
          
          if (dateStr && !isNaN(salesValue) && salesValue >= 0) {
            salesData.push({
              user_id: user?.id,
              timestamp: dateStr,
              sales: salesValue
            })
          }
        }
      }
      
      if (salesData.length === 0) {
        throw new Error('No valid sales data found in CSV')
      }
      
      // Insert sales data
      const { error: insertError } = await supabase
        .from('sales_data')
        .insert(salesData)
      
      if (insertError) {
        throw insertError
      }
      
      console.log(`✅ Saved ${salesData.length} sales records to Supabase`)
      return salesData.length
      
    } catch (error) {
      console.error('Error saving sales data:', error)
      throw error
    }
  }

  // Generate forecast with business rules
  const generateForecast = async () => {
    if (!stepData['sales-data'].salesFile) return

    setIsProcessing(true)
    
    try {
      // First, save the sales data to Supabase
      const csvContent = await stepData['sales-data'].salesFile!.text()
      await saveHistoricalSalesData(csvContent)
      
      // Generate forecast via Python API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csv_data: csvContent
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Forecast generation failed')
      }
      
      const result = await response.json()
      
      console.log('API Response:', result)
      console.log('API Response Keys:', Object.keys(result))
      console.log('CSV Data sent:', csvContent.substring(0, 200) + '...')
      
      // Check if there's an error in the response
      if (result.error) {
        console.error('API Error:', result.error)
        throw new Error(`API Error: ${result.error}`)
      }
      
      // Check if forecast data exists and is properly formatted
      if (!result.forecast || !Array.isArray(result.forecast)) {
        console.error('Invalid forecast response - missing or invalid forecast array:', result)
        throw new Error(`API Error: ${result.error || 'Invalid forecast data received from API'}`)
      }
      
      console.log('Forecast array length:', result.forecast.length)
      console.log('First few forecast items:', result.forecast.slice(0, 3))
      
      // Filter out empty objects and validate data
      const validForecastItems = result.forecast.filter((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          console.warn(`Skipping invalid item at index ${index}:`, item)
          return false
        }
        
        console.log(`Item ${index} details:`, {
          keys: Object.keys(item),
          values: item,
          hasDate: 'date' in item,
          hasForecast: 'forecast' in item,
          dateValue: item.date,
          forecastValue: item.forecast
        })
        
        if (!item.date || item.forecast === undefined || item.forecast === null) {
          console.warn(`Skipping incomplete item at index ${index} - missing date or forecast:`, item)
          return false
        }
        return true
      })
      
      console.log('Valid forecast items:', validForecastItems.length)
      
      if (validForecastItems.length === 0) {
        console.error('All forecast items were invalid:', result.forecast)
        throw new Error('API returned invalid forecast data - no valid predictions found')
      }
      
      // Extract forecast data with proper error handling
      const forecastData = validForecastItems.map((item: any) => ({
        date: item.date,
        forecast: Math.round(Math.max(0, item.forecast)),
        confidence: Math.round(Math.max(10, Math.min(95, item.confidence || 75)))
      }))
      
      console.log('Processed forecast data:', forecastData.slice(0, 3))
      
      // Save to database and context
      await saveForecastToDatabase(forecastData)
      
      if (result.metrics) {
        setModelMetrics(result.metrics)
      }
      
      if (result.data_summary) {
        setDataSummary(result.data_summary)
      }
      
      const hasBusinessRules = stepData['business-rules'].businessRulesDocuments?.length > 0
      const rulesText = hasBusinessRules 
        ? ` Your business rules have been integrated for compliant staffing recommendations.`
        : ''
      
      toast.success('Forecast completed!', {
        description: `Generated ${forecastData.length}-day forecast with business rules integration.${rulesText}`
      })
      
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Forecast processing failed:', error)
      
      let errorMessage = 'Forecast processing failed'
      let errorDescription = 'Please try again or contact support if the problem persists.'
      
      if (error instanceof Error) {
        if (error.message.includes('Need at least 2 valid data points')) {
          errorMessage = 'Insufficient data'
          errorDescription = 'Your CSV needs at least 2 rows of valid date and sales data.'
        } else if (error.message.includes('date') && error.message.includes('sales')) {
          errorMessage = 'Invalid CSV format'
          errorDescription = 'Your CSV must contain "date" and "sales" columns with valid data.'
        } else {
          errorDescription = error.message
        }
      }
      
      toast.error(errorMessage, { description: errorDescription })
    } finally {
      setIsProcessing(false)
    }
  }

  const canProceedToNext = () => {
    const current = stepData[currentStep]
    if (currentStep === 'sales-data') return current.isComplete
    if (currentStep === 'business-rules') return true // Optional step
    if (currentStep === 'generate-forecast') return stepData['sales-data'].isComplete // Only need sales data
    return current.isComplete
  }

  const handleNext = async () => {
    if (currentStep === 'generate-forecast') {
      generateForecast()
      return
    }

    // Handle business rules file upload when proceeding from business-rules step
    if (currentStep === 'business-rules' && stepData['business-rules'].businessRulesFile) {
      try {
        await uploadBusinessRulesFile(stepData['business-rules'].businessRulesFile)
      } catch (error) {
        // Don't proceed if upload failed
        console.error('Business rules upload failed, staying on current step:', error)
        return
      }
    }
    
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
      // Scroll to top of page when navigating to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Upload business rules file
  const uploadBusinessRulesFile = async (file: File) => {
    try {
      console.log('Uploading business rules file:', file.name, file.size, file.type)
      
      const formData = new FormData()
      formData.append('document', file)

      console.log('Sending request to /api/documents/upload...')
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status, response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const responseText = await response.text()
        console.log('Error response body:', responseText)
        
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${responseText || 'Unknown error'}` }
        }
        
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()
      const document = result.document

      // Automatically analyze the document
      const analyzeResponse = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id })
      })

      if (analyzeResponse.ok) {
        const analysisResult = await analyzeResponse.json()
        const docTypeLabel = document.document_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        
        toast.success('Business rules extracted!', {
          description: `AI identified as ${docTypeLabel}. Found ${analysisResult.analysis.rules_extracted} rules from ${document.filename}`
        })

        // Update step data with the processed document
        setStepData(prev => ({
          ...prev,
          'business-rules': {
            ...prev['business-rules'],
            businessRulesDocuments: [
              ...(prev['business-rules'].businessRulesDocuments || []),
              document
            ]
          }
        }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed', { 
        description: error instanceof Error ? error.message : 'Please try again' 
      })
      // Re-throw to prevent progression in handleNext
      throw error
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
      // Scroll to top of page when navigating to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const downloadSampleCSV = async () => {
    try {
      const response = await fetch('/sample-sales-data.csv')
      const sampleData = await response.text()

      const blob = new Blob([sampleData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sample-sales-data.csv'
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Sample CSV downloaded!', {
        description: '3 years of realistic sales data with seasonality and trends.'
      })
    } catch {
      // Fallback sample data
      const fallbackData = `date,sales
2022-01-01,1513
2022-01-02,1520
2022-01-03,1482
2022-01-04,1449
2022-01-05,1412`

      const blob = new Blob([fallbackData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sample-sales-data.csv'
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Sample CSV downloaded!')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 overflow-x-hidden bg-white">
      {/* Header */}
      <div className="mb-12 sm:mb-16 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-6">
          Setup Your AI Forecasting System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          Upload your data and business rules to generate intelligent, compliant workforce forecasts
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = stepData[step.id].isComplete
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                    isActive && "border-blue-500 bg-blue-500 text-white",
                    isCompleted && !isActive && "border-green-500 bg-green-500 text-white",
                    !isActive && !isCompleted && "border-gray-300 text-gray-400"
                  )}>
                    {isCompleted && !isActive ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-4 text-left">
                    <div className={cn(
                      "text-sm font-medium",
                      isActive && "text-blue-600",
                      isCompleted && !isActive && "text-green-600",
                      !isActive && !isCompleted && "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.required ? 'Required' : 'Optional'}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-8" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          <div className="px-4 py-3">
            <div 
              className="overflow-x-auto scroll-smooth"
              style={{ 
                scrollPaddingInline: '2rem',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  height: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: rgba(243, 244, 246, 0.8);
                  border-radius: 2px;
                  margin: 0 1rem;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(156, 163, 175, 0.6);
                  border-radius: 2px;
                  transition: all 0.2s ease;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(107, 114, 128, 0.8);
                }
              `}</style>
              <div className="flex items-center space-x-6 min-w-max py-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id
                const isCompleted = stepData[step.id].isComplete
                
                return (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div id={`step-${step.id}`} className="flex flex-col items-center min-w-[120px]">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all mb-2",
                        isActive && "border-blue-500 bg-blue-500 text-white scale-110",
                        isCompleted && !isActive && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-gray-300 text-gray-400"
                      )}>
                        {isCompleted && !isActive ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "text-xs sm:text-sm font-medium leading-tight",
                          isActive && "text-blue-600 font-semibold",
                          isCompleted && !isActive && "text-green-600",
                          !isActive && !isCompleted && "text-gray-500"
                        )}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {step.required ? 'Required' : 'Optional'}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                    )}
                  </div>
                )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Sales Data */}
        {currentStep === 'sales-data' && (
          <Card 
            className="mb-8 bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mr-4">
                  <Upload className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                </div>
                Upload Historical Sales Data
              </CardTitle>
              <CardDescription className="text-gray-600 ml-16">
                Upload a CSV file with your historical sales data. This will be used to train the AI forecasting model.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploader
                onFileSelect={handleSalesFileSelect}
                selectedFile={stepData['sales-data'].salesFile}
              />
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>CSV format with headers</li>
                  <li>Must contain "date" and "sales" columns</li>
                  <li>At least 30 days of data recommended</li>
                  <li>Sales values should be positive numbers</li>
                </ul>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  onClick={downloadSampleCSV}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  Download Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Rules */}
        {currentStep === 'business-rules' && (
          <Card 
            className="mb-8 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 rounded-3xl shadow-2xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                <div className="w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center mr-4">
                  <Settings className="w-6 h-6 text-green-600" strokeWidth={1.5} />
                </div>
                Upload Business Rules (Optional)
              </CardTitle>
              <CardDescription className="text-gray-600 ml-16">
                Upload employment contracts, union agreements, or company policies. The AI will extract your business rules and apply them to all staffing recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUploader
                onFileSelect={handleBusinessRulesPDFSelect}
                selectedFile={stepData['business-rules'].businessRulesFile}
              />
              
              <div className="text-sm text-gray-600 space-y-2 mt-6">
                <p><strong>Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>PDF format with readable text (not scanned images)</li>
                  <li>Business documents like employment contracts, union agreements, or company policies</li>
                  <li>Maximum file size: 10MB</li>
                  <li>AI will automatically identify document type and extract rules</li>
                </ul>
              </div>
              
              {stepData['business-rules'].businessRulesDocuments && stepData['business-rules'].businessRulesDocuments.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Uploaded Documents:</h4>
                  <ul className="space-y-1">
                    {stepData['business-rules'].businessRulesDocuments.map((doc, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <div>
                          <div>{doc.filename}</div>
                          <div className="text-xs text-green-600">
                            🤖 AI identified as: {doc.document_type.replace('_', ' ')}
                            {doc.ai_classification && ` (${Math.round(doc.ai_classification.confidence * 100)}% confidence)`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2"><strong>Why upload business rules?</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ensure all staffing recommendations comply with your policies</li>
                  <li>Automatically apply overtime rules, break requirements, and scheduling constraints</li>
                  <li>Get intelligent answers about your specific business rules in chat</li>
                  <li>Detect conflicts between different policy documents</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generate Forecast */}
        {currentStep === 'generate-forecast' && (
          <Card 
            className="mb-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 rounded-3xl shadow-2xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                <div className="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
                </div>
                Generate AI Forecast
              </CardTitle>
              <CardDescription className="text-gray-600 ml-16">
                Create intelligent forecasts using your historical data and business rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Ready to Generate Forecast</h3>
                
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    <span>Historical sales data uploaded</span>
                  </div>
                  
                  {stepData['business-rules'].businessRulesDocuments && stepData['business-rules'].businessRulesDocuments.length > 0 ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      <span>{stepData['business-rules'].businessRulesDocuments.length} business rule document(s) processed</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                      <span>No business rules uploaded (using defaults)</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-blue-700 mt-4">
                  The AI will analyze your data patterns, generate forecasts, and apply your business rules to create compliant staffing recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStepIndex === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || isProcessing}
            variant={currentStep === 'generate-forecast' ? 'gradient' : 'default'}
            size={currentStep === 'generate-forecast' ? 'lg' : 'default'}
            className={cn(
              "flex items-center",
              currentStep === 'generate-forecast' && "font-semibold"
            )}
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {currentStep === 'generate-forecast' ? 'Generate Forecast' : 'Next'}
            {!isProcessing && currentStep !== 'generate-forecast' && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}