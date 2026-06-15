// StockChart.jsx
import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import { useGetStockPrices } from '@/hooks/useListings'

export default function StockChart({ symbol, isSyncing }) {
    const containerRef = useRef(null)
    const chartRef = useRef(null)
    const seriesRef = useRef(null)
    const allCandlesRef = useRef([])
    const dataRef = useRef(null)
    const isLoadingRef = useRef(false)
    const [before, setBefore] = useState(null)
    const [tooltip, setTooltip] = useState(null)
    const { data, isLoading } = useGetStockPrices(symbol, before)

    useEffect(() => { dataRef.current = data }, [data])
    useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])

    useEffect(() => {
        if (!containerRef.current || chartRef.current) return

        const chart = createChart(containerRef.current, {
            autoSize: true,
            layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#71717a' },
            grid: { vertLines: { color: '#18181b' }, horzLines: { color: '#18181b' } },
            crosshair: { mode: 1 },
        })

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', downColor: '#ef4444',
            borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
        })

        chartRef.current = chart
        seriesRef.current = series

        chart.subscribeCrosshairMove((param) => {
            if (!param?.time || !param?.seriesData) { setTooltip(null); return }
            const candle = param.seriesData.get(series)
            if (!candle) { setTooltip(null); return }

            const full = allCandlesRef.current.find(c => c.time === param.time)
            const date = new Date(param.time * 1000).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            })

            setTooltip({
                date,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: full?.volume ?? null,
                isUp: candle.close >= candle.open,
            })
        })

        chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (range && range.from < 10 && dataRef.current?.hasMore && !isLoadingRef.current) {
                setBefore(dataRef.current.before)
            }
        })

        return () => {
            chart.remove()
            chartRef.current = null
            seriesRef.current = null
            allCandlesRef.current = []
        }
    }, [])

    useEffect(() => {
        if (!data?.candles || !seriesRef.current) return

        const newCandles = data.candles.map(c => ({
            time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume,
        }))

        const merged = [...allCandlesRef.current, ...newCandles]
        const deduped = Object.values(merged.reduce((acc, c) => ({ ...acc, [c.time]: c }), {}))
        deduped.sort((a, b) => a.time - b.time)

        allCandlesRef.current = deduped
        seriesRef.current.setData(deduped)
    }, [data])

    const fmt = (n) => n?.toLocaleString('id-ID')

    return (
        <div className="relative w-full">
            {/* Tooltip bar */}
            <div className="h-6 mb-3 flex items-center gap-4 text-xs font-mono px-1">
                {tooltip && !isSyncing ? (
                    <>
                        <span className="text-zinc-500">{tooltip.date}</span>
                        <span className="text-zinc-600">O: <span className={tooltip.isUp ? 'text-emerald-400' : 'text-red-400'}>{fmt(tooltip.open)}</span></span>
                        <span className="text-zinc-600">H: <span className={tooltip.isUp ? 'text-emerald-400' : 'text-red-400'}>{fmt(tooltip.high)}</span></span>
                        <span className="text-zinc-600">L: <span className={tooltip.isUp ? 'text-emerald-400' : 'text-red-400'}>{fmt(tooltip.low)}</span></span>
                        <span className="text-zinc-600">C: <span className={tooltip.isUp ? 'text-emerald-400' : 'text-red-400'}>{fmt(tooltip.close)}</span></span>
                        {tooltip.volume != null && (
                            <span className="text-zinc-600">Vol: <span className="text-zinc-400">{fmt(tooltip.volume)}</span></span>
                        )}
                    </>
                ) : (
                    <span className="text-zinc-700">
                        {isSyncing ? 'Syncing data...' : 'Hover candle untuk melihat detail'}
                    </span>
                )}
            </div>

            {/* Chart wrapper — overlay saat syncing */}
            <div className="relative w-full h-64">
                <div ref={containerRef} className="w-full h-full" />

                {/* Loading overlay */}
                {isSyncing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-[#09090b]/80 backdrop-blur-sm">
                        {/* Spinner */}
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
                        </div>
                        <p className="text-xs text-zinc-500 font-mono tracking-wider">Syncing price data...</p>
                        {/* Animated dots */}
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="w-1 h-1 rounded-full bg-emerald-500/60 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}