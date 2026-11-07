'use client'

import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Stock } from '@/lib/market-data'
import { cn } from '@/lib/utils'

type Mover = { ticker: string; price: number; changePercent: number }

export function MarketPulse({ stocks }: { stocks: Stock[] }) {
  const [movers, setMovers] = useState<Mover[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetch('/api/market-pulse', { cache: 'no-store' })
      const json = await res.json().catch(() => null)
      if (!cancelled && json?.movers?.length) setMovers(json.movers)
    }
    load().catch(() => undefined)
    const id = window.setInterval(() => load().catch(() => undefined), 5000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [])

  const fallback = stocks.map((stock) => ({ ticker: stock.ticker, price: stock.price, changePercent: stock.changePercent ?? 0 }))
  const active = movers.length ? movers : fallback
  const gainers = [...active].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3)
  const losers = [...active].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)

  return (
    <section aria-labelledby="market-pulse-title" className="p-2.5 md:p-5">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        <div>
          <h2 id="market-pulse-title" className="text-xs font-semibold md:text-sm">Market Pulse</h2>
          <p className="text-[10px] text-muted-foreground md:mt-0.5 md:text-xs">Today&apos;s strongest moves</p>
        </div>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold tracking-wider text-primary md:px-2.5 md:py-1 md:text-[10px]">LIVE</span>
      </div>
      <div className="mt-2 grid gap-2 md:mt-4 md:grid-cols-2 md:gap-4">
        <MoverColumn title="Top Gainers" items={gainers} positive />
        <MoverColumn title="Top Losers" items={losers} />
      </div>
    </section>
  )
}

function MoverColumn({ title, items, positive = false }: { title: string; items: Mover[]; positive?: boolean }) {
  return (
    <div>
      <p className={cn('mb-1 text-[10px] font-medium md:mb-2 md:text-xs', positive ? 'text-positive' : 'text-negative')}>{title}</p>
      <ul className="grid gap-1 md:gap-2">
        {items.map((item) => {
          const up = positive && item.changePercent >= 0
          const Icon = up ? ArrowUpRight : ArrowDownRight
          return (
            <li key={item.ticker} className="flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1 text-[10px] md:px-3 md:py-2 md:text-xs">
              <span className="font-semibold">{item.ticker}</span>
              <span className={cn('inline-flex items-center gap-0.5 font-medium tabular-nums md:gap-1', up ? 'text-positive' : 'text-negative')}>
                <Icon className="size-3 md:size-3.5" aria-hidden="true" />{up ? '+' : ''}{item.changePercent.toFixed(2)}%
              </span>
            </li>
          )
        })}
        {!items.length && <li className="flex items-center gap-2 text-xs text-muted-foreground"><Minus className="size-3" />No movers yet</li>}
      </ul>
    </div>
  )
}
