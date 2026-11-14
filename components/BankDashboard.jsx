'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Home, Shield, Landmark, Newspaper, Briefcase, Eye, BarChart3,
  Settings, Bell, ChevronDown, Info, ArrowRight, ArrowUpRight, ArrowDownRight, Search,
  ShieldCheck, Triangle, Menu, X,
} from 'lucide-react';

/* ---------- Theme ---------- */
const GREEN = '#22E58F';
const RED = '#FF4D5E';
const BLUE = '#3B82F6';
const BG = '#0B1120';

/* ---------- Static content ---------- */
const NAV = [
  { label: 'Home', icon: Home },
  { label: 'Defense Index', icon: Shield },
  { label: 'Bank Index', icon: Landmark },
  { label: 'Market News', icon: Newspaper },
  { label: 'Portfolio', icon: Briefcase },
  { label: 'Watchlist', icon: Eye },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];
const ACTIVE_NAV = 'Bank Index';
const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

const SUMMARY = [
  { label: 'Total Market Cap', value: '₹ 54,86,614 Cr' },
  { label: 'No. of Companies', value: '18' },
  { label: 'Top 5 Weightage', value: '61.69%', delta: '+0.21%' },
  { label: 'Net Interest Margin (Avg.)', value: '3.42%', delta: '+0.06%' },
  { label: 'Total Return (2Y)', value: '+38.52%' },
  { label: 'Methodology', value: 'Free-Float Market Cap' },
  { label: 'Launch Date', value: '18-Oct-2024' },
  { label: 'Index P/E', value: '15.8' },
  { label: 'Total Net Profit', value: '₹ 3,12,480 Cr' },
  { label: 'Avg Loan Book Growth', value: '+14.6%' },
];

const FALLBACK = {
  value: 12106.9, changePercent: 21.06, changePoints: 2106.9,
  high: 12150.2, low: 12050.1, open: 12080.0, constituents: 18,
};

/* ---------- Helpers ---------- */
const fmt = (n, d = 2) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUS = (n, d = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n, d = 2) => `${n >= 0 ? '+' : ''}${fmtUS(n, d)}`;

function timeLabel(iso, range) {
  const d = new Date(iso);
  if (range === '1D') return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (range === '1W' || range === '1M' || range === '3M')
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

// 1Y performance vs benchmark (rebased to 100)
const PERF = (() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bank = [100, 101.2, 100.4, 103.1, 105.6, 104.8, 108.2, 110.9, 112.4, 115.8, 118.1, 121.1];
  const nifty = [100, 100.6, 99.8, 101.4, 102.9, 103.4, 104.6, 106.1, 107.3, 108.9, 110.4, 112.0];
  return months.map((m, i) => ({ m, bank: bank[i], nifty: nifty[i] }));
})();

