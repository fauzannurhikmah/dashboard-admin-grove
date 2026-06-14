import { Search, X, Filter, LayoutGrid } from 'lucide-react'

export default function TableFilters({
    searchInput,
    setSearchInput,
    selectedPeriod,
    setSelectedPeriod,
    selectedSector,
    setSelectedSector,
    sectors,
    setPage,
    handleResetFilters,
    activeFiltersCount
}) {
    // Cek apakah filter ini aktif untuk halaman terkait
    const showPeriodFilter = selectedPeriod !== undefined && setSelectedPeriod !== undefined
    const showSectorFilter = selectedSector !== undefined && setSelectedSector !== undefined

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#09090b] border border-zinc-900 rounded-xl p-3.5">
            <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search selalu muncul */}
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

                {/* Filter Period (Opsional) */}
                {showPeriodFilter && (
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
                    </div>
                )}

                {/* Filter Sector (Opsional) */}
                {showSectorFilter && (
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
                                <option key={sector.id} value={sector.id}>{sector.name}</option>
                            ))}
                        </select>
                        <LayoutGrid className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                )}
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
    )
}