import { NextResponse } from 'next/server'
import { parseCsv } from '@/lib/csv'
import { createSupabaseClient } from '@/lib/supabase/client'
import {
  MARKET_CAP_CSV_URL,
  WEB_DATA_CSV_URL,
  toNumber,
  type IndexData,
  type Stock,
} from '@/lib/market-data'

export const dynamic = 'force-dynamic'

const DEFAULT_BASE_VALUE = 10_000

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const cleanTicker = (symbol: string) => symbol.trim().replace(/^[A-Z]+:/, '')

async function fetchCsv(url: string, label: string): Promise<string[][]> {
  const res = await fetch(url, { cache: 'no-store', redirect: 'follow', signal: AbortSignal.timeout(15_000) })
  if (res.url.includes('accounts.google.com')) {
    throw new Error(`${label} sheet requires sign-in. Publish it to the web as CSV.`)
  }
  if (!res.ok) throw new Error(`${label} sheet responded with ${res.status}`)
  const text = await res.text()
  if (text.trimStart().startsWith('<')) {
    throw new Error(`${label} sheet did not return CSV. Check that it is published to the web.`)
  }
  return parseCsv(text)
}

function parseWebData(rows: string[][]) {
  const indexValue = toNumber(rows[1]?.[1])
  const asOf = rows[1]?.[0]?.trim() || null

  const tickerRowIndex = rows.findIndex((row) => row.some((cell) => /^[A-Z]+:\S/.test(cell.trim())))
  const livePrices = new Map<string, number>()
  if (tickerRowIndex !== -1) {
    const tickers = rows[tickerRowIndex]
    const prices = rows[tickerRowIndex + 1] ?? []
    tickers.forEach((symbol, i) => {
      const price = toNumber(prices[i])
      if (symbol.trim() && price != null) livePrices.set(cleanTicker(symbol), price)
    })
  }
  return { indexValue, asOf, livePrices }
}

function parseMarketCap(rows: string[][]) {
  const headerIndex = rows.findIndex((row) => row.some((cell) => normalize(cell) === 'stocksymbol'))
  if (headerIndex === -1) throw new Error('MarkCap sheet is missing a "Stock Symbol" column')

  const header = rows[headerIndex].map(normalize)
  const col = (match: (h: string) => boolean) => header.findIndex(match)
  const cols = {
    name: col((h) => h === 'stockname'),
    symbol: col((h) => h === 'stocksymbol'),
    basePrice: col((h) => h.startsWith('baseprice')),
    currentPrice: col((h) => h.startsWith('currentprice')),
    weightage: col((h) => h.startsWith('weight')),
    returnPct: col((h) => h.startsWith('return')),
  }
  const baseDate = rows[headerIndex][cols.basePrice]?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null

  const constituents: { ticker: string; name: string; basePrice: number | null; currentPrice: number | null; weightage: number; returnPct: number | null }[] = []
  for (const row of rows.slice(headerIndex + 1)) {
    const symbol = row[cols.symbol]?.trim()
    if (!symbol) break
    const ticker = cleanTicker(symbol)
    constituents.push({
      ticker,
      name: row[cols.name]?.trim() || ticker,
      basePrice: toNumber(row[cols.basePrice]),
      currentPrice: toNumber(row[cols.currentPrice]),
      weightage: toNumber(row[cols.weightage]) ?? 0,
      returnPct: toNumber(row[cols.returnPct]),
    })
  }

  const valueFromRow = (labelPrefix: string) => {
    const row = rows.find((r) => r.some((cell) => normalize(cell).startsWith(labelPrefix)))
    const numbers = row?.map(toNumber).filter((n): n is number => n != null) ?? []
    return numbers.at(-1) ?? null
  }

  return {
    constituents,
    baseDate,
    baseValue: valueFromRow('basevalueofindex') ?? DEFAULT_BASE_VALUE,
    sheetIndexValue: valueFromRow('currentvalue'),
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const [{ data: latestTick, error: tickError }, webRows, mcapRows] = await Promise.all([
      supabase
        .from('live_ticks')
        .select('created_at,index_value')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      fetchCsv(WEB_DATA_CSV_URL, 'WebData'),
      fetchCsv(MARKET_CAP_CSV_URL, 'MarkCap'),
    ])
    if (tickError) throw new Error(`Live tick query failed: ${tickError.message}`)
    if (!latestTick) throw new Error('No live index ticks are available yet.')
    const web = parseWebData(webRows)
    const mcap = parseMarketCap(mcapRows)

    const indexValue = toNumber(latestTick.index_value)
    if (indexValue == null) throw new Error('Latest live tick has no index_value')
    if (indexValue == null) throw new Error('Could not find the index value in the WebData sheet')
    if (mcap.constituents.length === 0) throw new Error('No stocks found in the MarkCap sheet')

    const stocks: Stock[] = mcap.constituents
      .map((c) => {
        const price = web.livePrices.get(c.ticker) ?? c.currentPrice ?? 0
        const change = c.basePrice != null ? price - c.basePrice : null
        const changePercent = c.basePrice ? ((price - c.basePrice) / c.basePrice) * 100 : c.returnPct
        return {
          ticker: c.ticker,
          name: c.name,
          price,
          basePrice: c.basePrice,
          weightage: c.weightage,
          change,
          changePercent,
          sector: null,
          marketCap: null,
        }
      })
      .sort((a, b) => b.weightage - a.weightage)

    const body: IndexData = {
      indexValue,
      change: indexValue - mcap.baseValue,
      changePercent: ((indexValue - mcap.baseValue) / mcap.baseValue) * 100,
      baseValue: mcap.baseValue,
      baseDate: mcap.baseDate,
      asOf: latestTick.created_at ?? web.asOf,
      open: null,
      high: null,
      low: null,
      prevClose: null,
      stocks,
      fetchedAt: new Date().toISOString(),
    }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Google Sheets took too long to respond'
        : error instanceof Error
          ? error.message
          : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
