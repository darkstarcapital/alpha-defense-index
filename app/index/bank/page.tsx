'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Info, ArrowRight, ArrowUpRight, ArrowDownRight, Search,
  ShieldCheck, Triangle, 
} from 'lucide-react';

// Import your actual layout components
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/top-bar';
import { BottomNav } from '@/components/ui/bottom-nav';

/* ---------- Theme ---------- */
const GREEN = '#22E58F';
const RED = '#FF4D5E';
const BLUE = '#3B82F6';
const BG = '#050505'; // Updated to match your new black theme

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
const fmt = (n: any, d = 2) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUS = (n: any, d = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n: any, d = 2) => `${n >= 0 ? '+' : ''}${fmtUS(n, d)}`;

function timeLabel(iso: string, range: string) {
  const d = new Date(iso);
  if (range === '1D') return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (range === '1W' || range === '1M' || range === '3M')
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

const PERF = (() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bank = [100, 101.2, 100.4, 103.1, 105.6, 104.8, 108.2, 110.9, 112.4, 115.8, 118.1, 121.1];
  const nifty = [100, 100.6, 99.8, 101.4, 102.9, 103.4, 104.6, 106.1, 107.3, 108.9, 110.4, 112.0];
  return months.map((m, i) => ({ m, bank: bank[i], nifty: nifty[i] }));
})();

