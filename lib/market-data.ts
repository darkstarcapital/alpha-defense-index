export type Stock = {
  ticker: string
  name: string
  price: number
  basePrice: number | null
  weightage: number
  change: number | null
  changePercent: number | null
  sector: string | null
  marketCap: number | null
}

export type IndexData = {
  indexValue: number
  change: number
  changePercent: number
  baseValue: number
  baseDate: string | null
  asOf: string | null
  open: number | null
  high: number | null
  low: number | null
  prevClose: number | null
  stocks: Stock[]
  fetchedAt: string
}

const SHEET_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vScUrhVsnaIz86llOCm5Y2Kpno1ox03dbqiVUQlUathy7kLqX9kyZhdACOktjWAtdkb3OfchZWtqfcz/pub'

export const WEB_DATA_CSV_URL = `${SHEET_BASE}?gid=1714036678&single=true&output=csv`
export const MARKET_CAP_CSV_URL = `${SHEET_BASE}?gid=0&single=true&output=csv`

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.\-]/g, '')
    if (!cleaned) return null
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export const formatNumber = (value: number, digits = 2) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const formatSigned = (value: number, digits = 2) =>
  `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}`
