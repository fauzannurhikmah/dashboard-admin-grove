import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  Building2, List, TrendingUp, Wallet, DollarSign, BarChart3, LogOut, Menu, X, Code2, FileJson, Sparkles
} from 'lucide-react'
import Toast from '@/components/dashboard/Toast'
import { useFormStore } from '@/store/useFormStore'

// Import Sub-Komponen Modular JSON Editor Sidebar yang baru
import JsonEditorSidebar from '../components/dashboard/JsonEditorSidebar'

// Import Komponen Halaman Form & List Anda
import CompanyList from '../components/company/CompanyList'
import CompanyForm from '../components/company/CompanyForm'
import ListingList from '../components/listing/ListingList'
import ListingForm from '../components/listing/ListingForm'
import IncomeStatementList from '../components/income-statement/IncomeStatementList'
import IncomeStatementForm from '../components/income-statement/IncomeStatementForm'
import BalanceSheetList from '../components/balance-sheet/BalanceSheetList'
import BalanceSheetForm from '../components/balance-sheet/BalanceSheetForm'
import CashFlowList from '../components/cash-flow/CashFlowList'
import CashFlowForm from '../components/cash-flow/CashFlowForm'
import JsonEditorPage from '../components/JsonEditor/JsonEditorPage'
import ListingDetail from '@/components/listing/ListingDetail'
import GroveScore from './GroveScore'
import { GroveLogo } from '@/components/ui/GroveLogo'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [jsonFormVisible, setJsonFormVisible] = useState(false)
  const toast = useFormStore((state) => state.toast)
  const hideToast = useFormStore((state) => state.hideToast)

  // Menentukan apakah halaman saat ini adalah halaman formulir (Create/Edit)
  const isFormPage = [
    '/dashboard/companies/create', '/dashboard/listings/create',
    '/dashboard/income-statements/create', '/dashboard/balance-sheets/create',
    '/dashboard/cash-flows/create'
  ].some(path => location.pathname === path) || location.pathname.includes('/edit')

  // Mengambil kunci form (formKey) aktif berdasarkan URL segmen saat ini
  const getCurrentFormKey = () => {
    if (location.pathname.includes('/companies')) return 'companies'
    if (location.pathname.includes('/listings')) return 'listings'
    if (location.pathname.includes('/income-statements')) return 'income-statements'
    if (location.pathname.includes('/balance-sheets')) return 'balance-sheets'
    if (location.pathname.includes('/cash-flows')) return 'cash-flows'
    return null
  }

  const currentFormKey = getCurrentFormKey()
  const currentRecordId = location.pathname.match(/\/dashboard\/[^/]+\/([^/]+)\/edit$/)?.[1] || null

  const menuItems = [
    { path: '/dashboard/grove-score', label: 'Grove Score', icon: Sparkles },
    { path: '/dashboard/companies', label: 'Company', icon: Building2 },
    { path: '/dashboard/listings', label: 'Listing', icon: List },
    { path: '/dashboard/income-statements', label: 'Income Statement', icon: TrendingUp },
    { path: '/dashboard/balance-sheets', label: 'Balance Sheet', icon: Wallet },
    { path: '/dashboard/cash-flows', label: 'Cash Flow', icon: DollarSign },
    { path: '/dashboard/json-editor', label: 'JSON Editor', icon: FileJson }
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans antialiased text-sm tracking-tight selection:bg-emerald-500/30 selection:text-emerald-400">
      <div className="flex h-screen overflow-hidden">

        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#09090b] border-r border-zinc-900 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
          <div className="h-16 flex items-center px-4 border-b border-zinc-900 justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <GroveLogo className="w-6 h-6 text-emerald-400" />
              {sidebarOpen && <span className="font-semibold text-zinc-100 text-[14px] tracking-tight">Grove Admin</span>}
            </div>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg transition-all duration-150 group relative ${sidebarOpen ? 'px-3 py-2 gap-3 justify-start' : 'p-2 justify-center'} ${location.pathname.startsWith(item.path) ? 'bg-zinc-900 text-emerald-400 font-medium border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                  }`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span className="text-[13px] tracking-normal">{item.label}</span>}
                {location.pathname.startsWith(item.path) && <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-emerald-500 rounded-r-sm" />}
              </button>
            ))}
          </nav>

          <div className="p-2 border-t border-zinc-900 mt-auto">
            <button
              onClick={() => navigate('/login')}
              className={`w-full flex items-center rounded-lg text-zinc-500 hover:bg-red-950/20 hover:text-red-400 transition-all duration-150 ${sidebarOpen ? 'px-3 py-2 gap-3 justify-start' : 'p-2 justify-center'}`}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-zinc-600 group-hover:text-red-400" />
              {sidebarOpen && <span className="text-[13px]">Logout</span>}
            </button>
          </div>
        </aside>

        {/* CONTAINER UTAMA HEADER & CONTENT VIEW */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">

          {/* HEADER TOP BAR */}
          <header className="h-16 bg-[#09090b] border-b border-zinc-900 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all">
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Dashboard</h2>
            </div>

            {isFormPage && (
              <button
                onClick={() => setJsonFormVisible(!jsonFormVisible)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${jsonFormVisible
                  ? 'bg-zinc-900 border-zinc-800 text-emerald-400 shadow-sm'
                  : 'bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Editor</span>
              </button>
            )}
          </header>

          {/* AREA VIEW ROUTING ROUTE */}
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard/grove-score" replace />} />

                {/* Modul Grove Score */}
                <Route path="/grove-score" element={<GroveScore />} />

                {/* Modul Company */}
                <Route path="/companies" element={<CompanyList />} />
                <Route path="/companies/create" element={<CompanyForm />} />
                <Route path="/companies/:id/edit" element={<CompanyForm />} />

                {/* Modul Listing */}
                <Route path="/listings" element={<ListingList />} />
                <Route path="/listings/create" element={<ListingForm />} />
                <Route path="/listings/:id/edit" element={<ListingForm />} />
                <Route path="/listings/:id/detail" element={<ListingDetail />} />

                {/* Modul Income Statement */}
                <Route path="/income-statements" element={<IncomeStatementList />} />
                <Route path="/income-statements/create" element={<IncomeStatementForm />} />
                <Route path="/income-statements/:id/edit" element={<IncomeStatementForm />} />

                {/* Modul Balance Sheet */}
                <Route path="/balance-sheets" element={<BalanceSheetList />} />
                <Route path="/balance-sheets/create" element={<BalanceSheetForm />} />
                <Route path="/balance-sheets/:id/edit" element={<BalanceSheetForm />} />

                {/* Modul Cash Flow */}
                <Route path="/cash-flows" element={<CashFlowList />} />
                <Route path="/cash-flows/create" element={<CashFlowForm />} />
                <Route path="/cash-flows/:id/edit" element={<CashFlowForm />} />

                {/* Modul JSON Editor */}
                <Route path="/json-editor" element={<JsonEditorPage />} />
              </Routes>
            </main>

            {/* CALL MODULAR SIDEBAR JSON EDITOR COMPONENT */}
            {isFormPage && jsonFormVisible && (
              <JsonEditorSidebar formKey={currentFormKey} recordId={currentRecordId} />
            )}
          </div>
        </div>

      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
