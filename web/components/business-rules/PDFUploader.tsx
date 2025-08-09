"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload, FileText } from "lucide-react"

interface PDFUploaderProps {
  // eslint-disable-next-line no-unused-vars
  onFileSelect: (file: File | null) => void
  error?: boolean
  selectedFile?: File | null
}

export function PDFUploader({ onFileSelect, error, selectedFile }: PDFUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer card-rounded border-3 border-dashed border-gray-200 p-12 sm:p-16 lg:p-20 text-center transition-all duration-500 hover:border-green-500 hover:bg-green-50/20 hover:scale-[1.02] backdrop-blur-sm min-h-[200px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600",
        isDragActive && "border-green-500 bg-green-50/30 scale-[1.02]",
        error && "border-red-500 bg-red-50/20",
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload PDF file"
      aria-describedby="upload-description"
    >
      <input {...getInputProps()} aria-hidden="true" />
      <div className="space-y-6 sm:space-y-8">
        {(acceptedFiles.length > 0 || selectedFile) ? (
          <div className="space-y-4 sm:space-y-6 animate-bounce-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-green-600/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600" strokeWidth={1.5} />
            </div>
            <div
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight truncate px-4"
              title={(acceptedFiles[0] || selectedFile)?.name}
            >
              {(acceptedFiles[0] || selectedFile)?.name}
            </div>
            <p className="text-gray-600 text-lg sm:text-xl" id="upload-description">
              Click to replace or drag a new file
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-green-600/5 rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-green-600/10">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600/60" strokeWidth={1.5} />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {isDragActive ? "Drop your PDF file here" : "Click to upload or drag and drop"}
            </div>
            <p className="text-gray-600 text-lg sm:text-xl" id="upload-description">
              PDF files only • Maximum 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}