/* ---------- Hero ---------- */
function Hero({ data, range, setRange }: any) {
  const up = data.changePercent >= 0;
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              NORTHMAN BANK INDEX
            </h1>
            <span className="flex items-center gap-1.5 rounded-md border border-white/10 px-1.5 py-[2px] text-[10px] font-medium uppercase text-slate-400">
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              Closed
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Track. Analyze. Invest. — India's Next Gen Banking Index
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-[4px] text-[10px] font-medium transition-colors ${
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

      <div className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl text-white">
        {fmtUS(data.value)}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <div
            className={`inline-flex items-center gap-1 rounded px-2 py-[4px] text-[12px] font-semibold ${
              up ? 'bg-[#22E58F]/10 text-[#22E58F]' : 'bg-[#FF4D5E]/10 text-[#FF4D5E]'
            }`}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {signed(data.changePercent)}%
          </div>
          <div className="mt-1.5 text-[10px]">
            <span className={`font-medium ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
              {signed(data.changePoints)}
            </span>
            <span className="ml-2 text-slate-400">Today</span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4 sm:pl-4">
          {[
            ['Intraday High', fmtUS(data.high)],
            ['Intraday Low', fmtUS(data.low)],
            ["Today's Open", fmtUS(data.open)],
            ['Constituents', data.constituents],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] text-slate-400">{l}</div>
              <div className="mt-0.5 text-[12px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Main chart ---------- */
function LastValueLabel({ viewBox, value }: any) {
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

function ChartTooltip({ active, payload, range }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-white/10 bg-[#111A2C] px-2 py-1 text-[10px]">
      <div className="text-slate-400">{timeLabel(p.created_at, range)}</div>
      <div className="font-semibold text-white">{fmtUS(p.index_value)}</div>
    </div>
  );
}

function MainChart({ chartData, range, loading }: any) {
  const last = chartData.length ? chartData[chartData.length - 1].index_value : null;
  const domain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const vals = chartData.map((d: any) => d.index_value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.25, 5);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  return (
    <section className="relative mt-6 h-[250px] sm:h-[300px]">
      {loading && !chartData.length ? (
        <div className="flex h-full items-center justify-center text-[12px] text-slate-500">Loading chart…</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bankFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={0.45} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
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
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              orientation="right"
              domain={domain}
              tickFormatter={(v) => fmtUS(v)}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
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
              stroke={BLUE}
              strokeWidth={2}
              fill="url(#bankFill)"
              filter="url(#bankGlow)"
              dot={false}
              activeDot={{ r: 4, fill: BLUE, stroke: BG, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {last != null && (
              <ReferenceLine
                y={last}
                stroke={BLUE}
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
function PortfolioBreakdown({ count }: any) {
  const pie = [{ name: 'Banking Sector', value: 100 }];
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1 text-[13px] font-semibold">
          Portfolio Breakdown <Info size={12} className="text-slate-400" />
        </h2>
      </div>
      <div className="relative mx-auto mt-4 h-[120px] w-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pie}
              dataKey="value"
              innerRadius={45}
              outerRadius={58}
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
          <div className="text-[18px] font-bold leading-none">{count}</div>
          <div className="mt-1 text-[10px] text-slate-400">Companies</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-2 text-slate-200">
            <span className="h-2 w-2 rounded-full" style={{ background: BLUE }} />
            Banking Sector
          </span>
          <span>
            <span className="font-semibold">100%</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function Performance() {
  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold">Performance vs Benchmark (1Y)</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
        <span className="flex items-center gap-1.5 text-[#22E58F]">
          <span className="h-2 w-2 rounded-full bg-[#22E58F]" /> Northman Bank: +21.1%
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> Nifty 50: <span className="text-[#22E58F]">+12.0%</span>
        </span>
      </div>
      <div className="mt-1 text-[10px] text-white">Alpha (Outperformance): +9.1%</div>
      <div className="mt-3 h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={PERF} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="m" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis
              domain={[96, 124]}
              ticks={[96, 104, 112, 120]}
              tick={{ fill: '#94A3B8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#111A2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10 }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Line type="monotone" dataKey="bank" name="Northman Bank" stroke={GREEN} strokeWidth={2} dot={false} isAnimationActive={false} />
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
    <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-5 border-t border-gray-800 pt-6">
      {SUMMARY.map((s) => (
        <div key={s.label}>
          <div className="text-[10px] text-slate-500">{s.label}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-white">{s.value}</span>
            {s.delta && <span className="text-[9px] font-medium text-[#22E58F]">{s.delta}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- Market pulse ---------- */
function MarketPulse({ stocks }: any) {
  if (!stocks || stocks.length === 0) return null;
  
  // Use mock data if API doesn't return changes yet
  const mockStocks = [
    { ticker: 'HDFCBANK', change: 2.14 },
    { ticker: 'ICICIBANK', change: 1.67 },
    { ticker: 'SBIN', change: 1.12 },
    { ticker: 'BEL', change: -0.95 },
    { ticker: 'KOTAKBANK', change: -1.2 },
  ];

  const sorted = [...mockStocks].sort((a, b) => b.change - a.change);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  const Row = ({ s, up }: any) => (
    <div className="flex items-center justify-between rounded bg-[#111827] border border-gray-800 px-3 py-2">
      <span className="text-[11px] font-semibold">{s.ticker}</span>
      <span className={`flex items-center gap-1 text-[10px] font-bold ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {signed(s.change)}%
      </span>
    </div>
  );

  return (
    <section className="mt-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[13px] font-semibold text-gray-200">Market Pulse</h2>
          <p className="mt-0.5 text-[10px] text-slate-500">Today's strongest moves</p>
        </div>
        <span className="rounded-full bg-[#13241F] border border-green-900/30 px-2.5 py-1 text-[9px] font-bold text-[#22E58F]">LIVE</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[11px] font-semibold text-[#22E58F]">Top Gainers</div>
          <div className="space-y-2">{gainers.map((s) => <Row key={s.ticker} s={s} up />)}</div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold text-[#FF4D5E]">Top Losers</div>
          <div className="space-y-2">{losers.map((s) => <Row key={s.ticker} s={s} up={s.change >= 0} />)}</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stocks table ---------- */
function StocksTable({ stocks, loading }: any) {
  const [q, setQ] = useState('');
  const [all, setAll] = useState(false);
  
  const safeStocks = stocks || [];
  const filtered = safeStocks.filter(
    (s: any) => !q || s.ticker.toLowerCase().includes(q.toLowerCase()) || (s.name && s.name.toLowerCase().includes(q.toLowerCase()))
  );
  const rows = all || q ? filtered : filtered.slice(0, 10);

  return (
    <section className="mt-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-200">Stocks in Northman Bank</h2>
        <div className="flex items-center gap-2">
          <label className="flex w-[160px] items-center gap-1.5 rounded-md border border-white/10 bg-[#111] px-2 py-[6px] sm:w-[200px]">
            <Search size={12} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-transparent text-[11px] text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <button
            onClick={() => setAll((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#111] px-3 py-[6px] text-[11px] font-semibold"
          >
            {all ? 'Show Less' : 'View All'} <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-[#111]">
            <tr className="border-b border-gray-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 pl-4 pr-2 font-medium">Ticker</th>
              <th className="px-2 py-3 font-medium">Company Name</th>
              <th className="px-2 py-3 text-right font-medium">Price (₹)</th>
              <th className="px-2 py-3 text-right font-medium">1 Day % Change</th>
              <th className="px-2 py-3 text-right font-medium">Weightage</th>
            </tr>
          </thead>
          <tbody>
            {loading && !safeStocks.length && (
              <tr><td colSpan={5} className="py-8 text-center text-[12px] text-slate-500">Loading stocks…</td></tr>
            )}
            {!loading && !rows.length && (
              <tr><td colSpan={5} className="py-8 text-center text-[12px] text-slate-500">No stocks found.</td></tr>
            )}
            {rows.map((s: any) => {
              // Default mock data if API doesn't provide it yet
              const change = s.change || (Math.random() * 2 - 1);
              const weightage = s.weightage || (Math.random() * 15 + 1);
              const up = change >= 0;
              
              return (
                <tr key={s.ticker} className="border-b border-gray-800/50 transition-colors hover:bg-white/[0.02]">
                  <td className="py-3 pl-4 pr-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-semibold">{s.ticker}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[12px] text-slate-300">{s.name || s.ticker}</td>
                  <td className={`px-2 py-3 text-right text-[12px] font-medium ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      {fmt(s.price)}
                    </span>
                  </td>
                  <td className={`px-2 py-3 text-right text-[12px] font-semibold ${up ? 'text-[#22E58F]' : 'text-[#FF4D5E]'}`}>
                    {signed(change)}%
                  </td>
                  <td className="px-2 py-3 text-right text-[12px] font-medium">{weightage.toFixed(2)}%</td>
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/index-data?index=bank`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load index data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const hero = { ...FALLBACK, ...(data || {}) };
  const chartData = data?.chartData || [];
  const stocks = data?.stocks || [];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden pb-16 md:pb-0">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="flex flex-col flex-1 w-full md:ml-60 relative z-10">
        <TopBar onMenu={() => setMenuOpen(!menuOpen)} />
        
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {error && (
              <div className="mt-3 rounded-md border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 px-4 py-3 text-[13px] text-[#FF4D5E]">
                {error}
              </div>
            )}

            <div className="mt-2 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              {/* Main Left Content */}
              <div className="min-w-0">
                <Hero data={hero} range={range} setRange={setRange} />
                <MainChart chartData={chartData} range={range} loading={loading} />
              </div>
              
              {/* Right Panel */}
              <aside className="min-w-0 bg-[#0A0A0A]/50 border border-gray-800 rounded-2xl p-5 h-fit">
                <PortfolioBreakdown count={hero.constituents} />
                <Performance />
              </aside>
            </div>

            <SummaryGrid />
            <MarketPulse stocks={stocks} />
            <StocksTable stocks={stocks} loading={loading} />
          </div>
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}