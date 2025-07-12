"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
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
        "cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-8 sm:p-12 lg:p-16 text-center transition-all duration-500 hover:border-blue-400 hover:bg-blue-50/20 hover:scale-105 backdrop-blur-sm",
        isDragActive && "border-blue-400 bg-blue-50/30 scale-105",
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4 sm:space-y-6">
        {acceptedFiles.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <Upload
              className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 opacity-70"
              strokeWidth={1}
            />
            <div
              className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight truncate px-4"
              title={acceptedFiles[0].name}
            >
              {acceptedFiles[0].name}
            </div>
            <p className="text-gray-600 text-base sm:text-lg">Click to replace or drag a new file</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <Upload
              className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 opacity-70"
              strokeWidth={1}
            />
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
              {isDragActive ? "Drop your CSV file here" : "Click to upload or drag and drop"}
            </div>
            <p className="text-gray-600 text-base sm:text-lg">CSV files only • Maximum 10MB</p>
          </div>
        )}
      </div>
    </div>
  )
}
