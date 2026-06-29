import { X, TrendingUp, DollarSign, Calendar, ShieldCheck } from 'lucide-react'
import { useGetIncomeStatementDetail } from '@/hooks/useIncomeStatements'
import { formatCurrency } from '@/utils/formatters'


export default function IncomeStatementDetail({ id, onClose }) {
    const { data, isLoading, isError, error } = useGetIncomeStatementDetail(id)

    const statement = data || {}
    const company = statement.company || {}


    const renderDataRow = (label, value, isBold = false, isEmerald = false) => (
        <div className="flex items-center justify-between py-2 border-b border-zinc-900/40 text-xs">
            <span className="text-zinc-500 font-medium">{label}</span>
            <span className={`font-mono ${isEmerald ? 'text-emerald-400 font-semibold' : isBold ? 'text-zinc-200 font-semibold' : 'text-zinc-400'
                }`}>
                {value}
            </span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end animate-fade-in -top-[2rem]">
            {/* Backdrop Shield Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Sidebar Detail Panel Container */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-[#09090b] border-l border-zinc-900 shadow-2xl flex flex-col overflow-hidden animate-slide-in text-sm text-zinc-300">

                {/* PANEL HEADER */}
                <div className="p-5 border-b border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.displayName} className="w-full h-full object-contain p-1" />
                            ) : (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-100 tracking-tight text-[14px]">
                                {company.displayName || 'Statement Review'}
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {id?.substring(0, 8)}...</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* LOADING & ERROR STATES */}
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
                        Compiling decentralized ledger records...
                    </div>
                )}

                {isError && (
                    <div className="flex-1 flex items-center justify-center text-xs font-mono text-red-400 p-6 text-center">
                        Extraction failure: {error?.response?.data?.message || error.message}
                    </div>
                )}

                {/* DATA BLOCK SHEETS */}
                {!isLoading && !isError && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* META CONTEXT CARD */}
                        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                                <span>Period: <strong className="text-zinc-200 font-mono">{statement.fiscalYear} {statement.period}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                                <span>Audit: <strong className="text-zinc-200 font-mono text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{statement.auditStatus}</strong></span>
                            </div>
                            <div className="col-span-2 text-[11px] text-zinc-500 border-t border-zinc-900/60 pt-2 font-mono">
                                Closing Date: {statement.periodEndDate ? statement.periodEndDate.split('T')[0] : '—'}
                            </div>
                        </div>

                        {/* BLOCK 1: TOP-LINE PERFORMANCE */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-zinc-900">
                                <DollarSign className="w-3 h-3 text-zinc-600" /> Top-Line Performance
                            </h4>
                            {renderDataRow('Total Revenue', formatCurrency(statement.revenue, statement.currency), true)}
                            {renderDataRow('Cost of Goods Sold (COGS)', formatCurrency(statement.cogs, statement.currency))}
                            {renderDataRow('Gross Profit Target', formatCurrency(statement.grossProfit, statement.currency), true, true)}
                        </div>

                        {/* BLOCK 2: OPERATING OVERHEAD (OPEX) */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-900">
                                Operating Expenditures (OpEx)
                            </h4>
                            {renderDataRow('Selling & Marketing Expenses', formatCurrency(statement.sellingExpenses, statement.currency))}
                            {renderDataRow('General & Administrative', formatCurrency(statement.generalAdminExpenses, statement.currency))}
                            {renderDataRow('Research & Development (R&D)', formatCurrency(statement.rdExpenses, statement.currency))}
                            {renderDataRow('Depreciation & Amortization', formatCurrency(statement.depreciationAmort, statement.currency))}
                            {renderDataRow('Total Accumulated OpEx', formatCurrency(statement.operatingExpenses, statement.currency), true)}
                        </div>

                        {/* BLOCK 3: PROFITABILITY INTERMEDIARIES */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-900">
                                Profitability Intermediate Maps
                            </h4>
                            {renderDataRow('Operating Income', formatCurrency(statement.operatingIncome, statement.currency), true)}
                            {renderDataRow('EBIT (Operating Earnings)', formatCurrency(statement.ebit, statement.currency))}
                            {renderDataRow('EBITDA Metric', formatCurrency(statement.ebitda, statement.currency))}
                        </div>

                        {/* BLOCK 4: BELOW THE LINE & TAXES */}
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-900">
                                Financial Gears & Tax Map
                            </h4>
                            {renderDataRow('Interest Income', formatCurrency(statement.interestIncome, statement.currency))}
                            {renderDataRow('Interest Expense', formatCurrency(statement.interestExpense, statement.currency))}
                            {renderDataRow('Other Non-Operating Activities', formatCurrency(statement.otherNonOperatingIncome, statement.currency))}
                            {renderDataRow('Pretax Income (EBT)', formatCurrency(statement.pretaxIncome, statement.currency), true)}
                            {renderDataRow('Income Tax Expense', formatCurrency(statement.incomeTaxExpense, statement.currency))}
                            {renderDataRow('Effective Tax Rate', statement.effectiveTaxRate !== null ? `${(Number(statement.effectiveTaxRate) * 100).toFixed(2)}%` : '—')}
                        </div>

                        {/* BLOCK 5: BOTTOM-LINE YIELD & EPS */}
                        <div className="space-y-2 bg-[#0c0c0e]/50 border border-zinc-900/60 rounded-xl p-4">
                            <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-zinc-900">
                                Bottom Line Yield & Capital Per Share
                            </h4>
                            {renderDataRow('Net Income Attributable', formatCurrency(statement.netIncomeAttributable, statement.currency))}
                            {renderDataRow('Minority Interest Share', formatCurrency(statement.minorityInterest, statement.currency))}
                            {renderDataRow('Consolidated Net Income', formatCurrency(statement.netIncome, statement.currency), true, true)}
                            <div className="pt-2 mt-2 border-t border-zinc-900/60 grid grid-cols-2 gap-3 font-mono text-[11px]">
                                <div>
                                    <span className="block text-zinc-600 text-[10px] uppercase">Basic EPS</span>
                                    <span className="text-zinc-200 font-bold text-xs">{statement.eps || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-zinc-600 text-[10px] uppercase">Diluted EPS</span>
                                    <span className="text-zinc-200 font-bold text-xs">{statement.epsDiluted || '—'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-zinc-600 text-[10px] uppercase">Weighted Avg Shares Out</span>
                                    <span className="text-zinc-400 text-xs font-semibold">
                                        {statement.sharesWeightedAvg ? Number(statement.sharesWeightedAvg).toLocaleString() : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* FOOTER CLOSE BUTTON */}
                <div className="p-4 border-t border-zinc-900 bg-[#0c0c0e] flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 font-medium text-xs transition-colors"
                    >
                        Dismiss View
                    </button>
                </div>

            </div>
        </div>
    )
}