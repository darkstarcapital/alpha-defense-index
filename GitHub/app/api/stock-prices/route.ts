import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('stock_prices')
      .select('ticker,price,created_at')
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) throw new Error(error.message)

    const grouped = new Map<string, { latest: number; first: number }>()
    for (const row of data ?? []) {
      const ticker = String(row.ticker ?? '').trim().toUpperCase()
      const price = Number(row.price)
      if (!ticker || !Number.isFinite(price)) continue
      const existing = grouped.get(ticker)
      if (existing) existing.first = price
      else grouped.set(ticker, { latest: price, first: price })
    }
    return NextResponse.json({ prices: Object.fromEntries(Array.from(grouped, ([ticker, values]) => [ticker, { price: values.latest, changePercent: values.first ? ((values.latest - values.first) / values.first) * 100 : 0 }])) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ prices: {}, error: error instanceof Error ? error.message : 'Stock prices unavailable' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  }
}
