import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, LineChart, Database, BarChart3 } from 'lucide-react'
import { useGetListingDetail, useSyncStockPrice } from '@/hooks/useListings'
import { useGetIncomeStatementsByCompany, useSyncIncomeStatements } from '@/hooks/useIncomeStatements'
import { useSyncBalanceSheets } from '@/hooks/useBalanceSheets'
import { useFormStore } from '@/store/useFormStore'
import { formatAbbreviated } from '@/utils/formatters'
import ActionMenu from '@/components/ui/ActionMenu'
import StockChart from '../dashboard/StockChart'

export default function ListingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const showToast = useFormStore((state) => state.showToast)
    const [activeTab, setActiveTab] = useState('Net Income')
    const [chartKey, setChartKey] = useState(0)

    const { data: listing, isLoading } = useGetListingDetail(id)
    const {
        data: financials = [],
        isFetching: isFetchingFinancials,
        refetch: refetchFinancials,
    } = useGetIncomeStatementsByCompany(listing?.company?.id)
    const listingSectorId = listing?.sectorId || listing?.sector?.id || listing?.company?.sectorId || listing?.company?.sector?.id

    const syncPriceMutation = useSyncStockPrice(id, listing?.symbol)
    const syncIncomeStatementMutation = useSyncIncomeStatements(id, listing?.company?.id)
    const syncBalanceSheetMutation = useSyncBalanceSheets(id, listingSectorId)

    const years = useMemo(() => {
        return [...new Set(financials.map((financial) => financial.fiscalYear))].sort((a, b) => b - a)
    }, [financials])

    const handleSyncPrice = () => {
        syncPriceMutation.mutate(null, {
            onSuccess: () => {
                showToast('Stock price synchronized successfully', 'success')
                setChartKey((currentKey) => currentKey + 1)
            },
            onError: () => showToast('Failed to sync price', 'error'),
        })
    }

    const handleSyncIncomeStatements = () => {
        syncIncomeStatementMutation.mutate(null, {
            onSuccess: async () => {
                await refetchFinancials()
                showToast('Income statement synchronized successfully', 'success')
            },
            onError: () => showToast('Failed to sync income statement', 'error'),
        })
    }

    const handleSyncBalanceSheets = () => {
        syncBalanceSheetMutation.mutate(null, {
            onSuccess: () => showToast('Balance sheet synchronized successfully', 'success'),
            onError: () => showToast('Failed to sync balance sheet', 'error'),
        })
    }

    if (isLoading || !listing) {
        return (
            <div className="p-10 text-center text-zinc-500 font-mono">Loading...</div>
        )
    }

    const isSyncingPrice = syncPriceMutation.isPending
    const isSyncingIncomeStatement = syncIncomeStatementMutation.isPending
    const isSyncingBalanceSheet = syncBalanceSheetMutation.isPending
    const isFinancialOverviewLoading = isSyncingIncomeStatement || isFetchingFinancials
    const actionButtonClassName = (isSyncing) => `
        relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2
        text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300
        ${isSyncing
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/40 cursor-not-allowed'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-400'
        }
    `

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in pb-12 text-sm text-zinc-300">
            <div className="mb-6 flex flex-wrap items-start gap-4 border-b border-zinc-900 pb-5">
                <button
                    onClick={() => navigate('/dashboard/listings')}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                        {listing.company?.logoUrl
                            ? <img src={listing.company.logoUrl} className="h-full w-full object-contain p-1" />
                            : <BarChart3 className="h-5 w-5 text-zinc-600" />}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold tracking-tight text-zinc-100">{listing.company?.displayName}</h1>
                        <p className="truncate text-xs font-mono text-zinc-500">{listing.symbol} - {listing.exchange?.name}</p>
                    </div>
                </div>

                <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <ActionMenu
                        label="Sync Financials"
                        items={[
                            {
                                label: 'Sync Income Statement',
                                description: 'Refresh the latest income statement records.',
                                pendingLabel: 'Syncing income statement...',
                                isPending: isSyncingIncomeStatement,
                                icon: <RefreshCw className="h-3.5 w-3.5" />,
                                onClick: handleSyncIncomeStatements,
                            },
                            {
                                label: 'Sync Balance Sheet',
                                description: 'Refresh the latest balance sheet records.',
                                pendingLabel: 'Syncing balance sheet...',
                                isPending: isSyncingBalanceSheet,
                                icon: <RefreshCw className="h-3.5 w-3.5" />,
                                onClick: handleSyncBalanceSheets,
                            },
                        ]}
                    />

                    <button
                        onClick={handleSyncPrice}
                        disabled={isSyncingPrice}
                        className={actionButtonClassName(isSyncingPrice)}
                    >
                        {isSyncingPrice && (
                            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
                        )}
                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncingPrice ? 'animate-spin text-emerald-500/40' : ''}`} />
                        {isSyncingPrice ? 'Syncing...' : 'Sync Price'}
                    </button>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-zinc-900 bg-[#09090b] p-6">
                <div className="mb-4 flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Price Analytics</h3>
                </div>
                <StockChart key={chartKey} symbol={listing.symbol} isSyncing={isSyncingPrice} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="space-y-4 rounded-xl border border-zinc-900 bg-[#09090b] p-6">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Key Statistics</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-zinc-900 pb-2">
                                <span className="text-xs text-zinc-500">Asset Type</span>
                                <span className="text-xs font-mono text-zinc-200">{listing.assetType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-zinc-500">Exchange</span>
                                <span className="text-xs font-mono text-zinc-200">{listing.exchange?.code}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="relative rounded-xl border border-zinc-900 bg-[#09090b] p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Financial Overview</h3>
                            <div className="flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900/50 p-1">
                                {['Net Income', 'EPS', 'Revenue'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${activeTab === tab ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={`overflow-x-auto pb-2 transition-opacity duration-300 ${isFinancialOverviewLoading ? 'opacity-30' : 'opacity-100'}`}>
                            <table className="w-full border-collapse text-xs font-mono text-zinc-400">
                                <thead>
                                    <tr className="border-b border-zinc-900 text-left text-zinc-500">
                                        <th className="sticky left-0 z-10 w-32 bg-[#09090b] py-3">Period</th>
                                        {years.map((year) => <th key={year} className="px-6 py-3 text-right">{year}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                                        <tr key={quarter} className="border-b border-zinc-900/40">
                                            <td className="sticky left-0 z-10 bg-[#09090b] py-3 font-medium text-zinc-300">{quarter}</td>
                                            {years.map((year) => {
                                                const data = financials.find((financial) => financial.fiscalYear === year && financial.period === quarter)
                                                const value = activeTab === 'Net Income'
                                                    ? data?.netIncome
                                                    : activeTab === 'Revenue'
                                                        ? data?.revenue
                                                        : data?.eps

                                                return (
                                                    <td key={year} className="whitespace-nowrap px-6 py-3 text-right text-zinc-200">
                                                        {value ? (activeTab === 'EPS' ? value : formatAbbreviated(value)) : '-'}  
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {isFinancialOverviewLoading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#09090b]/78 backdrop-blur-sm">
                                <div className="w-full max-w-md px-6">
                                    <div className="rounded-2xl border border-emerald-500/10 bg-zinc-950/90 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                                <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" />
                                                <RefreshCw className="relative h-4 w-4 animate-spin text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-100">Updating Financial Overview</p>
                                                <p className="text-xs text-zinc-500">
                                                    {isSyncingIncomeStatement ? 'Scraping latest income statement data...' : 'Refreshing synchronized results...'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-3 h-2 overflow-hidden rounded-full bg-zinc-900">
                                            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20 animate-[shimmer_1.4s_infinite]" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {[...Array(3)].map((_, index) => (
                                                <div key={index} className="space-y-2 rounded-xl border border-zinc-900 bg-zinc-900/80 p-3">
                                                    <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-800" />
                                                    <div className="h-4 w-full animate-pulse rounded bg-zinc-800/90" />
                                                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800/70" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
