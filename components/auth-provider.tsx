"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (DEV_AUTH_BYPASS) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return
      setUser(data?.user ?? null)
      setError(error?.message ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [supabase])

  const logout = async () => {
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