import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, BarChart3, Eye, Search, X, LayoutGrid } from 'lucide-react'
import { useGetListings } from '@/hooks/useListings'
import { useGetSectors } from '@/hooks/useSectors'
import TableFilters from '@/components/dashboard/TableFilters'
import Pagination from '@/components/dashboard/Pagination'
import ListingDetail from './ListingDetail'

export default function ListingList() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const pageSize = 20

  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [selectedSector, setSelectedSector] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchInput])

  const [activeListing, setActiveListing] = useState(null)

  const { data: sectorsData } = useGetSectors()
  const sectors = sectorsData || []

  const { data, isLoading, isError, error } = useGetListings(
    page,
    pageSize,
    debouncedKeyword,
    selectedSector
  )

  const listings = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const activeFiltersCount = [
    debouncedKeyword !== '',
    selectedSector !== ''
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedKeyword('')
    setSelectedSector('')
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Listings</h1>
          <p className="text-zinc-500 text-xs mt-1.5">Manage public exchange tickers and security codes.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/listings/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Listing
        </button>
      </div>

      {/* Catatan: Filter period dihapus dari sini. 
        Pastikan komponen TableFilters lu sudah dinamis atau buat versi 'Simple' 
        kalau tidak mau passing props period yang kosong.
      */}
      <TableFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        sectors={sectors}
        setPage={setPage}
        handleResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
      // Props 'selectedPeriod' dan 'setSelectedPeriod' sengaja dikosongkan/tidak dipassing
      />

      {isLoading && (
        <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading market registry...
        </div>
      )}

      {isError && (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load: {error?.response?.data?.message || error.message}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#0c0c0e] border-b border-zinc-900">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[25%]">Company</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Symbol</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Exchange</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Asset Type</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-[#0c0c0e]/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {listing.company?.logoUrl ? (
                              <img src={listing.company.logoUrl} alt={listing.company.displayName} className="w-full h-full object-contain p-1" />
                            ) : (
                              <BarChart3 className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-zinc-100 text-[13px] block truncate">{listing.company?.displayName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{listing.company?.legalName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-300 text-[13px] tracking-wider">{listing.symbol}</td>
                      <td className="px-5 py-4 text-zinc-400 text-[13px]">
                        <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-medium text-zinc-300">
                          {listing.exchange?.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 tracking-wider">
                          {listing.assetType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setActiveListing(listing)} className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">No listings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemsCount={listings.length}
            onPageChange={(targetPage) => setPage(targetPage)}
          />
        </div>
      )}

      {activeListing && (
        <ListingDetail listing={activeListing} onClose={() => setActiveListing(null)} />
      )}
    </div>
  )
}