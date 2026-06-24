import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, LineChart, Database, BarChart3 } from 'lucide-react'
import { useGetListingDetail, useSyncStockPrice } from '@/hooks/useListings'
import { useGetIncomeStatementsByCompany, useSyncIncomeStatements } from '@/hooks/useIncomeStatements'
import { useGetBalanceSheetsByCompany, useSyncBalanceSheets } from '@/hooks/useBalanceSheets'
import { useGetCashFlowsByCompany } from '@/hooks/useCashFlows'
import { useFormStore } from '@/store/useFormStore'
import { formatAbbreviated, formatCurrency } from '@/utils/formatters'
import ActionMenu from '@/components/ui/ActionMenu'
import StockChart from '../dashboard/StockChart'


const INCOME_STATEMENT_FIELDS = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'netIncome', label: 'Net Income (Pemilik Entitas Induk)' },
    { key: 'eps', label: 'EPS (Quarter)' },
]


const BALANCE_SHEET_FIELDS = [
    // { key: 'cash', label: 'Total Cash' },
    { key: 'totalAssets', label: 'Total Assets' },
    { key: 'totalEquity', label: 'Total Equity' },
    { key: 'totalLiabilities', label: 'Total Liabilities' },
]

const CASH_FLOW_FIELDS = [
    { key: 'netIncomeStart', label: 'Net Income (Start)' },
    { key: 'depreciationAmort', label: 'Depreciation & Amortization' },
    { key: 'stockBasedCompensation', label: 'Stock Based Compensation' },
    { key: 'changeInWorkingCapital', label: 'Change In Working Capital' },
    { key: 'changeInReceivables', label: 'Change In Receivables' },
    { key: 'changeInInventory', label: 'Change In Inventory' },
    { key: 'changeInPayables', label: 'Change In Payables' },
    { key: 'otherOperatingActivities', label: 'Other Operating Activities' },
    { key: 'netCashFromOperations', label: 'Net Cash From Operations' },
    { key: 'capitalExpenditures', label: 'Capital Expenditures' },
    { key: 'acquisitions', label: 'Acquisitions' },
    { key: 'purchaseOfInvestments', label: 'Purchase Of Investments' },
    { key: 'saleOfInvestments', label: 'Sale Of Investments' },
    { key: 'otherInvestingActivities', label: 'Other Investing Activities' },
    { key: 'netCashFromInvesting', label: 'Net Cash From Investing' },
    { key: 'debtIssuance', label: 'Debt Issuance' },
    { key: 'debtRepayment', label: 'Debt Repayment' },
    { key: 'commonStockIssuance', label: 'Common Stock Issuance' },
    { key: 'commonStockRepurchase', label: 'Common Stock Repurchase' },
    { key: 'dividendsPaid', label: 'Dividends Paid' },
    { key: 'otherFinancingActivities', label: 'Other Financing Activities' },
    { key: 'netCashFromFinancing', label: 'Net Cash From Financing' },
    { key: 'netChangeInCash', label: 'Net Change In Cash' },
    { key: 'cashBeginningPeriod', label: 'Cash Beginning Period' },
    { key: 'cashEndPeriod', label: 'Cash End Period' },
    { key: 'freeCashFlow', label: 'Free Cash Flow' },
]

const sortStatements = (statements) => {
    if (!Array.isArray(statements)) return [];
    return [...statements].sort((a, b) => {
        if (a.fiscalYear !== b.fiscalYear) {
            return b.fiscalYear - a.fiscalYear;
        }
        const periodOrder = { 'FY': 5, 'ANNUAL': 5, 'Q4': 4, 'Q3': 3, 'Q2': 2, 'Q1': 1 };
        const orderA = periodOrder[a.period] || 0;
        const orderB = periodOrder[b.period] || 0;
        return orderB - orderA;
    });
}

const formatFinancialValue = (key, value, currency = 'IDR') => {
    if (value === null || value === undefined) return '-';

    const numValue = Number(value);
    if (isNaN(numValue)) return value;

    if (key.toLowerCase().includes('growth') || key.toLowerCase().includes('rate')) {
        return `${numValue.toFixed(2)}%`;
    }

    if (key === 'eps' || key === 'epsDiluted') {
        return numValue.toFixed(2);
    }

    if (key === 'sharesWeightedAvg') {
        return formatAbbreviated(value);
    }

    return formatAbbreviated(value);
}

