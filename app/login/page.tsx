"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AuthError } from "@supabase/supabase-js"

const providerIcons = {
  google: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none"><g><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633C17.07 3.57 15.07 2.5 12.04 2.5 6.82 2.5 2.5 6.82 2.5 12.04c0 5.219 4.32 9.54 9.54 9.54 5.5 0 9.125-3.867 9.125-9.328 0-.625-.07-1.102-.16-1.229z" fill="#4285F4"/><path d="M3.153 7.345l3.25 2.385c.883-1.68 2.57-2.86 4.587-2.86 1.172 0 2.227.406 3.055 1.078l2.703-2.633C15.07 3.57 13.07 2.5 10.04 2.5c-3.75 0-6.922 2.25-8.387 5.5z" fill="#34A853"/><path d="M12.04 21.58c2.93 0 5.375-.969 7.156-2.633l-3.297-2.703c-.914.648-2.148 1.102-3.859 1.102-3.07 0-5.664-2.07-6.594-4.883l-3.25 2.52c1.453 3.18 4.672 5.594 8.844 5.594z" fill="#FBBC05"/><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633C17.07 3.57 15.07 2.5 12.04 2.5 6.82 2.5 2.5 6.82 2.5 12.04c0 5.219 4.32 9.54 9.54 9.54 5.5 0 9.125-3.867 9.125-9.328 0-.625-.07-1.102-.16-1.229z" fill="#EA4335"/></g></svg>
  ),
  azure: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none"><g><rect x="2" y="2" width="9" height="9" fill="#F35325"/><rect x="13" y="2" width="9" height="9" fill="#81BC06"/><rect x="2" y="13" width="9" height="9" fill="#05A6F0"/><rect x="13" y="13" width="9" height="9" fill="#FFBA08"/></g></svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none"><g><path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.03 0-.06 0-.09-.01-.09-1.13.93-2.06 2.07-2.06.03 0 .06 0 .09.01zM21.54 17.19c-.25.57-.54 1.1-.88 1.6-.58.86-1.06 1.46-1.47 1.87-.59.58-1.14 1.17-2.01 1.18-.77.01-1.01-.37-2.1-.37-1.09 0-1.36.36-2.1.37-.87.01-1.47-.59-2.06-1.17-.43-.42-.93-1.03-1.52-1.89-.41-.6-.8-1.24-1.13-1.92-1.2-2.36-1.32-5.13-.58-6.8.53-1.23 1.47-2.01 2.7-2.03.8-.02 1.56.41 2.1.41.54 0 1.39-.5 2.34-.43.4.02 1.53.16 2.26 1.23-.06.04-1.35.8-1.33 2.39.02 1.91 1.62 2.54 1.65 2.55-.01.03-.26.91-.85 1.8-.51.77-1.09 1.54-1.97 1.52-.8-.02-1.06-.52-2.08-.52-1.02 0-1.31.5-2.08.52-.88.02-1.47-.75-1.98-1.52-.59-.89-.84-1.77-.85-1.8.03-.01 1.63-.64 1.65-2.55.02-1.59-1.27-2.35-1.33-2.39.73-1.07 1.86-1.21 2.26-1.23.95-.07 1.8.43 2.34.43.54 0 1.3-.43 2.1-.41 1.23.02 2.17.8 2.7 2.03.74 1.67.62 4.44-.58 6.8z" fill="#000"/></g></svg>
  ),
}

export default function LoginPage() {
  const { user, loading, loginDev } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const supabase = createClientComponentClient()
  const isDevBypass = !!loginDev

  useEffect(() => {
    if (user) {
      console.log("LOGIN PAGE: User object is present, redirecting to /home...");
      router.replace("/home")
    }
  }, [user, router])

  if (loading || user) return null

  const handleAuth = async (provider?: "google" | "azure" | "apple") => {
    setError(null)
    setLoadingAuth(true)
    try {
      if (loginDev && !isSignUp && !provider) {
        loginDev()
        router.replace("/home")
        return
      }
      if (provider) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        return
      }
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError((err as AuthError).message)
    } finally {
      setLoadingAuth(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-white px-4">
      <h1 className="sr-only">Login to Demand Forecasting Agent</h1>
      <Card variant="static" className="w-full max-w-md mx-auto card-rounded shadow-2xl border-0 animate-fade-in">
        <CardHeader className="pb-4 pt-8 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{isSignUp ? "Sign Up" : "Login"}</CardTitle>
          <p className="text-gray-600 text-base font-light">
            {isSignUp ? "Create your account to get started" : "Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleAuth()
            }}
            className="space-y-4"
          >
            {!isDevBypass && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
                  required
                  autoComplete="email"
                  disabled={loadingAuth}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  disabled={loadingAuth}
                />
              </>
            )}
            {isDevBypass && (
              <div className="text-center text-gray-500 text-sm">Dev mode: just click Login</div>
            )}
            {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full font-semibold"
              disabled={loadingAuth}
            >
              {loadingAuth ? (isSignUp ? "Signing Up..." : "Logging In...") : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </form>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
            <button
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loadingAuth}
            >
              {isSignUp ? "Login" : "Sign Up"}
            </button>
          </div>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3">
            {(["google", "azure", "apple"] as const).map((provider) => (
              <Button
                key={provider}
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-3 font-semibold"
                onClick={() => handleAuth(provider)}
                disabled={loadingAuth}
              >
                {providerIcons[provider]}
                <span>Continue with {provider === 'azure' ? 'Microsoft' : provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 