/* ---------- Sidebar ---------- */
function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[218px] flex-col border-r border-white/[0.04] bg-[#0B1120] px-2.5 pb-5 pt-4 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} color={GREEN} strokeWidth={2.5} />
            <span className="text-[17px] font-bold tracking-tight">Northman</span>
          </div>
          <button className="text-slate-400 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="mt-7 space-y-1">
          {NAV.map(({ label, icon: Icon }) => {
            const active = label === ACTIVE_NAV;
            return (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
                  active
                    ? 'bg-[#13241F] font-semibold text-white'
                    : 'text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={15} strokeWidth={1.8} className={active ? 'text-[#22E58F]' : 'text-slate-300'} />
                {label}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 px-3.5">
            <ShieldCheck size={20} color={GREEN} strokeWidth={1.8} />
            <div className="leading-tight">
              <div className="text-[11px] text-slate-400">Stronger Banking</div>
              <div className="text-[11px] font-semibold text-white">A Safer Tomorrow</div>
            </div>
          </div>
          <div className="mt-7 px-1 text-[9.5px] leading-[1.6] text-slate-400">
            <div>Northman Bank Index</div>
            <div>
              Powered by <span className="font-semibold text-white">Northman</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ onMenu }) {
  return (
    <header className="flex h-[38px] items-center justify-between lg:justify-end">
      <button className="text-slate-300 lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-4">
        <button className="relative text-slate-300" aria-label="Notifications">
          <Bell size={14} />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#FF4D5E]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B2436] text-[9.5px] font-semibold">
            MS
          </div>
          <span className="text-[11.5px] font-semibold">Manas Shukla</span>
          <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero({ data, range, setRange }) {
  const up = data.changePercent >= 0;
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[15px] font-extrabold uppercase tracking-tight sm:text-[17px]">
              Northman Bank Index
            </h1>
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 px-1.5 py-[2px] text-[8.5px] font-medium uppercase text-slate-400">
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              Closed
            </span>
          </div>
          <p className="mt-0.5 text-[9.5px] text-slate-400">
            Track. Analyze. Invest. — India's Next Gen Banking Index
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-[3px] text-[9px] font-medium transition-colors ${
                r === range
                  ? 'border border-[#22E58F]/25 bg-[#13241F] text-[#22E58F]'
                  : 'border border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1.5 text-[30px] font-bold leading-tight tracking-tight sm:text-[33px]">
        {fmtUS(data.value)}
      </div>

      <div className="mt-1 flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <div
            className={`inline-flex items-center gap-1 rounded px-1.5 py-[3px] text-[11px] font-semibold ${
              up ? 'bg-[#22E58F]/10 text-[#22E58F]' : 'bg-[#FF4D5E]/10 text-[#FF4D5E]'
            }`}
          >
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {signed(data.changePercent)}%
          </div>
          <div className="mt-1 text-[9px]">
            <span className={`font-medium ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
              {signed(data.changePoints)}
            </span>
            <span className="ml-2 text-slate-400">Today</span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4 sm:pl-4">
          {[
            ['Intraday High', fmtUS(data.high)],
            ['Intraday Low', fmtUS(data.low)],
            ["Today's Open", fmtUS(data.open)],
            ['Constituents', data.constituents],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[8.5px] text-slate-400">{l}</div>
              <div className="mt-0.5 text-[10px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Main chart ---------- */
function LastValueLabel({ viewBox, value }) {
  if (!viewBox) return null;
  const x = viewBox.x + viewBox.width;
  const y = viewBox.y;
  return (
    <g>
      <rect x={x + 2} y={y - 6} width={44} height={12} rx={2} fill={GREEN} />
      <text x={x + 24} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={600} fill={BG}>
        {fmtUS(value)}
      </text>
    </g>
  );
}

function ChartTooltip({ active, payload, range }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-white/10 bg-[#111A2C] px-2 py-1 text-[9.5px]">
      <div className="text-slate-400">{timeLabel(p.created_at, range)}</div>
      <div className="font-semibold text-white">{fmtUS(p.index_value)}</div>
    </div>
  );
}

function MainChart({ chartData, range, loading }) {
  const last = chartData.length ? chartData[chartData.length - 1].index_value : null;
  const domain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const vals = chartData.map((d) => d.index_value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.25, 5);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  return (
    <section className="relative mt-3 h-[190px] sm:h-[215px]">
      {loading && !chartData.length ? (
        <div className="flex h-full items-center justify-center text-[12px] text-slate-500">Loading chart…</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bankFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.45} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
              </linearGradient>
              <filter id="bankGlow" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical horizontal />
            <XAxis
              dataKey="created_at"
              tickFormatter={(v) => timeLabel(v, range)}
              tick={{ fill: '#64748B', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              orientation="right"
              domain={domain}
              tickFormatter={(v) => fmtUS(v)}
              tick={{ fill: '#94A3B8', fontSize: 8 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              width={52}
              tickCount={8}
            />
            <Tooltip
              content={<ChartTooltip range={range} />}
              cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="index_value"
              stroke={GREEN}
              strokeWidth={1.6}
              fill="url(#bankFill)"
              filter="url(#bankGlow)"
              dot={false}
              activeDot={{ r: 4, fill: GREEN, stroke: BG, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {last != null && (
              <ReferenceLine
                y={last}
                stroke={GREEN}
                strokeDasharray="2 3"
                label={<LastValueLabel value={last} />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

/* ---------- Right panel ---------- */
function PortfolioBreakdown({ count }) {
  const pie = [{ name: 'Banking Sector', value: 100 }];
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1 text-[11px] font-semibold">
          Portfolio Breakdown <Info size={10} className="text-slate-400" />
        </h2>
        <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 text-[9px] font-medium text-[#22E58F]">
          View Details <ArrowRight size={10} />
        </a>
      </div>
      <div className="relative mx-auto mt-2.5 h-[92px] w-[92px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pie}
              dataKey="value"
              innerRadius={34}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {pie.map((p) => (
                <Cell key={p.name} fill={BLUE} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[14px] font-bold leading-none">{count}</div>
          <div className="mt-0.5 text-[8px] text-slate-400">Companies</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
            Banking Sector
          </span>
          <span>
            <span className="font-semibold">100%</span>
            <span className="ml-1.5 text-slate-400">({count} companies)</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function Performance() {
  return (
    <section className="mt-6">
      <h2 className="text-[11px] font-semibold">Performance vs Benchmark (1Y)</h2>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[8.5px]">
        <span className="flex items-center gap-1.5 text-[#22E58F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22E58F]" /> Northman Bank: +21.1%
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Nifty 50: <span className="text-[#22E58F]">+12.0%</span>
        </span>
      </div>
      <div className="mt-0.5 text-[8.5px] text-white">Alpha (Outperformance): +9.1%</div>
      <div className="mt-1.5 h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={PERF} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="m" tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis
              domain={[96, 124]}
              ticks={[96, 104, 112, 120]}
              tick={{ fill: '#94A3B8', fontSize: 8 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#111A2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 9.5 }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Line type="monotone" dataKey="bank" name="Northman Bank" stroke={GREEN} strokeWidth={1.8} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="nifty" name="Nifty 50" stroke="#94A3B8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ---------- Summary ---------- */
function SummaryGrid() {
  return (
    <section className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 xl:grid-cols-5">
      {SUMMARY.map((s) => (
        <div key={s.label}>
          <div className="text-[8px] text-slate-400">{s.label}</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[10px] font-semibold">{s.value}</span>
            {s.delta && <span className="text-[7.5px] font-medium text-[#22E58F]">{s.delta}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- Market pulse ---------- */
function MarketPulse({ stocks }) {
  const sorted = [...stocks].sort((a, b) => b.change - a.change);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();
  const Row = ({ s, up }) => (
    <div className="flex items-center justify-between rounded bg-[#111827] px-2 py-1">
      <span className="text-[9px] font-semibold">{s.ticker}</span>
      <span className={`flex items-center gap-0.5 text-[8.5px] font-medium ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
        {up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
        {signed(s.change)}%
      </span>
    </div>
  );
  return (
    <section className="mt-5 px-1">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[10.5px] font-semibold">Market Pulse</h2>
          <p className="mt-0.5 text-[8.5px] text-slate-400">Today's strongest moves</p>
        </div>
        <span className="rounded-full bg-[#13241F] px-2 py-0.5 text-[7.5px] font-bold text-[#22E58F]">LIVE</span>
      </div>
      <div className="mt-2 grid gap-2.5 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[8.5px] font-semibold text-[#22E58F]">Top Gainers</div>
          <div className="space-y-1">{gainers.map((s) => <Row key={s.ticker} s={s} up />)}</div>
        </div>
        <div>
          <div className="mb-1 text-[8.5px] font-semibold text-[#FF4D5E]">Top Losers</div>
          <div className="space-y-1">{losers.map((s) => <Row key={s.ticker} s={s} up={s.change >= 0} />)}</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stocks table ---------- */
function StocksTable({ stocks, loading }) {
  const [q, setQ] = useState('');
  const [all, setAll] = useState(false);
  const filtered = stocks.filter(
    (s) => !q || s.ticker.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())
  );
  const rows = all || q ? filtered : filtered.slice(0, 10);

  return (
    <section className="mt-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1.5">
        <h2 className="text-[11px] font-semibold">Stocks in Northman Bank</h2>
        <div className="flex items-center gap-2">
          <label className="flex w-[160px] items-center gap-1.5 rounded-md border border-white/10 px-2 py-[4px] sm:w-[180px]">
            <Search size={10} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-transparent text-[9.5px] text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <button
            onClick={() => setAll((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#111827] px-2 py-[4px] text-[9.5px] font-semibold"
          >
            {all ? 'Show Less' : 'View All'} <ArrowRight size={11} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 overflow-x-auto">
        <table className="w-full min-w-[580px] text-left [&_td]:!py-2 [&_th]:!py-2 [&_td]:!text-[9.5px]">
          <thead>
            <tr className="border-b border-white/[0.07] text-[8.5px] text-slate-400">
              <th className="py-3 pl-2.5 pr-2 font-medium">#</th>
              <th className="px-2 py-3 font-medium">Ticker</th>
              <th className="px-2 py-3 font-medium">Company Name</th>
              <th className="px-2 py-3 text-right font-medium">Price (₹)</th>
              <th className="px-2 py-3 text-right font-medium">1 Day % Change</th>
              <th className="px-2 py-3 text-right font-medium">Weightage</th>
              <th className="py-3 pl-2 pr-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading && !stocks.length && (
              <tr><td colSpan={7} className="py-8 text-center text-[12px] text-slate-500">Loading stocks…</td></tr>
            )}
            {!loading && !rows.length && (
              <tr><td colSpan={7} className="py-8 text-center text-[12px] text-slate-500">No stocks match “{q}”.</td></tr>
            )}
            {rows.map((s) => {
              const up = s.change >= 0;
              return (
                <tr key={s.ticker} className="border-b border-white/[0.07] transition-colors hover:bg-white/[0.02]">
                  <td className="py-3.5 pl-2.5 pr-2 text-[12px] text-slate-400">{s.rank}</td>
                  <td className="px-2 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B2436] text-[7px] font-bold">
                        {s.ticker.slice(0, 2)}
                      </span>
                      <span className="text-[9.5px] font-semibold">{s.ticker}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3.5 text-[12px] text-slate-300">{s.name}</td>
                  <td className={`px-2 py-3.5 text-right text-[12.5px] font-medium ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <Triangle size={6} fill="currentColor" className={up ? '' : 'rotate-180'} />
                      {fmt(s.price)}
                    </span>
                  </td>
                  <td className={`px-2 py-3.5 text-right text-[12.5px] font-semibold ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
                    {signed(s.change)}%
                  </td>
                  <td className="px-2 py-3.5 text-right text-[12.5px] font-medium">{s.weightage.toFixed(2)}%</td>
                  <td className="py-3.5 pl-2 pr-2.5 text-right">
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-[8.5px] font-semibold text-white hover:text-[#22E58F]">
                      Details
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function BankDashboard() {
  const [range, setRange] = useState('1D');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/index-data?index=bank&range=${range}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load index data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range]);

  const hero = { ...FALLBACK, ...(data || {}) };
  const chartData = data?.chartData || [];
  const stocks = data?.stocks || [];

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[218px]">
        <div className="mx-auto max-w-[960px] px-4 sm:px-5 lg:px-6">
          <TopBar onMenu={() => setMenuOpen(true)} />

          {error && (
            <div className="mt-3 rounded-md border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 px-3 py-2 text-[12px] text-[#FF4D5E]">
              {error}
            </div>
          )}

          <div className="mt-3 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_270px]">
            <div className="min-w-0">
              <Hero data={hero} range={range} setRange={setRange} />
              <MainChart chartData={chartData} range={range} loading={loading} />
            </div>
            <aside className="min-w-0">
              <PortfolioBreakdown count={hero.constituents} />
              <Performance />
            </aside>
          </div>

          <SummaryGrid />
          <MarketPulse stocks={stocks} />
          <StocksTable stocks={stocks} loading={loading} />
        </div>
      </div>
    </div>
  );
}
