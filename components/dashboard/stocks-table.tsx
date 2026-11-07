'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search, Triangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatNumber, formatSigned, type Stock } from '@/lib/market-data'
import { cn } from '@/lib/utils'

const toneFor = (value: number | null) => value == null ? 'text-foreground' : value >= 0 ? 'text-positive' : 'text-negative'

export function StocksTable({ stocks }: { stocks: Stock[] }) {
  const [selected, setSelected] = useState<Stock | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [query, setQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; changePercent: number }>>({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const response = await fetch('/api/stock-prices', { cache: 'no-store' })
      const json = await response.json().catch(() => null)
      if (!cancelled && json?.prices) setLivePrices(json.prices)
    }
    load().catch(() => undefined)
    const id = window.setInterval(() => load().catch(() => undefined), 5000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [])

  const liveStocks = useMemo(() => stocks.map((stock) => livePrices[stock.ticker]
    ? { ...stock, price: livePrices[stock.ticker].price, changePercent: livePrices[stock.ticker].changePercent }
    : stock), [stocks, livePrices])
  const normalized = query.trim().toLowerCase()
  const suggestions = normalized ? liveStocks.filter((stock) => `${stock.ticker} ${stock.name}`.toLowerCase().includes(normalized)).slice(0, 6) : []
  const committed = committedQuery.trim().toLowerCase()
  const filteredStocks = liveStocks.filter((stock) => !committed || `${stock.ticker} ${stock.name}`.toLowerCase().includes(committed))
  const visibleStocks = showAll || committed ? filteredStocks : filteredStocks.slice(0, 8)
  const isNonConstituent = Boolean(committed && filteredStocks.length === 0)

  const commitSearch = (value: string) => {
    const next = value.trim()
    const match = liveStocks.find((stock) => `${stock.ticker} ${stock.name}`.toLowerCase().includes(next.toLowerCase()))
    setQuery(next)
    setCommittedQuery(match ? match.ticker : next)
  }

  return (
    <section aria-labelledby="stocks-title">
      <div className="flex flex-col gap-1.5 px-2.5 py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:px-5 md:py-4">
        <h2 id="stocks-title" className="text-xs font-semibold md:text-base">Stocks in Alpha Defense</h2>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:w-72">
            <label htmlFor="stock-search" className="sr-only">Search stocks, tickers, or company names</label>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:size-4" aria-hidden="true" />
            <input id="stock-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commitSearch(query) } }} placeholder="Search stocks..." autoComplete="off" className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/10 md:h-9 md:pr-3 md:pl-9 md:text-sm" />
            {normalized && committedQuery !== query && (
              <div className="absolute top-full right-0 left-0 z-30 mt-1 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-xl" role="listbox" aria-label="Stock suggestions">
                {suggestions.map((stock) => <button key={stock.ticker} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => commitSearch(stock.ticker)} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs hover:bg-accent"><span className="font-bold text-primary">{stock.ticker}</span><span className="truncate text-foreground">- {stock.name}</span></button>)}
                {!suggestions.length && <p className="px-2.5 py-2 text-xs text-negative">&quot;{query.trim()}&quot; is not part of the Alpha Defense Index.</p>}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setShowAll((value) => !value)} className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-white hover:bg-secondary/80 md:h-9 md:gap-1.5 md:px-3 md:text-sm">{showAll ? 'Show Top 8' : 'View All'} <ArrowRight className="size-3.5 md:size-4" aria-hidden="true" /></button>
        </div>
      </div>

      {isNonConstituent && <p className="px-5 py-3 text-xs text-negative">&quot;{committedQuery}&quot; is not part of the Alpha Defense Index.</p>}
      <ul className="flex flex-col divide-y divide-border/60 md:hidden">
        {!visibleStocks.length && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No stocks returned by the data source.</li>}
        {visibleStocks.map((stock) => {
          const move = stock.changePercent ?? stock.change
          return (
            <li key={stock.ticker} className="flex items-center justify-between gap-2 px-2.5 py-1">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight">{stock.ticker}</p>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">{stock.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className={cn('text-[11px] font-medium tabular-nums', toneFor(move))}>{formatNumber(stock.price)}</p>
                <p className={cn('text-[10px] font-medium tabular-nums', toneFor(stock.changePercent))}>{stock.changePercent == null ? '—' : `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}</p>
                <button type="button" onClick={() => setSelected(stock)} className="text-[10px] font-medium text-white">Details<span className="sr-only"> for {stock.name}</span></button>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="hidden overflow-x-auto px-2 pb-3 md:block">
        <table className="w-full min-w-[680px] table-fixed text-sm whitespace-nowrap">
          <colgroup><col className="w-10" /><col className="w-32" /><col /><col className="w-28" /><col className="w-32" /><col className="w-20" /></colgroup>
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th scope="col" className="px-3 py-3 font-medium">#</th><th scope="col" className="px-3 py-3 font-medium">Ticker</th><th scope="col" className="px-3 py-3 font-medium">Company Name</th><th scope="col" className="px-3 py-3 text-right font-medium">Price (₹)</th><th scope="col" className="px-3 py-3 text-right font-medium">1 Day % Change</th><th scope="col" className="px-3 py-3 text-right font-medium"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {!visibleStocks.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">No stocks returned by the data source.</td></tr>}
            {visibleStocks.map((stock, index) => { const move = stock.changePercent ?? stock.change; return <tr key={stock.ticker} className="border-b border-border/60 last:border-0 hover:bg-secondary/50"><td className="px-3 py-3 text-muted-foreground tabular-nums">{index + 1}</td><td className="px-3 py-3"><span className="flex items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold ring-1 ring-border" aria-hidden="true">{stock.ticker.slice(0, 2)}</span><span className="font-semibold">{stock.ticker}</span></span></td><td className="truncate px-3 py-3">{stock.name}</td><td className={cn('px-3 py-3 text-right font-medium tabular-nums', toneFor(move))}><span className="inline-flex items-center gap-1.5">{move != null && <Triangle className={cn('size-2.5 fill-current', move < 0 && 'rotate-180')} aria-hidden="true" />}{formatNumber(stock.price)}</span></td><td className={cn('px-3 py-3 text-right font-medium tabular-nums', toneFor(stock.changePercent))}>{stock.changePercent == null ? '—' : `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => setSelected(stock)} className="text-[11px] font-medium text-white hover:underline">Details<span className="sr-only"> for {stock.name}</span></button></td></tr> })}
          </tbody>
        </table>
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="border-border bg-popover sm:max-w-md">{selected && <StockDetails stock={selected} />}</DialogContent></Dialog>
    </section>
  )
}

function StockDetails({ stock }: { stock: Stock }) {
  const rows: { label: string; value: string; tone?: string }[] = [{ label: 'Ticker', value: stock.ticker }, { label: 'Index Weightage', value: `${stock.weightage.toFixed(2)}%` }]
  if (stock.basePrice != null) rows.push({ label: 'Base Price', value: `₹ ${formatNumber(stock.basePrice)}` })
  if (stock.change != null) rows.push({ label: 'Change Since Base', value: formatSigned(stock.change), tone: toneFor(stock.change) })
  if (stock.sector) rows.push({ label: 'Sector', value: stock.sector })
  if (stock.marketCap != null) rows.push({ label: 'Market Cap', value: `₹ ${stock.marketCap.toLocaleString('en-IN')} Cr` })
  return <><DialogHeader><DialogTitle className="text-xl">{stock.name}</DialogTitle><DialogDescription>{stock.ticker} · Alpha Defense Index constituent</DialogDescription></DialogHeader><div className="flex items-baseline gap-3"><span className="font-mono text-3xl font-bold tabular-nums">₹ {formatNumber(stock.price)}</span>{stock.changePercent != null && <span className={cn('text-sm font-semibold tabular-nums', toneFor(stock.changePercent))}>{formatSigned(stock.changePercent)}%</span>}</div><dl className="grid grid-cols-2 gap-3">{rows.map((row) => <div key={row.label} className="rounded-lg border border-border bg-card p-3"><dt className="text-xs text-muted-foreground">{row.label}</dt><dd className={cn('mt-1 text-sm font-semibold tabular-nums', row.tone)}>{row.value}</dd></div>)}</dl></>
}
