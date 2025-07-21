import { createClient } from '@supabase/supabase-js'

// Type declaration for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ForecastData {
  id?: string
  user_id: string
  date: string
  forecast: number
  confidence: number
  created_at?: string
}

export interface UploadedFile {
  id?: string
  user_id: string
  filename: string
  file_size: number
  uploaded_at?: string
}

// Database operations for forecast data
export const forecastService = {
  // Save forecast data for a user
  async saveForecast(userId: string, forecastData: Omit<ForecastData, 'user_id' | 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('forecasts')
      .insert(
        forecastData.map(item => ({
          ...item,
          user_id: userId
        }))
      )
      .select()

    if (error) throw error
    return data
  },

  // Load forecast data for a user
  async loadForecast(userId: string): Promise<ForecastData[]> {
    const { data, error } = await supabase
      .from('forecasts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Delete forecast data for a user
  async deleteForecast(userId: string) {
    const { error } = await supabase
      .from('forecasts')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }
}

// Database operations for uploaded files
export const fileService = {
  // Save uploaded file record
  async saveFileRecord(userId: string, filename: string, fileSize: number) {
    const { data, error } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: userId,
        filename,
        file_size: fileSize
      })
      .select()

    if (error) throw error
    return data
  },

  // Load uploaded files for a user
  async loadFileRecords(userId: string): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }
} 