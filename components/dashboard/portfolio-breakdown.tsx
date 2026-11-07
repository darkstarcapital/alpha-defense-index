'use client'

import { ArrowRight, Info } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const BREAKDOWN = [
  { name: 'Core Defence', value: 65, companies: 23, color: 'var(--chart-1)' },
  { name: 'Strategic Defence', value: 23, companies: 8, color: 'var(--chart-2)' },
  { name: 'Non-core', value: 12, companies: 5, color: 'var(--chart-3)' },
]

export function PortfolioBreakdown({ totalCompanies }: { totalCompanies: number }) {
  return (
    <section aria-labelledby="breakdown-title" className="h-fit p-3 md:p-5">
      <div className="flex items-center justify-between">
        <h2 id="breakdown-title" className="flex items-center gap-1.5 text-sm font-semibold md:text-base">
          Portfolio Breakdown
          <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </h2>
        <a href="#" className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-primary hover:underline">
          View Details <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="relative mx-auto mt-2 h-[116px] w-[116px] max-h-[116px] max-w-[116px] md:mt-3 md:h-[168px] md:w-[168px] md:max-h-[168px] md:max-w-[168px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={BREAKDOWN}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--card)"
              strokeWidth={3}
              isAnimationActive={false}
            >
              {BREAKDOWN.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums md:text-2xl">{totalCompanies}</span>
          <span className="text-xs text-muted-foreground">Companies</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-[11px] md:mt-6 md:gap-1.5 md:text-xs">
        {BREAKDOWN.map((d) => (
          <li key={d.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="size-2 rounded-full" style={{ background: d.color }} aria-hidden="true" />
              {d.name}
            </span>
            <span className="font-semibold tabular-nums">{d.value}%</span>
            <span className="text-right text-muted-foreground">({d.companies} companies)</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
