import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

type PriceRow = { ticker?: string; price?: number | string; created_at: string }

const numberValue = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('stock_prices')
      .select('ticker,price,created_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as PriceRow[]
    const byTicker = new Map<string, PriceRow[]>()
    for (const row of rows) {
      const ticker = String(row.ticker ?? '').trim().toUpperCase()
      if (!ticker || !row.created_at) continue
      const list = byTicker.get(ticker) ?? []
      list.push(row)
      byTicker.set(ticker, list)
    }

    const movers = Array.from(byTicker, ([ticker, prices]) => {
      const newest = prices[0]
      const oldest = prices[prices.length - 1]
      const latestPrice = numberValue(newest.price) ?? 0
      const firstPrice = numberValue(oldest.price) ?? latestPrice
      const changePercent = firstPrice ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0
      return { ticker, price: latestPrice, changePercent, createdAt: newest.created_at }
    }).sort((a, b) => b.changePercent - a.changePercent)

    return NextResponse.json({ movers, source: 'stock_prices' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json(
      { movers: [], source: 'fallback', error: error instanceof Error ? error.message : 'Stock price feed unavailable' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