const getFullTooltipValue = (key, value, currency = 'IDR') => {
    if (value === null || value === undefined) return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);

    if (key.toLowerCase().includes('growth') || key.toLowerCase().includes('rate')) {
        return `${numValue.toFixed(2)}%`;
    }

    if (key === 'eps' || key === 'epsDiluted') {
        return numValue.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (key === 'sharesWeightedAvg') {
        return numValue.toLocaleString('id-ID');
    }

    const formatter = new Intl.NumberFormat(
        currency === 'IDR' ? 'id-ID' : 'en-US',
        {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
    return formatter.format(numValue);
}

const renderLabel = (label) => {
    const match = label.match(/^(.*?)\s*(\(.*\))$/)
    if (match) {
        return (
            <div className="flex flex-col leading-tight text-left">
                <span>{match[1]}</span>
                <span className="text-[10px] text-zinc-500 font-normal mt-0.5">{match[2]}</span>
            </div>
        )
    }
    return <span>{label}</span>
}

export default function ListingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const showToast = useFormStore((state) => state.showToast)
    const [selectedStatement, setSelectedStatement] = useState('income')
    const [chartKey, setChartKey] = useState(0)

    const { data: listing, isLoading } = useGetListingDetail(id)

    const {
        data: incomeStatements = [],
        isFetching: isFetchingIncome,
        refetch: refetchIncome,
    } = useGetIncomeStatementsByCompany(listing?.company?.id)

    const {
        data: balanceSheets = [],
        isFetching: isFetchingBalance,
        refetch: refetchBalance,
    } = useGetBalanceSheetsByCompany(listing?.company?.id)

    const {
        data: cashFlows = [],
        isFetching: isFetchingCashFlow,
        refetch: refetchCashFlow,
    } = useGetCashFlowsByCompany(listing?.company?.id)

    const listingSectorId = listing?.sectorId || listing?.sector?.id || listing?.company?.sectorId || listing?.company?.sector?.id

    const syncPriceMutation = useSyncStockPrice(id, listing?.symbol)
    const syncIncomeStatementMutation = useSyncIncomeStatements(id, listing?.company?.id)
    const syncBalanceSheetMutation = useSyncBalanceSheets(id, listingSectorId)

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
                await refetchIncome()
                showToast('Income statement synchronized successfully', 'success')
            },
            onError: () => showToast('Failed to sync income statement', 'error'),
        })
    }

    const handleSyncBalanceSheets = () => {
        syncBalanceSheetMutation.mutate(null, {
            onSuccess: async () => {
                await refetchBalance()
                showToast('Balance sheet synchronized successfully', 'success')
            },
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
    const isFinancialOverviewLoading = isSyncingIncomeStatement || isSyncingBalanceSheet || isFetchingIncome || isFetchingBalance || isFetchingCashFlow

    const activeStatements = (selectedStatement === 'income'
        ? incomeStatements
        : selectedStatement === 'balance'
            ? balanceSheets
            : cashFlows
    ).filter((s) => s.period !== 'ANNUAL' && s.period !== 'FY')


    const activeFields = selectedStatement === 'income'
        ? INCOME_STATEMENT_FIELDS
        : selectedStatement === 'balance'
            ? BALANCE_SHEET_FIELDS
            : CASH_FLOW_FIELDS

    const sortedData = sortStatements(activeStatements)

    const syncDescription = isSyncingIncomeStatement
        ? 'Scraping latest income statement data...'
        : isSyncingBalanceSheet
            ? 'Scraping latest balance sheet data...'
            : 'Refreshing synchronized results...'

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

            <div className="relative rounded-xl border border-zinc-900 bg-[#09090b] p-6 shadow-xl">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Database className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Financial Reports</h3>
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-inner">
                        {[
                            { id: 'income', label: 'Income Statement' },
                            { id: 'balance', label: 'Balance Sheet' },
                            { id: 'cashflow', label: 'Cash Flow' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedStatement(tab.id)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${selectedStatement === tab.id
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                                    : 'text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-900/40'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {sortedData.length === 0 ? (
                    <div className="py-10 text-center text-zinc-500 font-mono text-xs">
                        No financial data available. Use "Sync Financials" to import.
                    </div>
                ) : (
                    <div
                        key={selectedStatement}
                        className={`overflow-x-auto pb-2 animate-fade-in transition-opacity duration-300 ${isFinancialOverviewLoading ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <table className="w-full border-collapse text-xs font-mono text-zinc-400">
                            <thead>
                                <tr className="border-b border-zinc-900 text-left text-zinc-500">
                                    <th className="sticky left-0 z-10 bg-[#09090b] py-3 text-zinc-400 font-bold border-r border-zinc-900/40 pr-6 text-left whitespace-nowrap">Line Item</th>
                                    {sortedData.map((statement) => (
                                        <th key={statement.id} className="px-6 py-3 text-right font-bold text-zinc-400">
                                            <div className="text-xs font-semibold text-zinc-300">{statement.fiscalYear} {statement.period}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activeFields.map((field) => (
                                    <tr key={field.key} className="border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-colors duration-250 group">
                                        <td className="sticky left-0 z-10 bg-[#09090b] py-3.5 pr-6 font-medium text-zinc-400 border-r border-zinc-900/40 transition-colors group-hover:text-zinc-200 whitespace-nowrap">
                                            {renderLabel(field.label)}
                                        </td>
                                        {sortedData.map((statement) => {
                                            const rawValue = statement[field.key];
                                            const formatted = formatFinancialValue(field.key, rawValue, statement.currency);
                                            const tooltip = getFullTooltipValue(field.key, rawValue, statement.currency);

                                            const numVal = Number(rawValue);
                                            const isNegative = rawValue !== null && rawValue !== undefined && !isNaN(numVal) && numVal < 0;
                                            const isZeroOrNull = rawValue === null || rawValue === undefined || (!isNaN(numVal) && numVal === 0);

                                            return (
                                                <td
                                                    key={statement.id}
                                                    className={`whitespace-nowrap px-6 py-3.5 text-right font-mono text-xs cursor-help transition-colors ${isZeroOrNull
                                                        ? 'text-zinc-600'
                                                        : isNegative
                                                            ? 'text-rose-400/90 font-medium'
                                                            : 'text-zinc-300 group-hover:text-zinc-100'
                                                        }`}
                                                    title={tooltip || undefined}
                                                >
                                                    {formatted}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
                                        <p className="text-sm font-semibold text-zinc-100">Updating Financial Reports</p>
                                        <p className="text-xs text-zinc-500">
                                            {syncDescription}
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
    )
}
