'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { IndexData } from '@/lib/market-data'
import { BenchmarkComparison } from './benchmark-comparison'
import { DashboardError } from './dashboard-error'
import { DashboardSkeleton } from './dashboard-skeleton'
import { HeroIndex } from './hero-index'
import { MarketPulse } from './market-pulse'
import { PortfolioBreakdown } from './portfolio-breakdown'
import { StocksTable } from './stocks-table'
import { SummaryCards } from './summary-cards'

const REFRESH_MS = 60_000

async function fetchIndexData(): Promise<IndexData> {
  const res = await fetch('/api/index-data', { cache: 'no-store' })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || 'error' in json) {
    throw new Error(json?.error ?? `Request failed with status ${res.status}`)
  }
  return json as IndexData
}

export function Dashboard() {
  const [data, setData] = useState<IndexData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      const next = await fetchIndexData()
      if (signal?.cancelled) return
      setData(next)
      setError(null)
    } catch (err) {
      if (signal?.cancelled) return
      setError(err instanceof Error ? err.message : 'Unable to load data')
    } finally {
      if (!signal?.cancelled) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const signal = { cancelled: false }
    load(signal)
    const id = setInterval(() => load(signal), REFRESH_MS)
    return () => {
      signal.cancelled = true
      clearInterval(id)
    }
  }, [load])

  const retry = () => {
    setLoading(true)
    setError(null)
    load()
  }

  if (loading && !data) return <DashboardSkeleton />
  if (!data) return <DashboardError message={error} onRetry={retry} />

  const totalCompanies = data.stocks.length
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now)
  const weekday = parts.find((part) => part.type === 'weekday')?.value
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  const marketOpen = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday ?? '') && hour * 60 + minute >= 555 && hour * 60 + minute <= 930

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 md:gap-4">
      {error && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs text-amber-200"
        >
          <AlertTriangle className="size-4 shrink-0 text-amber-400" aria-hidden="true" />
          <p className="flex-1">
            <span className="font-semibold">Latest refresh failed. Showing the last values received.</span> {error}
          </p>
          <button type="button" onClick={retry} className="font-semibold text-amber-300 hover:underline">
            Retry now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:gap-4">
        <div className="lg:col-span-8">
          <HeroIndex data={data} status={error ? 'stale' : marketOpen ? 'live' : 'closed'} />
        </div>
        <div className="flex flex-col gap-2 lg:col-span-4 lg:gap-4">
          <PortfolioBreakdown totalCompanies={totalCompanies} />
          <BenchmarkComparison />
        </div>
      </div>

      <SummaryCards stocks={data.stocks} totalCompanies={totalCompanies} changePercent={data.changePercent} />
      <MarketPulse stocks={data.stocks} />
      <StocksTable stocks={data.stocks} />

      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="size-3" aria-hidden="true" />
        {'Auto-refreshes every 60s · Last updated '}
        <time dateTime={data.fetchedAt} suppressHydrationWarning>
          {new Date(data.fetchedAt).toLocaleTimeString('en-IN')}
        </time>
      </p>
    </div>
  )
}
