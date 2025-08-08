"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void
  onError?: (error: string) => void
  className?: string
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export function DocumentUpload({ onUploadComplete, onError, className }: DocumentUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setStatus('idle')
    setErrorMessage('')
    setProgress(0)

    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a PDF file')
      setStatus('error')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB')
      setStatus('error')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setStatus('uploading')
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)

      setProgress(30)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      setProgress(70)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setProgress(100)
      setStatus('success')
      
      // Clear form
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent component
      onUploadComplete?.(result.document)

      // Reset after delay
      setTimeout(() => {
        setStatus('idle')
        setProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Upload failed'
      setErrorMessage(message)
      setStatus('error')
      setProgress(0)
      onError?.(message)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Upload className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`
      case 'success':
        return 'Upload successful!'
      case 'error':
        return errorMessage
      default:
        return selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'
    }
  }

  return (
    <div className={cn("border-2 border-dashed border-gray-300 rounded-lg p-6", className)}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Upload Business Rules Document
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload any business document (employment contracts, union agreements, company policies). 
            <br />
            <strong>Our AI will automatically identify the document type and extract relevant rules.</strong>
          </p>
        </div>

        {/* File Input */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={status === 'uploading'}
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={status === 'uploading'}
            className="mb-3"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose PDF File
          </Button>
        </div>

        {/* Status Display */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          {getStatusIcon()}
          <span className={cn(
            status === 'error' && 'text-red-600',
            status === 'success' && 'text-green-600',
            status === 'uploading' && 'text-blue-600'
          )}>
            {getStatusText()}
          </span>
        </div>

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && status !== 'uploading' && status !== 'success' && (
          <Button
            onClick={handleUpload}
            className="w-full max-w-xs"
            disabled={!selectedFile}
          >
            Upload & Process Document
          </Button>
        )}
      </div>
    </div>
  )
}