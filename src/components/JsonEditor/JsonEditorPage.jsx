import { useState, useEffect } from 'react'
import { Search, X, Plus, AlignLeft, Send, TrendingUp, Wallet, DollarSign, Copy, Trash2 } from 'lucide-react'
import { useGetCompanies } from '@/hooks/useCompanies'
import { useUpsertIncomeStatement } from '@/hooks/useIncomeStatements'
import { useUpsertBalanceSheet } from '@/hooks/useBalanceSheets'
import { useUpsertCashFlow } from '@/hooks/useCashFlows'
import { useFormStore } from '@/store/useFormStore'
import { formBlueprints } from '@/types/formBlueprints'

export default function JsonEditorPage() {
  const showToast = useFormStore((state) => state.showToast)

  const [companyQuery, setCompanyQuery] = useState('')
  const [debouncedCompanyQuery, setDebouncedCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [jsonString, setJsonString] = useState('')
  const [jsonData, setJsonData] = useState({
    incomeStatements: [],
    balanceSheets: [],
    cashFlows: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: searchResults } = useGetCompanies(1, 20, debouncedCompanyQuery)
  const companyOptions = searchResults?.items || []

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCompanyQuery(companyQuery)
    }, 400)
    return () => clearTimeout(handler)
  }, [companyQuery])

  useEffect(() => {
    setJsonString(JSON.stringify(jsonData, null, 2))
  }, [jsonData])

  const handleTextChange = (e) => {
    const value = e.target.value
    setJsonString(value)
    try {
      const parsed = JSON.parse(value)
      setJsonData(parsed)
    } catch (err) {
    }
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonString)
      setJsonData(parsed)
      setJsonString(JSON.stringify(parsed, null, 2))
      showToast('JSON formatted successfully!', 'success')
    } catch (err) {
      showToast('Invalid JSON syntax!', 'error')
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      showToast('JSON copied to clipboard!', 'success')
    } catch (err) {
      showToast('Failed to copy JSON', 'error')
    }
  }

  const handleSelectCompany = (company) => {
    setSelectedCompany(company)
    setCompanyQuery(company.displayName)
    setShowCompanyDropdown(false)

    setJsonData(prev => ({
      ...prev,
      incomeStatements: prev.incomeStatements.map(item => ({ ...item, companyId: company.id })),
      balanceSheets: prev.balanceSheets.map(item => ({ ...item, companyId: company.id })),
      cashFlows: prev.cashFlows.map(item => ({ ...item, companyId: company.id }))
    }))
  }

  const addItem = (type) => {
    const blueprintType = type === 'incomeStatements' ? 'income-statements' :
      type === 'balanceSheets' ? 'balance-sheets' : 'cash-flows'
    const blueprint = { ...formBlueprints[blueprintType] }
    if (selectedCompany) {
      blueprint.companyId = selectedCompany.id
    }

    setJsonData(prev => ({
      ...prev,
      [type]: [...prev[type], blueprint]
    }))
  }

  const removeItem = (type, index) => {
    setJsonData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const upsertIncomeStatement = useUpsertIncomeStatement()
  const upsertBalanceSheet = useUpsertBalanceSheet()
  const upsertCashFlow = useUpsertCashFlow()

  const handleSubmit = async () => {
    try {
      JSON.parse(jsonString)
    } catch (err) {
      showToast('Invalid JSON syntax!', 'error')
      return
    }

    if (!selectedCompany) {
      showToast('Please select a company first!', 'error')
      return
    }

    setIsSubmitting(true)

    const mutations = []

    if (jsonData.incomeStatements?.length > 0) {
      mutations.push(upsertIncomeStatement.mutateAsync(jsonData.incomeStatements))
    }

    if (jsonData.balanceSheets?.length > 0) {
      mutations.push(upsertBalanceSheet.mutateAsync(jsonData.balanceSheets))
    }

    if (jsonData.cashFlows?.length > 0) {
      mutations.push(upsertCashFlow.mutateAsync(jsonData.cashFlows))
    }

    if (mutations.length === 0) {
      showToast('No data to submit!', 'warning')
      setIsSubmitting(false)
      return
    }

    try {
      await Promise.all(mutations)
      showToast('All statements submitted successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit statements', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderItemList = (type, title, icon) => {
    const items = jsonData[type]
    const Icon = icon

    return (
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">{title} ({items.length})</span>
          </div>
          <button
            type="button"
            onClick={() => addItem(type)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/80 rounded-lg text-xs transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4">No items yet</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2">
                <div className="text-xs text-zinc-400 truncate flex-1">
                  <span className="font-mono text-zinc-500 mr-2">#{index + 1}</span>
                  {item.period} {item.fiscalYear || '-'}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(type, index)}
                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-200">
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            JSON Editor
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Edit and submit financial statements in JSON format
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-4 space-y-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-zinc-400">
                Search Company / Emiten <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyQuery}
                  onChange={(e) => {
                    setCompanyQuery(e.target.value)
                    setShowCompanyDropdown(true)
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="w-full pl-9 pr-8 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="Search company by name..."
                />
                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
                {companyQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyQuery('')
                      setSelectedCompany(null)
                    }}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {showCompanyDropdown && companyQuery && (
                <div className="absolute z-10 w-full mt-1 bg-[#0c0c0e] border border-zinc-800 rounded-lg max-h-40 overflow-y-auto shadow-xl divide-y divide-zinc-900">
                  {companyOptions.length > 0 ? (
                    companyOptions.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCompany(c)}
                        className="px-3 py-2 text-xs hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer flex justify-between items-center"
                      >
                        <span>{c.displayName}</span>
                        {c.listings?.[0]?.symbol && (
                          <span className="font-mono text-[10px] text-zinc-600 bg-zinc-950 px-1 rounded">{c.listings[0].symbol}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono">No companies found</div>
                  )}
                </div>
              )}
            </div>

            {selectedCompany && (
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-900">
                <span className="text-xs text-zinc-400">Selected:</span>
                <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-emerald-400 font-medium flex-1">
                  {selectedCompany.displayName}
                </span>
              </div>
            )}
          </div>

          {renderItemList('incomeStatements', 'Income Statements', TrendingUp)}
          {renderItemList('balanceSheets', 'Balance Sheets', Wallet)}
          {renderItemList('cashFlows', 'Cash Flows', DollarSign)}

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleFormatJson}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/80 rounded-lg text-xs transition-all"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Format JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/80 rounded-lg text-xs transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit All'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">JSON Editor</span>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>Income: {jsonData.incomeStatements.length}</span>
                <span>Balance: {jsonData.balanceSheets.length}</span>
                <span>Cash Flow: {jsonData.cashFlows.length}</span>
              </div>
            </div>
            <textarea
              value={jsonString}
              onChange={handleTextChange}
              className="w-full h-[600px] bg-transparent text-zinc-300 outline-none resize-none leading-relaxed font-mono text-xs p-4 focus:outline-none overflow-y-auto"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}
