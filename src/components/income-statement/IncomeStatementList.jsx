import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, TrendingUp, Eye, Search, X, Filter, LayoutGrid } from 'lucide-react'
import { useGetIncomeStatements } from '@/hooks/useIncomeStatements'
import { useGetSectors } from '@/hooks/useSectors'
import Pagination from '@/components/dashboard/Pagination'
import { formatCurrency } from '@/utils/formatters'
import IncomeStatementDetail from './IncomeStatementDetail'

export default function IncomeStatementList() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const pageSize = 20

  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedSector, setSelectedSector] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput)
    }, 500)
    return () => {
      clearTimeout(handler)
    }
  }, [searchInput])

  const [activeDetailId, setActiveDetailId] = useState(null)

  const { data: sectorsData } = useGetSectors()
  const sectors = sectorsData || []

  const { data, isLoading, isError, error } = useGetIncomeStatements(
    page,
    pageSize,
    debouncedKeyword,
    selectedPeriod,
    selectedSector
  )

  const statements = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const activeFiltersCount = [
    debouncedKeyword !== '',
    selectedPeriod !== '',
    selectedSector !== ''
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedKeyword('')
    setSelectedPeriod('')
    setSelectedSector('')
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Income Statements
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Track and evaluate corporate earnings, gross margins, operational overhead expenditures, and net yield maps.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/income-statements/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Statement
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#09090b] border border-zinc-900 rounded-xl p-3.5">

        <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-8 py-1.5 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
              placeholder="Filter by company name or profile details..."
            />
            <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />

            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setPage(1); }}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value)
                setPage(1)
              }}
              className="w-full pl-8 pr-8 py-1.5 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Periods</option>
              <option value="ANNUAL">ANNUAL</option>
              <option value="Q1">Q1 (Quarter 1)</option>
              <option value="Q2">Q2 (Quarter 2)</option>
              <option value="Q3">Q3 (Quarter 3)</option>
              <option value="Q4">Q4 (Quarter 4)</option>
              <option value="TTM">TTM (Trailing 12M)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5 pointer-events-none" />

            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-zinc-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value)
                setPage(1)
              }}
              className="w-full pl-8 pr-8 py-1.5 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer truncate"
            >
              <option value="">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5 pointer-events-none" />

            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-zinc-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-zinc-500 hover:text-red-400 font-medium px-2 py-1 transition-colors rounded border border-transparent hover:border-red-950/20 hover:bg-red-950/10"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {isLoading && (
        <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading synchronized income spreadsheets...
        </div>
      )}

      {isError && (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load statement database registries: {error?.response?.data?.message || error.message}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">

                <thead className="bg-[#0c0c0e] border-b border-zinc-900">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[25%]">
                      Company
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Reporting Period
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Filing Closing Date
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Gross Profit
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Net Income
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-900">
                  {statements.length > 0 ? (
                    statements.map((statement) => (
                      <tr
                        key={statement.id}
                        className="hover:bg-[#0c0c0e]/60 transition-colors duration-100 group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {statement.company?.logoUrl ? (
                                <img src={statement.company.logoUrl} alt={statement.company.displayName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-zinc-500" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-zinc-200 text-[13px] tracking-normal truncate">
                                {statement.company?.displayName || 'Unknown Entity'}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                                {statement.company?.legalName || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-300 text-[13px] font-medium">
                              FY {statement.fiscalYear}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 tracking-wider">
                              {statement.period}
                            </span>
                            {statement.fiscalQuarter && (
                              <span className="text-[11px] text-zinc-500 font-mono">
                                Q{statement.fiscalQuarter}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-zinc-500 font-mono text-xs">
                          {statement.periodEndDate ? statement.periodEndDate.split('T')[0] : '—'}
                        </td>

                        <td className="px-5 py-4 text-right text-zinc-300 font-mono text-[13px]">
                          {formatCurrency(statement.revenue, statement.currency)}
                        </td>

                        <td className="px-5 py-4 text-right text-zinc-400 font-mono text-[13px]">
                          {formatCurrency(statement.grossProfit, statement.currency)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-emerald-400 font-mono text-[13px] font-medium">
                            {formatCurrency(statement.netIncome, statement.currency)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setActiveDetailId(statement.id)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                              title="View Full Ledger Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/income-statements/${statement.id}/edit`)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all shadow-sm"
                              title="Edit Statement"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Delete Statement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">
                        No financial statements matched your current search filters.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemsCount={statements.length}
            onPageChange={(targetPage) => setPage(targetPage)}
          />

        </div>
      )}

      {activeDetailId && (
        <IncomeStatementDetail
          id={activeDetailId}
          onClose={() => setActiveDetailId(null)}
        />
      )}

    </div>
  )
}