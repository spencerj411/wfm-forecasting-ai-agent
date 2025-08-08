import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { csv_data } = await request.json()
    
    if (!csv_data) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 })
    }

    // Initialize Supabase with user auth
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse CSV data
    const lines = csv_data.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].toLowerCase().split(',').map((h: string) => h.trim())
    
    // Find date and sales columns
    const dateIndex = headers.findIndex((h: string) => h.includes('date') || h.includes('time'))
    const salesIndex = headers.findIndex((h: string) => h.includes('sales') || h.includes('revenue'))
    
    if (dateIndex === -1 || salesIndex === -1) {
      return NextResponse.json({ 
        error: 'CSV must contain date/time and sales/revenue columns' 
      }, { status: 400 })
    }

    // Parse data and generate simple forecast
    const salesData: { date: string; sales: number }[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim())
      if (values.length >= Math.max(dateIndex, salesIndex) + 1) {
        const dateStr = values[dateIndex]
        const sales = parseFloat(values[salesIndex])
        
        if (dateStr && !isNaN(sales) && sales >= 0) {
          salesData.push({ date: dateStr, sales })
        }
      }
    }

    if (salesData.length === 0) {
      return NextResponse.json({ 
        error: 'No valid sales data found in CSV' 
      }, { status: 400 })
    }

    // Generate simple forecast (7 days ahead starting from tomorrow)
    // This is a placeholder - in production you'd use a proper ML model
    const avgSales = salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.length
    const today = new Date()
    
    const forecast = []
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(today)
      forecastDate.setDate(today.getDate() + i)
      
      // Simple forecast with some randomness (±20% of average)
      const variation = 0.8 + (Math.random() * 0.4) // 0.8 to 1.2 multiplier
      const forecastValue = Math.round(avgSales * variation)
      const confidence = Math.round(70 + (Math.random() * 20)) // 70-90% confidence
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        forecast: forecastValue,
        confidence: confidence
      })
    }

    // Save forecast to database
    const forecastRecords = forecast.map(item => ({
      ...item,
      user_id: user.id
    }))

    // Clear existing forecasts first
    await supabase
      .from('forecasts')
      .delete()
      .eq('user_id', user.id)

    // Insert new forecast
    const { data: savedForecast, error: saveError } = await supabase
      .from('forecasts')
      .insert(forecastRecords)
      .select()

    if (saveError) {
      console.error('Error saving forecast:', saveError)
      return NextResponse.json({ error: 'Failed to save forecast' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Forecast generated successfully',
      forecast: savedForecast,
      summary: {
        total_records: salesData.length,
        average_sales: Math.round(avgSales),
        forecast_period: '7 days'
      }
    })

  } catch (error) {
    console.error('Forecast generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate forecast' }, 
      { status: 500 }
    )
  }
}