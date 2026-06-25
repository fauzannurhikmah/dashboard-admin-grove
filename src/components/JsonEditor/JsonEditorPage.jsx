import { useState, useEffect } from 'react'
import { Search, X, Plus, AlignLeft, Send, TrendingUp, Wallet, DollarSign, Copy, Trash2, Activity, Upload, FileText, Cpu, Sparkles, RefreshCw } from 'lucide-react'
import { useGetCompanies } from '@/hooks/useCompanies'
import { useUpsertIncomeStatement } from '@/hooks/useIncomeStatements'
import { useUpsertBalanceSheet } from '@/hooks/useBalanceSheets'
import { useUpsertCashFlow } from '@/hooks/useCashFlows'
import { useUpsertStockPrice } from '@/hooks/useStockPrices'
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
    cashFlows: [],
    stockPrices: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mockExtractedData = {
    incomeStatement: {
      period: 'ANNUAL',
      fiscalYear: 2025,
      periodEndDate: '2025-12-31',
      currency: 'IDR',
      auditStatus: 'AUDITED',
      revenue: 550000000000,
      revenueGrowthYoY: 12.5,
      cogs: 220000000000,
      grossProfit: 330000000000,
      operatingExpenses: 180000000000,
      sellingExpenses: 60000000000,
      generalAdminExpenses: 120000000000,
      ebitda: 175000000000,
      ebit: 150000000000,
      operatingIncome: 150000000000,
      pretaxIncome: 145000000000,
      incomeTaxExpense: 31900000000,
      effectiveTaxRate: 22.0,
      netIncome: 113100000000,
      eps: 452.4,
      sharesWeightedAvg: 250000000
    },
    balanceSheet: {
      period: 'ANNUAL',
      fiscalYear: 2025,
      periodEndDate: '2025-12-31',
      currency: 'IDR',
      auditStatus: 'AUDITED',
      cash: 85000000000,
      shortTermInvestments: 25000000000,
      accountsReceivable: 45000000000,
      inventory: 60000000000,
      otherCurrentAssets: 10000000000,
      totalCurrentAssets: 225000000000,
      propertyPlantEquipment: 350000000000,
      intangibleAssets: 150000000000,
      goodwill: 40000000000,
      totalNonCurrentAssets: 540000000000,
      totalAssets: 765000000000,
      shortTermDebt: 30000000000,
      accountsPayable: 50000000000,
      otherCurrentLiabilities: 15000000000,
      totalCurrentLiabilities: 95000000000,
      longTermDebt: 120000000000,
      totalNonCurrentLiabilities: 120000000000,
      totalLiabilities: 215000000000,
      commonStock: 250000000000,
      retainedEarnings: 300000000000,
      totalEquity: 550000000000,
      netDebt: 65000000000,
      workingCapital: 130000000000
    },
    cashFlow: {
      period: 'ANNUAL',
      fiscalYear: 2025,
      periodEndDate: '2025-12-31',
      currency: 'IDR',
      auditStatus: 'AUDITED',
      netIncomeStart: 113100000000,
      depreciationAmort: 25000000000,
      changeInWorkingCapital: -15000000000,
      netCashFromOperations: 123100000000,
      capitalExpenditures: -75000000000,
      netCashFromInvesting: -75000000000,
      debtIssuance: 30000000000,
      dividendsPaid: -45000000000,
      netCashFromFinancing: -15000000000,
      netChangeInCash: 33100000000,
      cashBeginningPeriod: 51900000000,
      cashEndPeriod: 85000000000,
      freeCashFlow: 48100000000
    }
  }

  const [activeTab, setActiveTab] = useState('editor') // 'editor' | 'extractor'
  const [extractorState, setExtractorState] = useState('idle') // 'idle' | 'extracting' | 'preview'
  const [fileName, setFileName] = useState('')
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [extractionStep, setExtractionStep] = useState('')
  const [previewActiveTab, setPreviewActiveTab] = useState('income') // 'income' | 'balance' | 'cash'

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    startExtractionSimulation(file.name)
  }

  const startExtractionSimulation = (name) => {
    setFileName(name)
    setExtractorState('extracting')
    setExtractionProgress(0)
    setExtractionStep('Uploading document payload to AI parsing pipeline...')

    const steps = [
      { progress: 20, step: 'OCR scanning financial report pages...' },
      { progress: 50, step: 'Extracting balance sheet and mapping assets, liabilities, and equities...' },
      { progress: 75, step: 'Parsing income statement revenues, COGS, expenses, and net profit margins...' },
      { progress: 90, step: 'Synthesizing cash flows operations, investing, and financing metrics...' },
      { progress: 100, step: 'Extraction mapping completed!' }
    ]

    steps.forEach((stepItem, index) => {
      setTimeout(() => {
        setExtractionProgress(stepItem.progress)
        setExtractionStep(stepItem.step)

        if (stepItem.progress === 100) {
          setTimeout(() => {
            setExtractorState('preview')
          }, 600)
        }
      }, (index + 1) * 1000)
    })
  }

  const handleResetExtractor = () => {
    setExtractorState('idle')
    setFileName('')
    setExtractionProgress(0)
    setExtractionStep('')
  }

  const handleApplyExtractedData = () => {
    if (!selectedCompany) {
      showToast('Please select a company first!', 'error')
      return
    }

    const newIncome = { ...mockExtractedData.incomeStatement, companyId: selectedCompany.id }
    const newBalance = { ...mockExtractedData.balanceSheet, companyId: selectedCompany.id }
    const newCashFlow = { ...mockExtractedData.cashFlow, companyId: selectedCompany.id }

    setJsonData(prev => ({
      ...prev,
      incomeStatements: [...(prev.incomeStatements || []), newIncome],
      balanceSheets: [...(prev.balanceSheets || []), newBalance],
      cashFlows: [...(prev.cashFlows || []), newCashFlow]
    }))

    showToast('Extracted statements successfully applied to JSON Editor!', 'success')
    setActiveTab('editor')
  }

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
      incomeStatements: (prev.incomeStatements || []).map(item => ({ ...item, companyId: company.id })),
      balanceSheets: (prev.balanceSheets || []).map(item => ({ ...item, companyId: company.id })),
      cashFlows: (prev.cashFlows || []).map(item => ({ ...item, companyId: company.id })),
      stockPrices: (prev.stockPrices || []).map(item => ({ ...item, companyId: company.id }))
    }))
  }

  const addItem = (type) => {
    const blueprintType = type === 'incomeStatements' ? 'income-statements' :
      type === 'balanceSheets' ? 'balance-sheets' :
        type === 'cashFlows' ? 'cash-flows' : 'stock-prices'
    const blueprint = { ...formBlueprints[blueprintType] }
    if (selectedCompany) {
      blueprint.companyId = selectedCompany.id
    }

    setJsonData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), blueprint]
    }))
  }

  const removeItem = (type, index) => {
    setJsonData(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index)
    }))
  }

  const upsertIncomeStatement = useUpsertIncomeStatement()
  const upsertBalanceSheet = useUpsertBalanceSheet()
  const upsertCashFlow = useUpsertCashFlow()
  const upsertStockPrice = useUpsertStockPrice()

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

    if ((jsonData.incomeStatements || []).length > 0) {
      mutations.push(upsertIncomeStatement.mutateAsync(jsonData.incomeStatements))
    }

    if ((jsonData.balanceSheets || []).length > 0) {
      mutations.push(upsertBalanceSheet.mutateAsync(jsonData.balanceSheets))
    }

    if ((jsonData.cashFlows || []).length > 0) {
      mutations.push(upsertCashFlow.mutateAsync(jsonData.cashFlows))
    }

    if ((jsonData.stockPrices || []).length > 0) {
      mutations.push(upsertStockPrice.mutateAsync(jsonData.stockPrices))
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
    const items = jsonData[type] || []
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
                  {item.date || (item.period ? `${item.period} ${item.fiscalYear || '-'}` : '-')}
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

  const handleClearAll = () => {
    setJsonData({
      incomeStatements: [],
      balanceSheets: [],
      cashFlows: [],
      stockPrices: []
    })
    setSelectedCompany(null)
    setCompanyQuery('')
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
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/30 rounded-lg text-xs font-medium transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
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
          {renderItemList('stockPrices', 'Stock Prices', Activity)}

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

        <div className="lg:col-span-2 space-y-4">
          <div className="flex border-b border-zinc-900 gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'border-emerald-500 text-emerald-400 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>JSON Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('extractor')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'extractor'
                  ? 'border-emerald-500 text-emerald-400 font-medium'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Financial Report Extractor (AI Simulator)</span>
            </button>
          </div>

          {activeTab === 'editor' ? (
            <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">JSON Editor</span>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>Income: {(jsonData.incomeStatements || []).length}</span>
                  <span>Balance: {(jsonData.balanceSheets || []).length}</span>
                  <span>Cash Flow: {(jsonData.cashFlows || []).length}</span>
                  <span>Stock Prices: {(jsonData.stockPrices || []).length}</span>
                </div>
              </div>
              <textarea
                value={jsonString}
                onChange={handleTextChange}
                className="w-full h-[600px] bg-transparent text-zinc-300 outline-none resize-none leading-relaxed font-mono text-xs p-4 focus:outline-none overflow-y-auto"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-6">
              {extractorState === 'idle' && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-12 bg-[#0c0c0e]/30 hover:bg-[#0c0c0e]/50 transition-all group relative cursor-pointer">
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                  />
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-zinc-700/50 transition-colors mb-4">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-200 transition-colors">
                    Upload Financial Report
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm text-center">
                    Drag and drop or click to upload your PDF, Excel sheet, or image. Our simulated AI pipeline will automatically extract statements data.
                  </p>
                </div>
              )}

              {extractorState === 'extracting' && (
                <div className="space-y-6 p-8 border border-zinc-900 rounded-xl bg-[#0c0c0e]/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                      <Cpu className="w-5 h-5 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-400 truncate">Extracting from: <span className="text-zinc-200 font-mono">{fileName}</span></h4>
                      <p className="text-xs text-zinc-500 mt-0.5 animate-pulse">{extractionStep}</p>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400">{extractionProgress}%</div>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {[
                      { step: 1, label: 'OCR Extraction', limit: 20 },
                      { step: 2, label: 'Balance Sheet Mapping', limit: 50 },
                      { step: 3, label: 'Income Statement Synthesis', limit: 75 },
                      { step: 4, label: 'Cash Flow Translation', limit: 100 }
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          extractionProgress >= s.limit
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-950/20 border-zinc-900/60 text-zinc-600'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-1">Step {s.step}</div>
                        <div className="text-[11px] font-medium truncate">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractorState === 'preview' && (
                <div className="space-y-6">
                  {/* File information panel */}
                  <div className="flex items-center justify-between p-4 bg-[#0c0c0e] border border-zinc-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-emerald-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-300 truncate max-w-xs">{fileName}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono mt-1 inline-block">AI Extraction Successful</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResetExtractor}
                        className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-900/80 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Upload New</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyExtractedData}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply to JSON Editor</span>
                      </button>
                    </div>
                  </div>

                  {/* Statements previews tab system */}
                  <div className="border border-zinc-900 rounded-xl overflow-hidden bg-[#0c0c0e]/30">
                    <div className="flex bg-[#0c0c0e] border-b border-zinc-900 p-2 gap-1.5">
                      {[
                        { id: 'income', label: 'Income Statement', icon: TrendingUp },
                        { id: 'balance', label: 'Balance Sheet', icon: Wallet },
                        { id: 'cash', label: 'Cash Flow', icon: DollarSign }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setPreviewActiveTab(t.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            previewActiveTab === t.id
                              ? 'bg-zinc-900 border border-zinc-800 text-emerald-400 shadow-sm'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 max-h-[350px] overflow-y-auto font-mono text-xs divide-y divide-zinc-900">
                      {previewActiveTab === 'income' &&
                        Object.entries(mockExtractedData.incomeStatement).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-2 items-center hover:bg-zinc-900/10 px-1.5 rounded">
                            <span className="text-zinc-500 font-sans">{key}</span>
                            <span className="text-zinc-200 font-bold">
                              {typeof val === 'number' && key !== 'fiscalYear' && key !== 'effectiveTaxRate'
                                ? val.toLocaleString('en-US')
                                : val?.toString() || '—'}
                            </span>
                          </div>
                        ))}

                      {previewActiveTab === 'balance' &&
                        Object.entries(mockExtractedData.balanceSheet).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-2 items-center hover:bg-zinc-900/10 px-1.5 rounded">
                            <span className="text-zinc-500 font-sans">{key}</span>
                            <span className="text-zinc-200 font-bold">
                              {typeof val === 'number' && key !== 'fiscalYear'
                                ? val.toLocaleString('en-US')
                                : val?.toString() || '—'}
                            </span>
                          </div>
                        ))}

                      {previewActiveTab === 'cash' &&
                        Object.entries(mockExtractedData.cashFlow).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-2 items-center hover:bg-zinc-900/10 px-1.5 rounded">
                            <span className="text-zinc-500 font-sans">{key}</span>
                            <span className="text-zinc-200 font-bold">
                              {typeof val === 'number' && key !== 'fiscalYear'
                                ? val.toLocaleString('en-US')
                                : val?.toString() || '—'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}
