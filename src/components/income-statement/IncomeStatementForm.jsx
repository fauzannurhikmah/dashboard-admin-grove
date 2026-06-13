import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, TrendingUp, Search, X } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'
import {
  useGetIncomeStatementDetail,
  useUpdateIncomeStatement,
  useCreateIncomeStatement
} from '@/hooks/useIncomeStatements'
import { useGetCompanies } from '@/hooks/useCompanies'

export default function IncomeStatementForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const currentFormData = useFormStore((state) => state.getFormData('income-statements'))
  const updateGlobalStore = useFormStore((state) => state.updateFormData)

  const showToast = useFormStore((state) => state.showToast)

  const createMutation = useCreateIncomeStatement()
  const updateMutation = useUpdateIncomeStatement(id)
  const { data: serverDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useGetIncomeStatementDetail(id)

  const defaultBlueprint = {
    companyId: '',
    period: 'ANNUAL',
    fiscalYear: new Date().getFullYear(),
    fiscalQuarter: null,
    periodEndDate: '',
    currency: 'USD',
    auditStatus: 'UNAUDITED',
    revenue: '',
    revenueGrowthYoY: '',
    cogs: '',
    grossProfit: '',
    operatingExpenses: '',
    sellingExpenses: '',
    generalAdminExpenses: '',
    rdExpenses: '',
    depreciationAmort: '',
    ebit: '',
    ebitda: '',
    operatingIncome: '',
    interestExpense: '',
    interestIncome: '',
    otherNonOperatingIncome: '',
    pretaxIncome: '',
    incomeTaxExpense: '',
    effectiveTaxRate: '',
    netIncome: '',
    netIncomeAttributable: '',
    minorityInterest: '',
    eps: '',
    epsDiluted: '',
    sharesWeightedAvg: ''
  }

  const [form, setForm] = useState(defaultBlueprint)
  const [companyQuery, setCompanyQuery] = useState('')
  const [debouncedCompanyQuery, setDebouncedCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  const { data: searchResults, isLoading: isSearchingCompanies } = useGetCompanies(1, 10, debouncedCompanyQuery)
  const companyOptions = searchResults?.items || []

  useEffect(() => {
    if (isEdit && serverDetail) {
      const cleanDetail = { ...serverDetail }
      delete cleanDetail.id
      delete cleanDetail.createdAt
      delete cleanDetail.updatedAt

      if (cleanDetail.company) {
        setCompanyQuery(cleanDetail.company.displayName)
        cleanDetail.companyId = cleanDetail.company.id
        delete cleanDetail.company
      }

      if (cleanDetail.periodEndDate) {
        cleanDetail.periodEndDate = cleanDetail.periodEndDate.split('T')[0]
      }

      setForm(cleanDetail)
      updateGlobalStore('income-statements', cleanDetail)
    }
  }, [isEdit, serverDetail])

  useEffect(() => {
    if (!isEdit && currentFormData) {
      const targetData = Array.isArray(currentFormData) ? currentFormData[0] : currentFormData
      if (targetData && Object.keys(targetData).length > 0) {
        setForm(prev => ({ ...prev, ...targetData }))
      }
    }
  }, [currentFormData, isEdit])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCompanyQuery(companyQuery)
    }, 400)
    return () => clearTimeout(handler)
  }, [companyQuery])

  const syncToGlobalStore = (updatedForm) => {
    if (Array.isArray(currentFormData)) {
      const updatedArray = [...currentFormData]
      updatedArray[0] = updatedForm
      updateGlobalStore('income-statements', updatedArray)
    } else {
      updateGlobalStore('income-statements', updatedForm)
    }
  }

  const formatDisplayNumber = (val) => {
    if (val === null || val === undefined || val === '') return ''
    const strVal = val.toString()
    const parts = strVal.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  const parseRawNumber = (displayStr) => {
    const cleanStr = displayStr.replace(/,/g, '')
    if (cleanStr === '') return ''
    const parsed = parseFloat(cleanStr)
    return isNaN(parsed) ? '' : parsed
  }

  const handleTextChange = (e) => {
    const { name, value } = e.target
    let updatedValue = value

    if (name === 'fiscalYear' || name === 'fiscalQuarter') {
      updatedValue = value !== '' ? parseInt(value, 10) : ''
    }

    let updatedForm = { ...form, [name]: updatedValue }

    if (name === 'period') {
      if (value.startsWith('Q')) {
        updatedForm.fiscalQuarter = parseInt(value.charAt(1), 10)
      } else {
        updatedForm.fiscalQuarter = null
      }
    }

    setForm(updatedForm)
    syncToGlobalStore(updatedForm)
  }

  const handleNumericChange = (e) => {
    const { name, value } = e.target
    const rawNumber = parseRawNumber(value)

    let updatedForm = { ...form, [name]: rawNumber }
    setForm(updatedForm)
    syncToGlobalStore(updatedForm)
  }

  const handlePercentageChange = (e) => {
    const { name, value } = e.target

    let updatedForm = { ...form, [name]: value }
    setForm(updatedForm)
    syncToGlobalStore(updatedForm)
  }

  const handleSelectCompany = (company) => {
    const updatedForm = { ...form, companyId: company.id }
    setForm(updatedForm)
    setCompanyQuery(company.displayName)
    setShowCompanyDropdown(false)
    syncToGlobalStore(updatedForm)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = Array.isArray(currentFormData) ? currentFormData[0] : currentFormData

    if (isEdit) {
      updateMutation.mutate(payload, {
        onSuccess: async () => {
          showToast('Financial ledger items updated successfully.', 'success')
          await refetchDetail()
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to update financial database registry.', 'error')
        }
      })
    } else {
      createMutation.mutate(currentFormData, {
        onSuccess: (data) => {
          showToast('New income statement registered successfully.', 'success')
          updateGlobalStore('income-statements', {})
          setForm(defaultBlueprint)
          setCompanyQuery('')
          if (!Array.isArray(data) && data?.id) {
            navigate(`/dashboard/income-statements/${data.id}/edit`)
          }
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to initialize statement record.', 'error')
        }
      })
    }
  }

  const renderFormattedNumberField = (name, label, placeholder = '0.00', isRequired = false) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">
        {label} {isRequired && <span className="text-emerald-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={formatDisplayNumber(form[name])}
        onChange={handleNumericChange}
        required={isRequired}
        className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
        placeholder={placeholder}
      />
    </div>
  )

  const renderPercentageField = (name, label, placeholder = '0.00') => {
    const rawValue = form[name]
    const displayValue = rawValue !== null && rawValue !== undefined ? rawValue.toString() : ''

    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">
          {label}
        </label>
        <div className="relative">
          <input
            type="text"
            name={name}
            value={displayValue}
            onChange={handlePercentageChange}
            className="w-full pl-3 pr-8 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
            placeholder={placeholder}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500 font-mono text-xs">
            %
          </div>
        </div>
      </div>
    )
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
        Retrieving operational ledger item maps from server registry...
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 animate-fade-in text-sm text-zinc-300 pb-12">

      <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/income-statements')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Income Statement' : 'New Income Statement Registry'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Adjust line items for this financial statement period.' : 'Record comprehensive top-to-bottom spreadsheet metrics.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Statement Context & Filing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-zinc-400">
                Connected Company <span className="text-emerald-500">*</span>
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
                  placeholder="Search corporate target..."
                />
                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
                {companyQuery && (
                  <button
                    type="button"
                    onClick={() => { setCompanyQuery(''); setForm(prev => ({ ...prev, companyId: '' })) }}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {showCompanyDropdown && companyQuery && (
                <div className="absolute z-10 w-full mt-1 bg-[#0c0c0e] border border-zinc-800 rounded-lg max-h-40 overflow-y-auto shadow-xl divide-y divide-zinc-900">
                  {isSearchingCompanies ? (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono animate-pulse">Searching ledger...</div>
                  ) : companyOptions.length > 0 ? (
                    companyOptions.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCompany(c)}
                        className="px-3 py-2 text-xs hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 cursor-pointer flex justify-between items-center"
                      >
                        <span>{c.displayName}</span>
                        {c.listings?.[0]?.symbol && (
                          <span className="font-mono text-[10px] text-zinc-600 bg-zinc-950 px-1 rounded">{c.listings[0].symbol}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono">No entities matched</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Filing Period Type</label>
              <select
                name="period"
                value={form.period || 'ANNUAL'}
                onChange={handleTextChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="ANNUAL">ANNUAL</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
                <option value="TTM">TTM</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Fiscal Calendar Year</label>
              <input
                type="number"
                name="fiscalYear"
                value={form.fiscalYear === null || form.fiscalYear === undefined ? '' : form.fiscalYear}
                onChange={handleTextChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="2026"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Period Closing Date</label>
              <input
                type="date"
                name="periodEndDate"
                value={form.periodEndDate || ''}
                onChange={handleTextChange}
                required
                className="w-full h-[34px] px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono block box-border leading-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Reporting Currency *</label>
              <div className="relative">
                <select
                  name="currency"
                  value={form.currency || 'USD'}
                  onChange={handleTextChange}
                  required
                  className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none font-mono"
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="IDR">IDR (Rp) — Indonesian Rupiah</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="JPY">JPY (¥) — Japanese Yen</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Filing Audit Status</label>
              <select
                name="auditStatus"
                value={form.auditStatus || 'UNAUDITED'}
                onChange={handleTextChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="UNAUDITED">UNAUDITED</option>
                <option value="AUDITED">AUDITED</option>
                <option value="REVIEWED">REVIEWED</option>
              </select>
            </div>
          </div>
          {form.fiscalQuarter && (
            <div className="text-[11px] font-mono text-zinc-500 bg-[#0c0c0e] px-2.5 py-1 rounded border border-zinc-900 inline-block">
              Auto-mapped Parameter: <span className="text-emerald-500 font-bold">fiscalQuarter = {form.fiscalQuarter}</span>
            </div>
          )}
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Top-Line Performance</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderFormattedNumberField('revenue', 'Total Revenue', '0.00', true)}
            {renderPercentageField('revenueGrowthYoY', 'Revenue Growth YoY', '4.50')}
            {renderFormattedNumberField('cogs', 'Cost of Goods Sold (COGS)')}
            {renderFormattedNumberField('grossProfit', 'Gross Profit')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Operating Expenses (OpEx)</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {renderFormattedNumberField('operatingExpenses', 'Total OpEx')}
            {renderFormattedNumberField('sellingExpenses', 'Selling Expenses')}
            {renderFormattedNumberField('generalAdminExpenses', 'Gen & Admin Expenses')}
            {renderFormattedNumberField('rdExpenses', 'R&D Expenditures')}
            {renderFormattedNumberField('depreciationAmort', 'Depr & Amortization')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Profitability Intermediaries</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFormattedNumberField('operatingIncome', 'Operating Income')}
            {renderFormattedNumberField('ebit', 'EBIT (Operating Earnings)')}
            {renderFormattedNumberField('ebitda', 'EBITDA')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Non-Operating & Financial Taxes</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFormattedNumberField('interestExpense', 'Interest Expense')}
            {renderFormattedNumberField('interestIncome', 'Interest Income')}
            {renderFormattedNumberField('otherNonOperatingIncome', 'Other Non-Operating')}
            {renderFormattedNumberField('pretaxIncome', 'Pretax Income')}
            {renderFormattedNumberField('incomeTaxExpense', 'Income Tax Expense')}
            {renderPercentageField('effectiveTaxRate', 'Effective Tax Rate', '21.00')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Bottom Line Earnings & Per Share Data</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFormattedNumberField('netIncome', 'Net Income', '0.00', true)}
            {renderFormattedNumberField('netIncomeAttributable', 'Net Income Attributable')}
            {renderFormattedNumberField('minorityInterest', 'Minority Interest')}
            {renderFormattedNumberField('eps', 'Basic EPS (Earnings Per Share)', '0.0000')}
            {renderFormattedNumberField('epsDiluted', 'Diluted EPS', '0.0000')}
            {renderFormattedNumberField('sharesWeightedAvg', 'Weighted Avg Shares', '10000000')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/income-statements')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending || createMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            {updateMutation.isPending || createMutation.isPending ? 'Saving...' : 'Save Statement'}
          </button>
        </div>

      </form>

      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}