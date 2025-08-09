import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

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

export interface SalesData {
  id?: string
  file_id: number
  user_id?: string
  timestamp: string
  sales: number
}

// --- User-aware forecast and file services (main API) ---
export const forecastService = {
  // Save forecast data for a user
  async saveForecast(supabaseClient: SupabaseClient, userId: string, forecastData: Omit<ForecastData, 'user_id' | 'id' | 'created_at'>[]) {
    const { data, error } = await supabaseClient
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
  async loadForecast(supabaseClient: SupabaseClient, userId: string): Promise<ForecastData[]> {
    const { data, error } = await supabaseClient
      .from('forecasts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Delete forecast data for a user
  async deleteForecast(supabaseClient: SupabaseClient, userId: string) {
    const { error } = await supabaseClient
      .from('forecasts')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }
}

export const fileService = {
  // Save uploaded file record
  async saveFileRecord(supabaseClient: SupabaseClient, userId: string, filename: string, fileSize: number) {
    const { data, error } = await supabaseClient
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
  async loadFileRecords(supabaseClient: SupabaseClient, userId: string): Promise<UploadedFile[]> {
    const { data, error } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// --- Additional utilities from persistent storage branch ---
export class DatabaseUtils {
  // Parse CSV content and return structured data
  static parseCSV(csvContent: string): { timestamp: string; sales: number }[] {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('time'))
    const salesIndex = headers.findIndex(h => h.includes('sales') || h.includes('revenue'))
    if (dateIndex === -1 || salesIndex === -1) {
      throw new Error('Missing required columns: date/time and sales')
    }
    const data: { timestamp: string; sales: number }[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length >= Math.max(dateIndex, salesIndex) + 1) {
        const timestamp = values[dateIndex]
        const sales = parseFloat(values[salesIndex])
        if (timestamp && !isNaN(sales) && sales >= 0) {
          data.push({ timestamp, sales })
        }
      }
    }
    return data
  }

  // Upload file metadata and sales data (input data for the model)
  static async uploadSalesData(
    supabaseClient: SupabaseClient,
    file: File,
    csvContent: string,
    userId?: string
  ): Promise<{ fileId: number; rowCount: number }> {
    try {
      // Parse CSV data
      const salesData = this.parseCSV(csvContent)
      if (salesData.length === 0) {
        throw new Error('No valid data found in CSV')
      }
      // Insert file metadata
      const { data: fileData, error: fileError } = await supabaseClient
        .from('uploaded_files')
        .insert({
          user_id: userId || null,
          filename: file.name,
          file_size: file.size,
          row_count: salesData.length
        })
        .select()
        .single()
      if (fileError) throw fileError
      // Insert sales data (this is the input data for the forecasting model)
      const salesRecords = salesData.map(record => ({
        file_id: fileData.id,
        user_id: userId || null,
        timestamp: record.timestamp,
        sales: record.sales
      }))
      const { error: salesError } = await supabaseClient
        .from('sales_data')
        .insert(salesRecords)
      if (salesError) throw salesError
      return {
        fileId: fileData.id,
        rowCount: salesData.length
      }
    } catch (error) {
      console.error('Error uploading sales data:', error)
      throw error
    }
  }

  // Get sales data for a specific file
  static async getSalesData(supabaseClient: SupabaseClient, fileId: number): Promise<SalesData[]> {
    const { data, error } = await supabaseClient
      .from('sales_data')
      .select('*')
      .eq('file_id', fileId)
      .order('timestamp', { ascending: true })
    if (error) throw error
    return data || []
  }

  // Get all files for a user
  static async getUserFiles(supabaseClient: SupabaseClient, userId?: string): Promise<UploadedFile[]> {
    const { data, error } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId || null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  // Delete file and all associated sales data
  static async deleteFile(supabaseClient: SupabaseClient, fileId: number): Promise<void> {
    const { error } = await supabaseClient
      .from('uploaded_files')
      .delete()
      .eq('id', fileId)
    if (error) throw error
  }
} 