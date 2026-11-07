'use client'

import { useEffect, useRef, useState } from 'react'
import { AreaSeries, ColorType, createChart, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts'
import { buildMockHistory, type Range } from '@/lib/chart-series'

export type LiveTickPoint = { time: number; value: number; createdAt: string }
type Tick = { created_at: string; index_value: number | string }

const IST_OFFSET_SECONDS = 19_800
const SESSION_OPEN_SECONDS = 9 * 3600 + 15 * 60
const SESSION_CLOSE_SECONDS = 15 * 3600 + 30 * 60

function isInsideSession(istUnix: number) {
  const clock = new Date(istUnix * 1000)
  const seconds = clock.getUTCHours() * 3600 + clock.getUTCMinutes() * 60 + clock.getUTCSeconds()
  return seconds >= SESSION_OPEN_SECONDS && seconds <= SESSION_CLOSE_SECONDS
}

function toSeries(ticks: Tick[]) {
  return ticks
    .map((tick) => ({
      time: Math.floor(new Date(tick.created_at).getTime() / 1000) + IST_OFFSET_SECONDS,
      value: Number(tick.index_value),
    }))
    .filter((tick) => Number.isFinite(tick.value) && isInsideSession(tick.time))
    .sort((a, b) => Number(a.time) - Number(b.time))
    .filter((tick, index, all) => index === 0 || tick.time !== all[index - 1].time)
}

function formatChartTime(time: Time) {
  if (typeof time === 'number') {
    return new Date(time * 1000).toLocaleTimeString('en-IN', { hour12: false, timeZone: 'UTC' })
  }
  if (typeof time === 'object') {
    return `${time.day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][time.month - 1]} ${time.year}`
  }
  return String(time)
}

export function LiveTicksChart({
  range,
  fallbackValue,
  fallbackStart,
  onData,
}: {
  range: Range
  fallbackValue: number
  fallbackStart: number
  onData?: (points: LiveTickPoint[]) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const endValueRef = useRef(fallbackValue)
  const onDataRef = useRef(onData)
  const fittedRangeRef = useRef<string | null>(null)
  endValueRef.current = fallbackValue
  onDataRef.current = onData
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8592a3' },
      grid: { vertLines: { color: '#18212c' }, horzLines: { color: '#18212c' } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.2, bottom: 0.2 } },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        shiftVisibleRangeOnNewBar: false,
        rightOffset: 0,
      },
      localization: {
        timeFormatter: formatChartTime,
      },
      crosshair: { vertLine: { color: '#19e68c', width: 1, style: 2 }, horzLine: { color: '#19e68c', width: 1, style: 2 } },
    })
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#19e68c',
      topColor: 'rgba(25, 230, 140, 0.42)',
      bottomColor: 'rgba(25, 230, 140, 0.02)',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      autoscaleInfoProvider: (original) => {
        const info = original()
        if (!info?.priceRange) return info
        const { minValue, maxValue } = info.priceRange
        if (maxValue - minValue >= 20) return info
        const midpoint = (minValue + maxValue) / 2
        return { ...info, priceRange: { minValue: midpoint - 10, maxValue: midpoint + 10 } }
      },
    })
    chartRef.current = chart
    seriesRef.current = series

    const resizeObserver = new ResizeObserver(() => chart.resize(containerRef.current?.clientWidth ?? 0, containerRef.current?.clientHeight ?? 0))
    resizeObserver.observe(containerRef.current)
    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    const paint = (points: { time: Time; value?: number }[], fitKey: string) => {
      const activeChart = chartRef.current
      const activeSeries = seriesRef.current
      if (!activeChart || !activeSeries) return
      const firstPaint = fittedRangeRef.current !== fitKey
      const visible = firstPaint ? null : activeChart.timeScale().getVisibleLogicalRange()
      activeSeries.setData([])
      activeSeries.setData(points)
      if (firstPaint) {
        activeChart.timeScale().fitContent()
        fittedRangeRef.current = fitKey
        return
      }
      if (visible) activeChart.timeScale().setVisibleLogicalRange(visible)
    }

    if (range !== '1D') {
      chart.applyOptions({ timeScale: { timeVisible: false, secondsVisible: false } })
      paint(buildMockHistory(range, endValueRef.current), range)
      setError(null)
      return
    }

    chart.applyOptions({ timeScale: { timeVisible: true, secondsVisible: false } })
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/live-ticks', { cache: 'no-store' })
        const json = await response.json()
        if (!response.ok || json.error) throw new Error(json.error ?? 'Unable to load live ticks')
        if (cancelled || !seriesRef.current || !chartRef.current) return
        const points = toSeries(json.ticks ?? []).map((point) => ({
          ...point,
          time: Number(point.time),
          createdAt: new Date(Number(point.time) * 1000).toISOString(),
        }))
        onDataRef.current?.(points)
        paint(points.map((point) => ({ time: point.time as Time, value: point.value })), '1D')
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Live tick feed unavailable')
      }
    }

    load()
    const interval = window.setInterval(load, 5000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [range])

  return (
    <div className="relative mt-2 h-[180px] w-full md:mt-6 md:h-[400px]">
      <div ref={containerRef} className="absolute inset-0" aria-label="Live index value chart" />
      {error && (
        <p className="absolute top-2 right-2 rounded bg-background/80 px-2 py-1 text-[10px] text-muted-foreground">
          Live ticks unavailable; showing latest index value
        </p>
      )}
      <span className="sr-only">
        Live chart for index values. Current value {fallbackValue}; previous reference {fallbackStart}.
      </span>
    </div>
  )
}
