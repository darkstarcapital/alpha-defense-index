import type { Stock } from '@/lib/market-data'
import { cn } from '@/lib/utils'

type Card = { label: string; value: string; delta?: number }

export function SummaryCards({ stocks, totalCompanies, changePercent }: { stocks: Stock[]; totalCompanies: number; changePercent: number }) {
  const top5 = [...stocks]
    .sort((a, b) => b.weightage - a.weightage)
    .slice(0, 5)
    .reduce((sum, s) => sum + s.weightage, 0)

  const cards: Card[] = [
    { label: 'Total Market Cap', value: '\u20B9 8,42,650 Cr' },
    { label: 'No. of Companies', value: String(totalCompanies) },
    { label: 'Top 5 Weightage', value: `${top5.toFixed(2)}%`, delta: 0.21 },
    { label: 'Defence Revenue (Avg.)', value: '48.32%', delta: 1.15 },
    { label: 'Total Return (2Y)', value: '+24.77%' },
    { label: 'Methodology', value: 'Free-Float Market Cap' },
    { label: 'Launch Date', value: '18-Oct-2024' },
    { label: 'Index P/E', value: '34.5' },
    { label: 'Total Defence Revenue', value: '\u20B9 42,650 Cr' },
    { label: 'Avg Defence Rev. Growth', value: '+12.5%' },
  ]

  return (
    <section aria-label="Index summary" className="grid grid-cols-4 gap-1.5 lg:grid-cols-5 lg:gap-3">
      {cards.map(({ label, value, delta }) => (
        <div key={label} className="min-w-0 p-1.5 md:p-3">
          <p className="text-[9px] leading-tight text-gray-400 md:text-[11px]">{label}</p>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1 md:gap-x-2">
            <span className="text-[10px] font-semibold leading-tight tabular-nums md:text-sm">{value}</span>
            {delta !== undefined && (
              <span className={cn('text-[9px] font-medium tabular-nums md:text-[11px]', delta >= 0 ? 'text-positive' : 'text-negative')}>
                {delta >= 0 ? '+' : ''}
                {delta.toFixed(2)}%
              </span>
            )}
          </p>
        </div>
      ))}
    </section>
  )
}
