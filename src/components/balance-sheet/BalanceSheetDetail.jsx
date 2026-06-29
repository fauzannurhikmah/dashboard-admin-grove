import { X, Wallet, TrendingUp, Landmark, ShieldCheck } from 'lucide-react'
import { useGetBalanceSheetDetail } from '@/hooks/useBalanceSheets'
import { formatCurrency } from '@/utils/formatters'

export default function BalanceSheetDetail({ id, onClose }) {
    const { data: sheet, isLoading } = useGetBalanceSheetDetail(id)

    const renderDataRow = (label, value, currency = 'IDR') => (
        <div className="flex items-center justify-between py-2 border-b border-zinc-900/40 text-xs">
            <span className="text-zinc-500 font-medium">{label}</span>
            <span className="font-mono text-zinc-300 font-semibold">
                {value !== null && value !== undefined ? formatCurrency(value, currency) : '—'}
            </span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in -top-[2rem]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[500px] h-full bg-[#09090b] border-l border-zinc-900 flex flex-col shadow-2xl text-sm text-zinc-300">

                <div className="p-5 border-b border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-bold text-zinc-100 tracking-tight">Ledger Balance Sheet Registry</h2>
                            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
                        Compiling solvency registry metrics...
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">

                        <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-3">
                            <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-900">
                                <div className="w-7 h-7 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden">
                                    {sheet?.company?.logoUrl ? (
                                        <img src={sheet.company.logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                                    ) : (
                                        <Wallet className="w-3.5 h-3.5 text-zinc-600" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-200 text-xs">{sheet?.company?.displayName || 'Unknown Corporate'}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[300px]">{sheet?.company?.legalName || '—'}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-zinc-500 block">Filing Period Combo</span>
                                    <span className="font-medium text-zinc-300 flex items-center gap-1.5 mt-0.5">
                                        FY {sheet?.fiscalYear}
                                        <span className="text-[10px] px-1 rounded bg-zinc-950 border border-zinc-900 font-mono text-zinc-400">{sheet?.period}</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Filing Closing Date</span>
                                    <span className="font-mono text-zinc-400 mt-0.5 block">{sheet?.periodEndDate ? sheet.periodEndDate.split('T')[0] : '—'}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">System Currency</span>
                                    <span className="font-mono text-zinc-400 mt-0.5 block">{sheet?.currency}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Audit Ledger Status</span>
                                    <span className="text-emerald-400 font-semibold text-[10px] mt-0.5 block tracking-wider uppercase">{sheet?.auditStatus || 'UNAUDITED'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">1. Assets Structural Components</h3>
                            </div>
                            {renderDataRow('Cash & Equivalents', sheet?.cash, sheet?.currency)}
                            {renderDataRow('Short-Term Investments', sheet?.shortTermInvestments, sheet?.currency)}
                            {renderDataRow('Accounts Receivable', sheet?.accountsReceivable, sheet?.currency)}
                            {renderDataRow('Inventory Valuation', sheet?.inventory, sheet?.currency)}
                            {renderDataRow('Other Current Assets', sheet?.otherCurrentAssets, sheet?.currency)}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-900/60 font-mono text-xs font-semibold bg-zinc-950/20 px-2 rounded">
                                <span className="text-zinc-400">Total Current Assets</span>
                                <span className="text-zinc-200">{formatCurrency(sheet?.totalCurrentAssets, sheet?.currency)}</span>
                            </div>
                            {renderDataRow('Property, Plant & Equipment (PP&E)', sheet?.propertyPlantEquipment, sheet?.currency)}
                            {renderDataRow('Intangible Assets', sheet?.intangibleAssets, sheet?.currency)}
                            {renderDataRow('Goodwill Value', sheet?.goodwill, sheet?.currency)}
                            {renderDataRow('Long-Term Investments', sheet?.longTermInvestments, sheet?.currency)}
                            {renderDataRow('Other Non-Current Assets', sheet?.otherNonCurrentAssets, sheet?.currency)}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-900/60 font-mono text-xs font-semibold bg-zinc-950/20 px-2 rounded">
                                <span className="text-zinc-400">Total Non-Current Assets</span>
                                <span className="text-zinc-200">{formatCurrency(sheet?.totalNonCurrentAssets, sheet?.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 rounded shadow-sm">
                                <span className="text-emerald-400 uppercase tracking-wider text-[10px]">Total Consolidated Assets (A)</span>
                                <span className="text-emerald-400 text-[13px]">{formatCurrency(sheet?.totalAssets, sheet?.currency)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">2. Debt & Liability Obligations</h3>
                            </div>
                            {renderDataRow('Short-Term Debt', sheet?.shortTermDebt, sheet?.currency)}
                            {renderDataRow('Accounts Payable Obligations', sheet?.accountsPayable, sheet?.currency)}
                            {renderDataRow('Deferred / Unearned Revenue', sheet?.deferredRevenue, sheet?.currency)}
                            {renderDataRow('Other Current Liabilities', sheet?.otherCurrentLiabilities, sheet?.currency)}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-900/60 font-mono text-xs font-semibold bg-zinc-950/20 px-2 rounded">
                                <span className="text-zinc-400">Total Current Liabilities</span>
                                <span className="text-zinc-200">{formatCurrency(sheet?.totalCurrentLiabilities, sheet?.currency)}</span>
                            </div>
                            {renderDataRow('Long-Term Debt Obligations', sheet?.longTermDebt, sheet?.currency)}
                            {renderDataRow('Deferred Tax Liabilities', sheet?.deferredTaxLiabilities, sheet?.currency)}
                            {renderDataRow('Other Non-Current Liabilities', sheet?.otherNonCurrentLiabilities, sheet?.currency)}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-900/60 font-mono text-xs font-semibold bg-zinc-950/20 px-2 rounded">
                                <span className="text-zinc-400">Total Non-Current Liabilities</span>
                                <span className="text-zinc-200">{formatCurrency(sheet?.totalNonCurrentLiabilities, sheet?.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-zinc-900 border border-zinc-800 px-2.5 rounded shadow-sm">
                                <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Total Aggregated Liabilities (L)</span>
                                <span className="text-zinc-300 text-[13px]">{formatCurrency(sheet?.totalLiabilities, sheet?.currency)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">3. Shareholders Net Worth Equity</h3>
                            </div>
                            {renderDataRow('Common Stock Capital', sheet?.commonStock, sheet?.currency)}
                            {renderDataRow('Additional Paid-In Capital (APIC)', sheet?.additionalPaidInCapital, sheet?.currency)}
                            {renderDataRow('Retained Earnings Balance', sheet?.retainedEarnings, sheet?.currency)}
                            {renderDataRow('Treasury Stock Buybacks', sheet?.treasuryStock, sheet?.currency)}
                            {renderDataRow('Other Comprehensive Equity', sheet?.otherEquity, sheet?.currency)}
                            {renderDataRow('Minority Interest Equity', sheet?.minorityInterestEquity, sheet?.currency)}
                            <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-blue-500/5 border border-blue-500/10 px-2.5 rounded shadow-sm">
                                <span className="text-blue-400 uppercase tracking-wider text-[10px]">Total Shareholders Equity (E)</span>
                                <span className="text-blue-400 text-[13px]">{formatCurrency(sheet?.totalEquity, sheet?.currency)}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-2.5">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Derived Analytics Evaluation</div>
                            {renderDataRow('Book Value Per Share (BVPS)', sheet?.bookValuePerShare, sheet?.currency)}
                            {renderDataRow('Calculated Corporate Net Debt', sheet?.netDebt, sheet?.currency)}
                            {renderDataRow('Net Operations Working Capital', sheet?.workingCapital, sheet?.currency)}
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}