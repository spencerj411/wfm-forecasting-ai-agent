import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface SalesData {
  id?: number
  user_id?: string // For future authentication
  file_id?: number
  timestamp: string
  sales: number
  created_at?: string
  updated_at?: string
}

export interface UploadedFile {
  id?: number
  user_id?: string // For future authentication
  filename: string
  file_size: number
  row_count: number
  time_granularity?: string
  created_at?: string
  updated_at?: string
} 