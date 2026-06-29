import { X, Sparkles, BadgeInfo, Calculator, CalendarRange, TrendingUp, TrendingDown, Layers, DollarSign } from 'lucide-react'

const metricNames = {
  G: 'Growth',
  R: 'Relative Strength',
  O: 'Trend',
  V: 'Valuation',
  E: 'Endorsement'
}

const metricColors = {
  G: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  R: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  O: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  V: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  E: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
}

const formatBigNumber = (val) => {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (Number.isNaN(num)) return val
  return num.toLocaleString('id-ID')
}

const formatEPS = (val) => {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (Number.isNaN(num)) return val
  return Number(num.toFixed(2))
}

export default function GroveScoreBreakdownModal({ companyName, symbol, companyLogoUrl, metric, data, onClose }) {
  const metricName = metricNames[metric] || metric
  const colorClasses = metricColors[metric] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'

  const scoreVal = data?.score
  const maxScoreVal = data?.maxScore
  const isImplemented = data?.status !== 'not_implemented' && data?.details

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in -top-[2rem]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-[800px] h-full bg-[#09090b] border-l border-zinc-900 flex flex-col shadow-2xl text-sm text-zinc-300 animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-zinc-900 bg-[#0c0c0e] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt={companyName} className="w-full h-full object-contain p-1" />
              ) : (
                <div className="font-bold text-zinc-500 text-xs">{symbol?.slice(0, 2)}</div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-100 text-base tracking-tight">{symbol}</span>
                <span className="text-zinc-600 text-xs">/</span>
                <span className="text-zinc-400 text-xs truncate max-w-[250px]">{companyName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClasses}`}>
                  <Sparkles className="w-3 h-3" />
                  {metricName} ({metric})
                </span>
                {isImplemented && (
                  <span className="text-[11px] font-mono font-medium text-zinc-500">
                    Score: <span className="text-zinc-200 font-bold">{scoreVal}</span>/{maxScoreVal}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!isImplemented ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <BadgeInfo className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-zinc-300 text-sm">Not Implemented Yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  The {metricName} scoring algorithm breakdown is currently under development or not evaluated for this asset.
                </p>
              </div>
              {data?.status && (
                <span className="inline-block bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500">
                  status: {data.status}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score Banner */}
              <div className="p-4 rounded-xl border border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Metric Performance</span>
                  <span className="text-xs text-zinc-400">Total accumulated score under the {metricName} metric category.</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-zinc-900/50 border border-zinc-800/40 w-16 h-16 rounded-xl">
                  <span className="text-2xl font-black text-emerald-400 tracking-tight leading-none">{scoreVal}</span>
                  <span className="text-[10px] text-zinc-600 font-mono mt-1">/ {maxScoreVal}</span>
                </div>
              </div>

              {/* Sub-metrics breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sub-Metrics Details</h3>

                {Object.entries(data.details || {})
                  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                  .map(([subKey, subData]) => {
                    const hasItems = Array.isArray(subData.items) && subData.items.length > 0
                    const hasSourcePeriods = Array.isArray(subData.sourcePeriods) && subData.sourcePeriods.length > 0

                    return (
                      <div key={subKey} className="bg-[#0c0c0e] border border-zinc-900 hover:border-zinc-800/80 rounded-xl p-4 transition-all duration-200 space-y-4">
                        {/* Sub-metric header */}
                        <div className="flex items-start justify-between gap-3 border-b border-zinc-900 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                {subKey.toUpperCase()}
                              </span>
                              <h4 className="font-bold text-zinc-200 text-[13px] tracking-tight">{subData.name}</h4>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-mono mt-1.5 leading-normal bg-zinc-900/50 border border-zinc-900 p-2 rounded-lg">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Rule Definition:</span>
                              {subData.rule}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold text-zinc-100">{subData.score}</span>
                            <span className="text-zinc-600 text-xs"> / {subData.maxScore}</span>
                          </div>
                        </div>

                        {/* Calculations & Formulas */}
                        <div className="grid grid-cols-1 gap-3.5 text-xs">
                          {/* Formula block */}
                          {subData.formula && (
                            <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900 flex items-start gap-2">
                              <Calculator className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Calculated Formula</span>
                                <span className="font-mono text-zinc-300 text-[11px] select-all bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900/50">{subData.formula}</span>
                              </div>
                            </div>
                          )}

                          {/* Specific stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {subData.growthPct !== undefined && subData.growthPct !== null && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Growth Rate</span>
                                <span className={`font-mono text-sm font-bold block mt-0.5 ${subData.growthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {subData.growthPct > 0 ? '+' : ''}{Number(subData.growthPct).toFixed(2)}%
                                </span>
                              </div>
                            )}
                            

                            {subData.roePct !== undefined && subData.roePct !== null && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">ROE Percentage</span>
                                <span className="font-mono text-sm font-bold text-emerald-400 block mt-0.5">
                                  {Number(subData.roePct).toFixed(2)}%
                                </span>
                              </div>
                            )}

                            {subData.netIncome !== undefined && subData.netIncome !== null && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Net Income</span>
                                <span className="font-mono text-[11px] font-medium text-zinc-300 block mt-0.5 truncate" title={formatBigNumber(subData.netIncome)}>
                                  {formatBigNumber(subData.netIncome)}
                                </span>
                              </div>
                            )}

                            {subData.totalEquity !== undefined && subData.totalEquity !== null && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Equity</span>
                                <span className="font-mono text-[11px] font-medium text-zinc-300 block mt-0.5 truncate" title={formatBigNumber(subData.totalEquity)}>
                                  {formatBigNumber(subData.totalEquity)}
                                </span>
                              </div>
                            )}

                            {subData.latestYear && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Evaluation Year</span>
                                <span className="font-mono text-[11px] font-medium text-zinc-300 block mt-0.5">
                                  {subData.latestYear}
                                </span>
                              </div>
                            )}

                            {subData.forecastYear && (
                              <div className="p-2.5 bg-zinc-900/30 rounded-lg border border-zinc-900">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Forecast Year</span>
                                <span className="font-mono text-[11px] font-medium text-zinc-300 block mt-0.5">
                                  {subData.forecastYear} {subData.latestQuarter ? `(Q${subData.latestQuarter} TTM)` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items Table (For historical year consistency G1) */}
                        {hasItems && (
                          <div className="mt-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                              <CalendarRange className="w-3.5 h-3.5 text-zinc-600" />
                              Historical Evaluation Period
                            </span>
                            <div className="overflow-hidden border border-zinc-900 rounded-lg bg-zinc-950/20">
                              <table className="w-full border-collapse text-left text-xs">
                                <thead className="bg-zinc-900/40 border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase">
                                  <tr>
                                    <th className="px-3 py-2 font-medium">Comparison Period</th>
                                    <th className="px-3 py-2 text-right font-medium">Curr EPS</th>
                                    <th className="px-3 py-2 text-right font-medium">Prev EPS</th>
                                    <th className="px-3 py-2 text-right font-medium">Growth</th>
                                    <th className="px-3 py-2 font-medium pl-4">Formula</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900 text-zinc-300 font-mono text-[11px]">
                                  {subData.items.map((it, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                                      <td className="px-3 py-2 text-zinc-400">{it.currentYear} vs {it.previousYear}</td>
                                      <td className="px-3 py-2 text-right font-semibold text-zinc-200">{formatEPS(it.totalEPS)}</td>
                                      <td className="px-3 py-2 text-right text-zinc-400">{formatEPS(it.previousTotalEPS)}</td>
                                      <td className={`px-3 py-2 text-right font-bold ${it.growthPct > 15 ? 'text-emerald-400' : it.growthPct > 0 ? 'text-emerald-500/70' : 'text-rose-400'}`}>
                                        {it.growthPct > 0 ? '+' : ''}{Number(it.growthPct).toFixed(1)}%
                                      </td>
                                      <td className="px-3 py-2 text-[10px] text-zinc-500 max-w-[200px] truncate pl-4" title={it.formula}>{it.formula}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Source Periods Table (For expectations TTM details G3/G4) */}
                        {hasSourcePeriods && (
                          <div className="mt-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                              <Layers className="w-3.5 h-3.5 text-zinc-600" />
                              Period Values breakdown (TTM Calculation)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {subData.sourcePeriods.map((sp, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-zinc-900/80 bg-zinc-950/20 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-zinc-400">Q{sp.fiscalQuarter} {sp.fiscalYear}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded uppercase ${sp.source === 'actual' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/5' : 'bg-amber-500/10 text-amber-400 border border-amber-500/5'}`}>
                                      {sp.source}
                                    </span>
                                  </div>
                                  <div className="font-mono font-semibold text-zinc-200 text-[11px]">
                                    {isNaN(Number(sp.value)) ? sp.value : Number(sp.value).toLocaleString('id-ID')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
