import { X, DollarSign, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { useGetCashFlowDetail } from '@/hooks/useCashFlows'
import { formatCurrency } from '@/utils/formatters'

export default function CashFlowDetail({ id, onClose }) {
  const { data: cf, isLoading } = useGetCashFlowDetail(id)

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
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-100 tracking-tight">Ledger Cash Flow Registry</h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
            Compiling liquidity velocity metrics...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-3">
              <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-900">
                <div className="w-7 h-7 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden">
                  {cf?.company?.logoUrl ? (
                    <img src={cf.company.logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-zinc-200 text-xs">{cf?.company?.displayName || 'Unknown Corporate'}</div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[300px]">{cf?.company?.legalName || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Filing Period Combo</span>
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5 mt-0.5">
                    FY {cf?.fiscalYear}
                    <span className="text-[10px] px-1 rounded bg-zinc-950 border border-zinc-900 font-mono text-zinc-400">{cf?.period}</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Filing Closing Date</span>
                  <span className="font-mono text-zinc-400 mt-0.5 block">{cf?.periodEndDate ? cf.periodEndDate.split('T')[0] : '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">System Currency</span>
                  <span className="font-mono text-zinc-400 mt-0.5 block">{cf?.currency}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Audit Ledger Status</span>
                  <span className="text-emerald-400 font-semibold text-[10px] mt-0.5 block tracking-wider uppercase">{cf?.auditStatus || 'UNAUDITED'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">1. Operating Activities</h3>
              </div>
              {renderDataRow('Net Income Baseline Start', cf?.netIncomeStart, cf?.currency)}
              {renderDataRow('Depreciation & Amortization Refunding', cf?.depreciationAmort, cf?.currency)}
              {renderDataRow('Stock-Based Compensation', cf?.stockBasedCompensation, cf?.currency)}
              {renderDataRow('Net Change In Working Capital', cf?.changeInWorkingCapital, cf?.currency)}
              {renderDataRow('Change In Accounts Receivables', cf?.changeInReceivables, cf?.currency)}
              {renderDataRow('Change In Inventories', cf?.changeInInventory, cf?.currency)}
              {renderDataRow('Change In Accounts Payables', cf?.changeInPayables, cf?.currency)}
              {renderDataRow('Other Operating Liquidity Activities', cf?.otherOperatingActivities, cf?.currency)}
              <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 rounded shadow-sm">
                <span className="text-emerald-400 uppercase tracking-wider text-[10px]">Net Cash From Operations</span>
                <span className="text-emerald-400 text-[13px]">{formatCurrency(cf?.netCashFromOperations, cf?.currency)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">2. Investing Activities</h3>
              </div>
              {renderDataRow('Capital Expenditures (CapEx)', cf?.capitalExpenditures, cf?.currency)}
              {renderDataRow('Business Acquisitions & Mergers', cf?.acquisitions, cf?.currency)}
              {renderDataRow('Purchase of Investments', cf?.purchaseOfInvestments, cf?.currency)}
              {renderDataRow('Sale / Liquidation of Investments', cf?.saleOfInvestments, cf?.currency)}
              {renderDataRow('Other Investing Flow Tracks', cf?.otherInvestingActivities, cf?.currency)}
              <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-zinc-900 border border-zinc-800 px-2.5 rounded shadow-sm">
                <span className="text-orange-400 uppercase tracking-wider text-[10px]">Net Cash From Investing</span>
                <span className="text-orange-400 text-[13px]">{formatCurrency(cf?.netCashFromInvesting, cf?.currency)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 tracking-wider">3. Financing Activities</h3>
              </div>
              {renderDataRow('Corporate Debt Issuance', cf?.debtIssuance, cf?.currency)}
              {renderDataRow('Debt Repayments / Reductions', cf?.debtRepayment, cf?.currency)}
              {renderDataRow('Common Stock Issuance Proceeds', cf?.commonStockIssuance, cf?.currency)}
              {renderDataRow('Common Stock Repurchases (Buybacks)', cf?.commonStockRepurchase, cf?.currency)}
              {renderDataRow('Dividends Paid Out', cf?.dividendsPaid, cf?.currency)}
              {renderDataRow('Other Financing Cash Activities', cf?.otherFinancingActivities, cf?.currency)}
              <div className="flex items-center justify-between py-2.5 font-mono text-xs font-bold bg-blue-500/5 border border-blue-500/10 px-2.5 rounded shadow-sm">
                <span className="text-blue-400 uppercase tracking-wider text-[10px]">Net Cash From Financing</span>
                <span className="text-blue-400 text-[13px]">{formatCurrency(cf?.netCashFromFinancing, cf?.currency)}</span>
              </div>
            </div>

            <div className="p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl space-y-2.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Net Cash Position Balance Summary</div>
              {renderDataRow('Net Combined Change In Cash', cf?.netChangeInCash, cf?.currency)}
              {renderDataRow('Cash At Beginning of Period', cf?.cashBeginningPeriod, cf?.currency)}
              {renderDataRow('Cash At End of Period Location', cf?.cashEndPeriod, cf?.currency)}
              <div className="flex items-center justify-between py-2 border-t border-zinc-900 pt-2 font-mono text-xs font-bold">
                <span className="text-emerald-400 uppercase tracking-wider text-[10px]">Free Cash Flow (FCF)</span>
                <span className="text-emerald-400">{cf?.freeCashFlow !== null && cf?.freeCashFlow !== undefined ? formatCurrency(cf.freeCashFlow, cf.currency) : '—'}</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}