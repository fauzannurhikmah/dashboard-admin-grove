import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, BarChart3, Search } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'

export default function ListingForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // 1. KONSUMSI GLOBAL STORE ZUSTAND
  const currentFormData = useFormStore((state) => state.getFormData('listings'))
  const updateGlobalStore = useFormStore((state) => state.updateFormData)

  // Master data tiruan untuk relasi Company & Exchange
  const mockCompanies = [
    { id: 'c1-uuid-apple', displayName: 'Apple Inc.', symbol: 'AAPL' },
    { id: 'c2-uuid-msft', displayName: 'Microsoft Corp.', symbol: 'MSFT' },
    { id: 'c3-uuid-bbca', displayName: 'Bank Central Asia Tbk.', symbol: 'BBCA' }
  ]

  const mockExchanges = [
    { id: 'e1-uuid-nasdaq', name: 'NASDAQ', country: 'US' },
    { id: 'e2-uuid-nyse', name: 'NYSE', country: 'US' },
    { id: 'e3-uuid-idx', name: 'Indonesia Stock Exchange (IDX)', country: 'ID' }
  ]

  const defaultBlueprint = {
    symbol: '',
    isin: '',
    cusip: '',
    assetType: 'STOCK',
    ipoDate: '',
    companyId: '',
    exchangeId: ''
  }

  const [form, setForm] = useState(defaultBlueprint)

  // State untuk kontrol pencarian data dropdown UI
  const [companyQuery, setCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  const [exchangeQuery, setExchangeQuery] = useState('')
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false)

  // 2. SINKRONISASI SEARAH DARI ZUSTAND GLOBAL (JSON EDITOR) KE STATE FORM LOKAL
  useEffect(() => {
    if (currentFormData) {
      // Ambil elemen pertama jika data di editor berbentuk Array bulk
      const targetData = Array.isArray(currentFormData) ? currentFormData[0] : currentFormData

      if (targetData && Object.keys(targetData).length > 0) {
        const currentFormStr = JSON.stringify(form)
        const incomingDataStr = JSON.stringify({ ...form, ...targetData })

        if (currentFormStr !== incomingDataStr) {
          setForm(prev => {
            const updated = { ...prev, ...targetData }
            // Pasang teks nama pencarian awal jika ID terdeteksi dari JSON editor
            const matchedC = mockCompanies.find(c => c.id === updated.companyId)
            if (matchedC) setCompanyQuery(matchedC.displayName)
            const matchedE = mockExchanges.find(e => e.id === updated.exchangeId)
            if (matchedE) setExchangeQuery(matchedE.name)
            return updated
          })
        }
      } else if (targetData && Object.keys(targetData).length === 0) {
        setForm(defaultBlueprint)
        setCompanyQuery('')
        setExchangeQuery('')
      }
    }
  }, [currentFormData])

  // Helper untuk mengirim state form lokal kembali ke Zustand global secara aman
  const syncToGlobalStore = (updatedForm) => {
    if (Array.isArray(currentFormData)) {
      const updatedArray = [...currentFormData]
      updatedArray[0] = updatedForm // Hanya perbarui index 0, biarkan index array lainnya aman
      updateGlobalStore('listings', updatedArray)
    } else {
      updateGlobalStore('listings', updatedForm)
    }
  }

  // 3. LOGIKA INTERAKSI INPUT & DROPDOWN RELASIONAL PENCARIAN
  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedForm = { ...form, [name]: value }
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

  const handleSelectExchange = (exchange) => {
    const updatedForm = { ...form, exchangeId: exchange.id }
    setForm(updatedForm)
    setExchangeQuery(exchange.name)
    setShowExchangeDropdown(false)
    syncToGlobalStore(updatedForm)
  }

  // Filter pencarian data lokal
  const filteredCompanies = mockCompanies.filter(c =>
    c.displayName.toLowerCase().includes(companyQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(companyQuery.toLowerCase())
  )

  const filteredExchanges = mockExchanges.filter(e =>
    e.name.toLowerCase().includes(exchangeQuery.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Payload Ready to API:', currentFormData)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-fade-in text-sm text-zinc-300">

      {/* HEADER CONTROLLER */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/listings')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Market Listing' : 'Register New Asset Ticker'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Update exchange identifier and index metadata.' : 'Onboard a new public security onto the registry asset map.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CONTAINER UTAMA DETAILS */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Security Listing Specs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Symbol Ticker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Ticker Symbol <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                name="symbol"
                value={form.symbol || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors uppercase font-mono tracking-wider"
                placeholder="e.g., BBCA, AAPL, TLKM"
              />
            </div>

            {/* Asset Type Dropdown Enum */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Asset Type Classification</label>
              <select
                name="assetType"
                value={form.assetType || 'STOCK'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="STOCK">STOCK</option>
                <option value="ETF">ETF</option>
                <option value="REIT">REIT</option>
                <option value="BOND">BOND</option>
                <option value="MUTUAL_FUND">MUTUAL_FUND</option>
                <option value="CRYPTO">CRYPTO</option>
              </select>
            </div>

            {/* ISIN Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">ISIN Global Code</label>
              <input
                type="text"
                name="isin"
                maxLength={12}
                value={form.isin || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono uppercase"
                placeholder="e.g., US0378331005 (12 chars)"
              />
            </div>

            {/* CUSIP Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">CUSIP Code <span className="text-zinc-600">(US Markets)</span></label>
              <input
                type="text"
                name="cusip"
                value={form.cusip || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="e.g., 037833100"
              />
            </div>

            {/* IPO Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">IPO Inception Date</label>
              <input
                type="date"
                name="ipoDate"
                value={form.ipoDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
              />
            </div>

          </div>

          {/* AREA DATA RELASIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">

            {/* SEARCHABLE DROPDOWN: COMPANY CONNECT */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-zinc-400">
                Relational Company Connect <span className="text-emerald-500">*</span>
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
                  className="w-full pl-9 pr-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="Type to search connected company..."
                />
                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
              </div>

              {showCompanyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-[#0c0c0e] border border-zinc-800 rounded-lg max-h-40 overflow-y-auto shadow-xl divide-y divide-zinc-900">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCompany(c)}
                        className="px-3 py-2 text-xs hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 cursor-pointer flex justify-between items-center"
                      >
                        <span>{c.displayName}</span>
                        <span className="font-mono text-[10px] text-zinc-600 bg-zinc-950 px-1 rounded">{c.symbol}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono">No corporate entities match</div>
                  )}
                </div>
              )}
              {form.companyId && (
                <div className="text-[11px] font-mono text-zinc-500 mt-1">Bound ID: {form.companyId}</div>
              )}
            </div>

            {/* SEARCHABLE DROPDOWN: EXCHANGE CONNECT */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-zinc-400">
                Relational Exchange Connect <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={exchangeQuery}
                  onChange={(e) => {
                    setExchangeQuery(e.target.value)
                    setShowExchangeDropdown(true)
                  }}
                  onFocus={() => setShowExchangeDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="Type to search target stock exchange..."
                />
                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
              </div>

              {showExchangeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-[#0c0c0e] border border-zinc-800 rounded-lg max-h-40 overflow-y-auto shadow-xl divide-y divide-zinc-900">
                  {filteredExchanges.length > 0 ? (
                    filteredExchanges.map(e => (
                      <div
                        key={e.id}
                        onClick={() => handleSelectExchange(e)}
                        className="px-3 py-2 text-xs hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 cursor-pointer flex justify-between items-center"
                      >
                        <span>{e.name}</span>
                        <span className="font-mono text-[10px] text-zinc-600 uppercase">{e.country}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono">No stock exchanges match</div>
                  )}
                </div>
              )}
              {form.exchangeId && (
                <div className="text-[11px] font-mono text-zinc-500 mt-1">Bound ID: {form.exchangeId}</div>
              )}
            </div>

          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/listings')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Listing
          </button>
        </div>

      </form>

      {/* Backdrop overlay handler untuk menutup dropdown carian */}
      {(showCompanyDropdown || showExchangeDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCompanyDropdown(false)
            setShowExchangeDropdown(false)
          }}
        />
      )}
    </div>
  )
}