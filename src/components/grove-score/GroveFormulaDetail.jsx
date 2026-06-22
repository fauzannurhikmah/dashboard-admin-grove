import { useMemo } from 'react'
import { X, Sparkles, BadgeInfo, Activity, Hash, CalendarRange, ShieldCheck } from 'lucide-react'
import { useGetGroveFormulaDetail } from '@/hooks/useGroveFormulas'

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(date)
}

export default function GroveFormulaDetail({ id, onClose }) {
  const { data, isLoading, isError, error } = useGetGroveFormulaDetail(id)

  const rulesByMetric = useMemo(() => {
    const grouped = new Map()
    const rules = Array.isArray(data?.rules) ? data.rules : []

    rules
      .slice()
      .sort((a, b) => {
        const metricA = a.metric || ''
        const metricB = b.metric || ''
        if (metricA !== metricB) return metricA.localeCompare(metricB)
        return Number(b.score ?? 0) - Number(a.score ?? 0)
      })
      .forEach((rule) => {
        const metric = rule.metric || 'UNKNOWN'
        if (!grouped.has(metric)) grouped.set(metric, [])
        grouped.get(metric).push(rule)
      })

    return grouped
  }, [data?.rules])

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[760px] h-full bg-[#09090b] border-l border-zinc-900 flex flex-col shadow-2xl text-sm text-zinc-300">
        <div className="p-5 border-b border-zinc-900 bg-[#0c0c0e] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-zinc-100 tracking-tight truncate">Grove Formula Registry</h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">{id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
            Loading Grove formula rules...
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-sm space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Failed to load
              </div>
              <p className="text-sm text-zinc-300">
                {error?.response?.data?.message || error.message || 'Unable to fetch formula detail.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Formula</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-400 tracking-tight">
                        {data?.formula?.code || '—'}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                        data?.formula?.isActive
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                      }`}>
                        {data?.formula?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-200 font-medium">{data?.formula?.description || '—'}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <BadgeInfo className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-900">
                    <div className="text-zinc-500 flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      Formula ID
                    </div>
                    <div className="font-mono text-zinc-300 mt-1 break-all">{data?.formula?.id || '—'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-900">
                    <div className="text-zinc-500 flex items-center gap-1.5">
                      <Activity className="w-3 h-3" />
                      Rules Count
                    </div>
                    <div className="font-semibold text-zinc-200 mt-1">{Array.isArray(data?.rules) ? data.rules.length : 0}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-900">
                    <div className="text-zinc-500 flex items-center gap-1.5">
                      <CalendarRange className="w-3 h-3" />
                      Created
                    </div>
                    <div className="font-mono text-zinc-300 mt-1 text-[11px] leading-relaxed">{formatDateTime(data?.formula?.createdAt)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-900">
                    <div className="text-zinc-500 flex items-center gap-1.5">
                      <CalendarRange className="w-3 h-3" />
                      Updated
                    </div>
                    <div className="font-mono text-zinc-300 mt-1 text-[11px] leading-relaxed">{formatDateTime(data?.formula?.updatedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-3">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rules Overview</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-900/70">
                    <span className="text-zinc-500">Code</span>
                    <span className="font-semibold text-zinc-200">{data?.formula?.code || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-900/70">
                    <span className="text-zinc-500">Description</span>
                    <span className="font-semibold text-zinc-200 text-right max-w-[60%]">{data?.formula?.description || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-900/70">
                    <span className="text-zinc-500">Status</span>
                    <span className={`font-semibold ${data?.formula?.isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {data?.formula?.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-500">Metric Groups</span>
                    <span className="font-semibold text-zinc-200">{rulesByMetric.size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">Scoring Rules</h3>
              </div>

              {rulesByMetric.size > 0 ? (
                Array.from(rulesByMetric.entries()).map(([metric, rules]) => (
                  <div key={metric} className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Metric</div>
                        <div className="text-sm font-semibold text-zinc-100">{metric}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                        {rules.length} rules
                      </span>
                    </div>

                    <div className="space-y-2">
                      {rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-[#09090b] border border-zinc-900/80"
                        >
                          <div className="w-14 shrink-0 text-center rounded-md bg-zinc-950 border border-zinc-900 px-2 py-1">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Score</div>
                            <div className="text-base font-black text-emerald-400 leading-tight">{rule.score}</div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              <span>{rule.pillar}</span>
                              <span className="text-zinc-700">•</span>
                              <span>{rule.metric}</span>
                            </div>
                            <p className="text-sm text-zinc-200 mt-1 leading-relaxed">{rule.description}</p>
                            <p className="text-[10px] font-mono text-zinc-600 mt-2">{formatDateTime(rule.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl border border-zinc-900 bg-[#0c0c0e] text-center text-xs text-zinc-500 font-mono">
                  No rules returned by backend.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
