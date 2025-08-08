"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  loginDev?: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  loginDev: undefined,
})

const DEV_AUTH_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "1"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (DEV_AUTH_BYPASS) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    
    // Initial auth check with retry logic for after callback
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (!mounted) return
        
        console.log('Initial auth check:', !!data?.user, error?.message)
        setUser(data?.user ?? null)
        setError(error?.message ?? null)
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        if (!mounted) return
        setError('Authentication check failed')
        setLoading(false)
      }
    }
    
    // Check immediately
    checkAuth()
    
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, !!session?.user, session?.user?.email)
      setUser(session?.user ?? null)
      setError(null)
      setLoading(false)
    })
    
    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    // Clear chat history on logout
    if (user) {
      try {
        localStorage.removeItem(`chat_history_${user.id}`)
      } catch (error) {
        console.error('Failed to clear chat history on logout:', error)
      }
    }
    
    setUser(null)
    setLoading(false)
    if (!DEV_AUTH_BYPASS) {
      await supabase.auth.signOut()
    }
  }

  const loginDev = () => {
    setUser({ id: "dev-user", email: "dev@local", aud: "authenticated", role: "authenticated" } as User)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, loginDev: DEV_AUTH_BYPASS ? loginDev : undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  return ctx
} 