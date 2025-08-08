"use client"

import { useState } from 'react'
import { DocumentUpload } from '@/components/business-rules/DocumentUpload'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function BusinessRulesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<Record<string, unknown>>>([])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return null
  }

  const handleUploadComplete = (document: Record<string, unknown>) => {
    console.log('Document uploaded:', document)
    setUploadedDocuments(prev => [...prev, document])
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Rules Management</h1>
          <p className="text-gray-600 mt-2">
            Upload your employment contracts, union agreements, and company policies. 
            Our AI will extract the key business rules and help clarify any ambiguities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Documents
            </h2>
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Processed Documents
            </h2>
            
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No documents uploaded yet.</p>
                <p className="text-sm mt-1">Upload a document to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocuments.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{String(doc.filename)}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {String(doc.document_type).replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {String(doc.text_length)} characters extracted
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Processed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        {uploadedDocuments.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              🎉 Great! Your documents have been processed.
            </h3>
            <p className="text-blue-800 mb-4">
              Now you can go to the chat interface and ask questions about your business rules. 
              The AI will apply your specific policies to all staffing recommendations.
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Try asking:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>&quot;What are my overtime rules?&quot;</li>
                <li>&quot;How many staff do I need for tomorrow?&quot;</li>
                <li>&quot;What are my break requirements?&quot;</li>
                <li>&quot;Are there any conflicts in my policies?&quot;</li>
              </ul>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push('/chat')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Chat Interface →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}