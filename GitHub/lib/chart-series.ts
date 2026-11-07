export const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const
export type Range = (typeof RANGES)[number]

export type SeriesPoint = { label: string; value: number }

const RANGE_CONFIG: Record<Range, { points: number; startDrift: number; seed: number }> = {
  '1D': { points: 90, startDrift: 0, seed: 11 },
  '1W': { points: 70, startDrift: 0.018, seed: 23 },
  '1M': { points: 80, startDrift: 0.045, seed: 37 },
  '3M': { points: 90, startDrift: 0.09, seed: 41 },
  '1Y': { points: 100, startDrift: 0.22, seed: 53 },
  ALL: { points: 110, startDrift: 0.48, seed: 67 },
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function labelFor(range: Range, i: number, total: number) {
  const now = new Date()
  if (range === '1D') {
    const minutes = 9 * 60 + 15 + Math.round((i / (total - 1)) * 375)
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const suffix = h >= 12 ? 'PM' : 'AM'
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`
  }
  const spanDays = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: 365 * 5 }[range]
  const date = new Date(now.getTime() - (1 - i / (total - 1)) * spanDays * 86_400_000)
  return date.toLocaleDateString('en-IN', {
    day: range === '1Y' || range === 'ALL' ? undefined : 'numeric',
    month: 'short',
    year: range === 'ALL' ? '2-digit' : undefined,
  })
}

const HISTORY_SPAN_DAYS: Record<Exclude<Range, '1D'>, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: 365 * 5,
}

export type MockHistoryPoint = {
  time: { year: number; month: number; day: number }
  value: number
}

export function buildMockHistory(range: Exclude<Range, '1D'>, endValue: number): MockHistoryPoint[] {
  const spanDays = HISTORY_SPAN_DAYS[range]
  const { startDrift, seed } = RANGE_CONFIG[range]
  const ist = new Date(Date.now() + 19_800 * 1000)
  const end = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate())
  const days: MockHistoryPoint['time'][] = []

  for (let offset = spanDays; offset >= 0; offset -= 1) {
    const date = new Date(end - offset * 86_400_000)
    const weekday = date.getUTCDay()
    if (weekday === 0 || weekday === 6) continue
    days.push({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() })
  }

  const count = days.length
  const rand = mulberry32(seed)
  const start = endValue * (1 - startDrift)
  const volatility = endValue * (range === '1W' ? 0.004 : 0.008)
  const walk = [0]
  for (let i = 1; i < count; i += 1) walk.push(walk[i - 1] + (rand() - 0.48) * volatility)
  const target = endValue - start
  const last = walk[count - 1] ?? 0

  return days.map((time, i) => {
    const progress = count === 1 ? 1 : i / (count - 1)
    return {
      time,
      value: Number((start + walk[i] - progress * (last - target)).toFixed(2)),
    }
  })
}

export function buildSeries(range: Range, endValue: number, startValue: number): SeriesPoint[] {
  const { points, startDrift, seed } = RANGE_CONFIG[range]
  const rand = mulberry32(seed)
  const start = range === '1D' ? startValue : endValue * (1 - startDrift)
  const volatility = endValue * 0.0012

  const walk = [0]
  for (let i = 1; i < points; i++) walk.push(walk[i - 1] + (rand() - 0.47) * volatility)

  const target = endValue - start
  const last = walk[points - 1]
  return walk.map((w, i) => {
    const t = i / (points - 1)
    return {
      label: labelFor(range, i, points),
      value: Number((start + w - t * (last - target)).toFixed(2)),
    }
  })
}
