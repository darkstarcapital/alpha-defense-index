import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

const DEFENSE_TICKERS = [
  "CYIENTDLM", "DCXINDIA", "PTCIL", "IDEAFORGE", "APOLLO", "ASTRAMICRO", 
  "AXISCADES", "BDL", "BEL", "COCHINSHIP", "DATAPATTNS", "DYNAMATECH", 
  "GRSE", "HAL", "MAZDOCK", "MIDHANI", "PARAS", "SOLARINDS", 
  "UNIMECH", "ZENTEC", "NIBE", "PREMEXPLN", "CENTUM", "ADANIENT", 
  "KUSUMGAR", "LT", "ASHOKLEY", "HBLENGINE", "BHARATFORG", "INDO-MIM", 
  "AEQUS", "BEML", "MTARTECH", "ARVIND", "M&M", "LMW"
]

const BANK_TICKERS = [
  "AUBANK", "AXISBANK", "BANKBARODA", "CANBK", "CUB", "FEDERALBNK", 
  "HDFCBANK", "ICICIBANK", "IDFCFIRSTB", "INDIANB", "INDUSINDBK", 
  "KARURVYSYA", "KOTAKBANK", "PNB", "RBLBANK", "SBIN", "UNIONBANK", "YESBANK"
]

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    // Determine which index is being requested (defaults to Defense)
    const isBank = searchParams.get('index') === 'bank'
    const indexName = isBank ? 'Northman Bank Index' : 'Northman Defense Index'
    const validTickers = isBank ? BANK_TICKERS : DEFENSE_TICKERS

    // 1. Fetch chart history for the specific index
    const { data: chartData, error: chartError } = await supabase
      .from('live_ticks')
      .select('created_at, index_value')
      .eq('index_name', indexName)
      .order('created_at', { ascending: false })
      .limit(150)

    if (chartError) throw chartError

    // Get the latest index value (or 0 if no data)
    const latestValue = chartData && chartData.length > 0 ? chartData[0].index_value : 0

    // 2. Fetch the latest stock prices
    // INCREASED LIMIT to 1500 to ensure we capture all 54 stocks across multiple update cycles
    const { data: stockData, error: stockError } = await supabase
      .from('stock_prices')
      .select('ticker, price, created_at')
      .order('created_at', { ascending: false })
      .limit(1500) 

    if (stockError) throw stockError

    // 3. Filter and deduplicate stocks
    // We only want the most recent price for each valid ticker belonging to this index
    const uniqueStocks = new Map()
    if (stockData) {
      stockData.forEach(stock => {
        if (validTickers.includes(stock.ticker) && !uniqueStocks.has(stock.ticker)) {
          uniqueStocks.set(stock.ticker, stock)
        }
      })
    }

    const filteredStocks = Array.from(uniqueStocks.values())

    // 4. Return the exact format the frontend expects
    return NextResponse.json({
      indexValue: latestValue,
      chartData: chartData ? chartData.reverse() : [], // Oldest to newest for the chart
      stocks: filteredStocks
    })

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" }, 
      { status: 500 }
    )
  }
}