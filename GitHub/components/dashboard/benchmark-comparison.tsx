'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const ALPHA_GAINS = [0, 1.6, 3.4, 4.2, 7.1, 8.4, 11.2, 13, 15.6, 18.4, 21.2, 24.5]
const NIFTY_GAINS = [0, 1.1, 2.4, 3.8, 4.6, 6.2, 7.4, 8.1, 9, 10.2, 11.1, 12]

const DATA = MONTHS.map((month, index) => ({
  month,
  alpha: Number((100 + ALPHA_GAINS[index]).toFixed(1)),
  nifty: Number((100 + NIFTY_GAINS[index]).toFixed(1)),
}))

export function BenchmarkComparison() {
  return (
    <section aria-labelledby="benchmark-title" className="h-fit p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="benchmark-title" className="text-sm font-semibold md:text-base">
          Performance vs Benchmark (1Y)
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <li className="inline-flex items-center gap-1.5 text-[#10b981]">
            <span className="size-2 rounded-full bg-[#10b981]" aria-hidden="true" />
            Alpha Defense: +24.5%
          </li>
          <li className="inline-flex items-center gap-1.5 text-[#9ca3af]">
            <span className="size-2 rounded-full bg-[#9ca3af]" aria-hidden="true" />
            Nifty 50: +12.0%
          </li>
          <li className="text-foreground">Alpha (Outperformance): +12.5%</li>
        </ul>
      </div>
      <div className="mt-3 h-[150px] w-full md:mt-4 md:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eef3f7" strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8592a3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[96, 128]}
              tick={{ fill: '#8592a3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{ background: '#0c131c', border: '1px solid #18212c', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#eef3f7' }}
            />
            <Line type="monotone" dataKey="alpha" name="Alpha Defense" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="nifty" name="Nifty 50" stroke="#9ca3af" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
