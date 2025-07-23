"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload, FileText } from "lucide-react"

interface FileUploaderProps {
  // eslint-disable-next-line no-unused-vars
  onFileSelect: (file: File | null) => void
  error?: boolean
}

export function FileUploader({ onFileSelect, error }: FileUploaderProps) {
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
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer card-rounded border-3 border-dashed border-gray-200 p-12 sm:p-16 lg:p-20 text-center transition-all duration-500 hover:border-blue-500 hover:bg-blue-50/20 hover:scale-[1.02] backdrop-blur-sm min-h-[200px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600",
        isDragActive && "border-blue-500 bg-blue-50/30 scale-[1.02]",
        error && "border-red-500 bg-red-50/20",
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file"
      aria-describedby="upload-description"
    >
      <input {...getInputProps()} aria-hidden="true" />
      <div className="space-y-6 sm:space-y-8">
        {acceptedFiles.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 animate-bounce-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-green-600/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600" strokeWidth={1.5} />
            </div>
            <div
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight truncate px-4"
              title={acceptedFiles[0].name}
            >
              {acceptedFiles[0].name}
            </div>
            <p className="text-gray-600 text-lg sm:text-xl" id="upload-description">
              Click to replace or drag a new file
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full flex items-center justify-center",
                error ? "bg-red-500/10" : "bg-blue-600/10",
              )}
            >
              <Upload
                className={cn("h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12", error ? "text-red-500" : "text-blue-600")}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              {isDragActive ? "Drop your CSV file here" : "Click to upload or drag and drop"}
            </div>
            <p className="text-gray-600 text-lg sm:text-xl" id="upload-description">
              CSV files only • Maximum 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
