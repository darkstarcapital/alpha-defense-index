'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { RANGES, type Range } from '@/lib/chart-series'
import { formatNumber, formatSigned, type IndexData } from '@/lib/market-data'
import { cn } from '@/lib/utils'
import { LiveTicksChart, type LiveTickPoint } from './live-ticks-chart'

type Props = { data: IndexData; status: 'live' | 'stale' | 'closed' }

export function HeroIndex({ data, status }: Props) {
  const [range, setRange] = useState<Range>('1D')
  const [livePoints, setLivePoints] = useState<LiveTickPoint[]>([])
  const latest = livePoints.at(-1)?.value ?? data.indexValue
  const first = livePoints[0]?.value ?? data.open ?? data.prevClose ?? data.indexValue
  const high = livePoints.length ? Math.max(...livePoints.map((point) => point.value)) : (data.high ?? latest)
  const low = livePoints.length ? Math.min(...livePoints.map((point) => point.value)) : (data.low ?? latest)
  const intradayChange = latest - first
  const intradayChangePercent = first ? (intradayChange / first) * 100 : 0
  const positive = intradayChangePercent >= 0
  const open = first
  const stats: { label: string; value: string }[] = [
    { label: 'Intraday High', value: formatNumber(high) },
    { label: 'Intraday Low', value: formatNumber(low) },
    { label: "Today's Open", value: '12,283.04' },
    { label: 'Constituents', value: String(data.stocks.length || 36) },
  ]

  return (
    <section aria-labelledby="index-title" className="p-3 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2 md:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 id="index-title" className="text-sm font-bold tracking-tight text-balance md:text-3xl">
              ALPHA DEFENSE INDEX
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground md:mt-1 md:text-sm">
            {'Track. Analyze. Invest. — India\u2019s Next Gen Defence Index'}
          </p>
        </div>

        <div role="group" aria-label="Chart range" className="flex w-full flex-wrap gap-0.5 md:w-auto md:gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                'min-h-7 rounded-md px-2 py-1 text-[11px] font-medium transition-colors md:min-h-9 md:px-3 md:py-1.5 md:text-xs',
                range === r
                  ? 'bg-accent text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 md:mt-6 md:gap-6">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex items-start justify-between gap-3 md:block">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <p
                className={cn(
                  'text-2xl font-bold tracking-tight tabular-nums text-white md:text-5xl',
                )}
                aria-live="polite"
              >
                  {formatNumber(latest)}
              </p>
              <div>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums md:gap-1.5 md:rounded-lg md:px-3 md:py-2 md:text-lg',
                    positive ? 'bg-accent text-primary' : 'bg-negative/10 text-negative',
                  )}
                >
                  {positive ? (
                  <TrendingUp className="size-3 md:size-4" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3 md:size-4" aria-hidden="true" />
                  )}
                  {formatSigned(intradayChangePercent)}%
                </span>
                <p className="mt-0.5 text-[9px] md:mt-1.5 md:text-xs">
                  <span className={cn('font-medium tabular-nums', positive ? 'text-positive' : 'text-negative')}>
                    {formatSigned(intradayChange)}
                  </span>
                  <span className="ml-2 text-muted-foreground">Today</span>
                </p>
              </div>
            </div>
            <dl className="grid shrink-0 grid-cols-2 gap-x-2 gap-y-1.5 text-right md:hidden">
              {stats.map((s) => (
                <div key={s.label} className="whitespace-nowrap">
                  <dt className="text-[8px] leading-none text-gray-400">{s.label}</dt>
                  <dd className="mt-0.5 text-[8px] font-semibold leading-none tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <dl className="mt-1 hidden w-full grid-cols-2 gap-x-3 gap-y-2 md:mt-4 md:grid md:grid-cols-4 md:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="whitespace-nowrap">
                <dt className="text-[10px] text-gray-400 md:text-xs">{s.label}</dt>
                <dd className="mt-0.5 text-xs font-semibold tabular-nums md:mt-1 md:text-sm">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <LiveTicksChart range={range} fallbackValue={latest} fallbackStart={open} onData={setLivePoints} />
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: Props['status'] }) {
  const config = {
    live: { label: 'LIVE', dot: 'bg-primary animate-pulse', text: 'text-primary', ring: 'ring-primary/40' },
    stale: { label: 'DELAYED', dot: 'bg-amber-400', text: 'text-amber-400', ring: 'ring-amber-400/40' },
    closed: { label: 'CLOSED', dot: 'bg-muted-foreground', text: 'text-muted-foreground', ring: 'ring-border' },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 md:gap-1.5 md:px-2.5 md:py-1 md:text-xs', config.text, config.ring)}>
      <span className={cn('size-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  )
}
