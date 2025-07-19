import { supabase, SalesData, UploadedFile } from './supabase'

export class DatabaseService {
  // Parse CSV content and return structured data
  static parseCSV(csvContent: string): { timestamp: string; sales: number }[] {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    
    // Find date/time and sales column indices
    const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('time'))
    const salesIndex = headers.findIndex(h => h.includes('sales') || h.includes('revenue'))
    
    if (dateIndex === -1 || salesIndex === -1) {
      throw new Error('Missing required columns: date/time and sales')
    }
    
    // Parse data rows
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
      const { data: fileData, error: fileError } = await supabase
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

      const { error: salesError } = await supabase
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
  static async getSalesData(fileId: number): Promise<SalesData[]> {
    const { data, error } = await supabase
      .from('sales_data')
      .select('*')
      .eq('file_id', fileId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get all files for a user
  static async getUserFiles(userId?: string): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId || null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Delete file and all associated sales data
  static async deleteFile(fileId: number): Promise<void> {
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId)

    if (error) throw error
  }
} 