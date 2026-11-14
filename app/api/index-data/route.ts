import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    // Default to Defense, but allow ?index=bank later
    const indexParam = searchParams.get('index')
    const indexName = indexParam === 'bank' 
      ? 'Northman Bank Index' 
      : 'Northman Defense Index'

    // 1. Fetch chart history for the specific index
    const { data: chartData, error: chartError } = await supabase
      .from('live_ticks')
      .select('created_at, index_value')
      .eq('index_name', indexName)
      .order('created_at', { ascending: false })
      .limit(150)

    if (chartError) throw chartError

    // Get the latest value
    const latestValue = chartData && chartData.length > 0 ? chartData[0].index_value : 0

    // 2. Fetch the latest stock prices (for the table)
    // We grab the latest 54 records to cover both Defense and Bank
    const { data: stockData, error: stockError } = await supabase
      .from('stock_prices')
      .select('ticker, price, created_at')
      .order('created_at', { ascending: false })
      .limit(54)

    if (stockError) throw stockError

    // 3. Return the exact format the frontend expects
    return NextResponse.json({
      indexValue: latestValue,
      chartData: chartData.reverse(), // Oldest to newest for the chart
      stocks: stockData || []
    })

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" }, 
      { status: 500 }
    )
  }
}