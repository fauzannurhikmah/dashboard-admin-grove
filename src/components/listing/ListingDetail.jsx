import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, LineChart, Database, BarChart3 } from 'lucide-react'
import { useGetListingDetail, useSyncStockPrice } from '@/hooks/useListings'
import { useGetIncomeStatementsByCompany } from '@/hooks/useIncomeStatements'
import { useFormStore } from '@/store/useFormStore'
import { formatAbbreviated } from '@/utils/formatters'
import StockChart from '../dashboard/StockChart'

export default function ListingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const showToast = useFormStore((state) => state.showToast)
    const [activeTab, setActiveTab] = useState('Net Income')
    const [chartKey, setChartKey] = useState(0)

    const { data: listing, isLoading } = useGetListingDetail(id)
    const { data: financials = [] } = useGetIncomeStatementsByCompany(listing?.company?.id)

    // Kirim symbol supaya hook bisa invalidate query stock-prices yg tepat
    const syncMutation = useSyncStockPrice(id, listing?.symbol)

    const years = useMemo(() => {
        return [...new Set(financials.map(f => f.fiscalYear))].sort((a, b) => b - a)
    }, [financials])

    const handleSync = () => {
        syncMutation.mutate(null, {
            onSuccess: () => {
                showToast('Stock price synchronized successfully', 'success')
                // Remount chart → reset before & allCandlesRef, fetch dari awal dgn cache yg sudah bersih
                setChartKey(k => k + 1)
            },
            onError: () => showToast('Failed to sync price', 'error'),
        })
    }

    if (isLoading || !listing) return (
        <div className="p-10 text-center text-zinc-500 font-mono">Loading...</div>
    )

    const isSyncing = syncMutation.isPending

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in text-sm text-zinc-300 pb-12">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-5 mb-6">
                <button
                    onClick={() => navigate('/dashboard/listings')}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {listing.company?.logoUrl
                            ? <img src={listing.company.logoUrl} className="w-full h-full object-contain p-1" />
                            : <BarChart3 className="w-5 h-5 text-zinc-600" />}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{listing.company?.displayName}</h1>
                        <p className="text-zinc-500 text-xs font-mono">{listing.symbol} • {listing.exchange?.name}</p>
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`
                        ml-auto relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold
                        border transition-all duration-300 overflow-hidden
                        ${isSyncing
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/40 cursor-not-allowed'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5'
                        }
                    `}
                >
                    {isSyncing && (
                        <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
                    )}
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500/40' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Price'}
                </button>
            </div>

            <div className="p-6 bg-[#09090b] border border-zinc-900 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <LineChart className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Price Analytics</h3>
                </div>
                <StockChart key={chartKey} symbol={listing.symbol} isSyncing={isSyncing} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="p-6 bg-[#09090b] border border-zinc-900 rounded-xl space-y-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Key Statistics</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-zinc-900 pb-2">
                                <span className="text-zinc-500 text-xs">Asset Type</span>
                                <span className="text-zinc-200 text-xs font-mono">{listing.assetType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500 text-xs">Exchange</span>
                                <span className="text-zinc-200 text-xs font-mono">{listing.exchange?.code}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="p-6 bg-[#09090b] border border-zinc-900 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Financial Overview</h3>
                            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-full border border-zinc-900">
                                {['Net Income', 'EPS', 'Revenue'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full text-xs font-mono text-zinc-400 border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-900 text-zinc-500 text-left">
                                        <th className="py-3 sticky left-0 bg-[#09090b] z-10 w-32">Period</th>
                                        {years.map(y => <th key={y} className="text-right py-3 px-6">{y}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                                        <tr key={q} className="border-b border-zinc-900/40">
                                            <td className="py-3 sticky left-0 bg-[#09090b] font-medium text-zinc-300 z-10">{q}</td>
                                            {years.map(y => {
                                                const data = financials.find(f => f.fiscalYear === y && f.period === q)
                                                const val = activeTab === 'Net Income' ? data?.netIncome : activeTab === 'Revenue' ? data?.revenue : data?.eps
                                                return (
                                                    <td key={y} className="text-right py-3 px-6 text-zinc-200 whitespace-nowrap">
                                                        {val ? formatAbbreviated(val) : '-'}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}