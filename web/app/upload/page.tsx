"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MultiStepUpload } from "@/components/upload/MultiStepUpload"
import { PageWrapper } from "@/components/page-wrapper"
import { useAuth } from "@/components/auth-provider"

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <PageWrapper>
      <MultiStepUpload />
    </PageWrapper>
  )
}