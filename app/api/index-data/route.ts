import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

// This ensures Next.js doesn't cache the API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    // Check if the frontend is asking for the bank index, otherwise default to defense
    const indexParam = searchParams.get('index')
    const indexName = indexParam === 'bank' 
      ? 'Northman Bank Index' 
      : 'Northman Defense Index'

    // 1. Fetch ONLY the specific index from Supabase
    const { data, error } = await supabase
      .from('live_ticks')
      .select('created_at, index_value')
      .eq('index_name', indexName) // 🔥 THIS IS THE MAGIC FILTER
      .order('created_at', { ascending: false })
      .limit(150) // Get the latest 150 ticks

    if (error) throw error

    // 2. Reverse the data so the chart draws from oldest to newest
    const chartData = data.reverse()

    return NextResponse.json(chartData)

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" }, 
      { status: 500 }
    )
  }
}