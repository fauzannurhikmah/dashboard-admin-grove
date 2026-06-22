import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Search, Sparkles, HelpCircle, Layers } from 'lucide-react'

// Metrics definition for GROVE
const groveMetrics = [
  { letter: 'G', label: 'Growth Earnings', desc: 'Analisis pertumbuhan laba dan performa pendapatan emiten.' },
  { letter: 'R', label: 'Relative Strength', desc: 'Kekuatan relatif harga saham dibandingkan sektor/pasar.' },
  { letter: 'O', label: 'Orientasi Trend', desc: 'Arah trend pergerakan saham jangka menengah hingga panjang.' },
  { letter: 'V', label: 'Valuation', desc: 'Penilaian valuasi harga saham wajar berdasarkan rasio keuangan.' },
  { letter: 'E', label: 'Endorsement', desc: 'Aksi akumulasi institusi asing dan domestik serta bandarmologi.' }
]

// Static sample data based on the requested visual
const initialEmitens = [
  {
    rank: 1,
    symbol: 'AALI',
    name: 'Astra Agro Lestari Tbk.',
    sector: 'Barang Konsumen Primer',
    price: 6100,
    change: -1.21,
    g: 89,
    r: 98,
    o: 93,
    v: 94,
    e: 82,
    score: 90,
    stance: 'Overweight'
  },
  {
    rank: 2,
    symbol: 'ACES',
    name: 'Aspirasi Hidup Indonesia Tbk.',
    sector: 'Barang Konsumen Non-Primer',
    price: 348,
    change: 0.58,
    g: 92,
    r: 98,
    o: 82,
    v: 76,
    e: 82,
    score: 90,
    stance: 'Overweight'
  },
  {
    rank: 3,
    symbol: 'AADI',
    name: 'Adaro Andalan Indonesia Tbk.',
    sector: 'Energi',
    price: 8650,
    change: 7.45,
    g: 86,
    r: 95,
    o: 81,
    v: 78,
    e: 95,
    score: 87,
    stance: 'Overweight'
  },
  {
    rank: 4,
    symbol: 'AGAR',
    name: 'Asia Sejahtera Mina Tbk.',
    sector: 'Barang Konsumen Primer',
    price: 238,
    change: 9.17,
    g: 87,
    r: 80,
    o: 85,
    v: 69,
    e: 86,
    score: 85,
    stance: 'Overweight'
  },
  {
    rank: 5,
    symbol: 'ACST',
    name: 'Acset Indonusa Tbk.',
    sector: 'Infrastruktur',
    price: 84,
    change: 0.00,
    g: 87,
    r: 83,
    o: 82,
    v: 62,
    e: 82,
    score: 84,
    stance: 'Overweight'
  },
  {
    rank: 6,
    symbol: 'BBCA',
    name: 'Bank Central Asia Tbk.',
    sector: 'Keuangan',
    price: 10450,
    change: 1.46,
    g: 82,
    r: 85,
    o: 88,
    v: 72,
    e: 85,
    score: 82,
    stance: 'Overweight'
  },
  {
    rank: 7,
    symbol: 'TLKM',
    name: 'Telkom Indonesia Tbk.',
    sector: 'Infrastruktur',
    price: 2890,
    change: -1.03,
    g: 75,
    r: 78,
    o: 80,
    v: 68,
    e: 76,
    score: 75,
    stance: 'Neutral'
  },
  {
    rank: 8,
    symbol: 'ADRO',
    name: 'Adaro Energy Indonesia Tbk.',
    sector: 'Energi',
    price: 3750,
    change: -0.80,
    g: 78,
    r: 72,
    o: 80,
    v: 71,
    e: 74,
    score: 75,
    stance: 'Neutral'
  },
  {
    rank: 9,
    symbol: 'INCO',
    name: 'Vale Indonesia Tbk.',
    sector: 'Energi',
    price: 3820,
    change: 1.87,
    g: 72,
    r: 68,
    o: 75,
    v: 60,
    e: 70,
    score: 69,
    stance: 'Neutral'
  },
  {
    rank: 10,
    symbol: 'UNVR',
    name: 'Unilever Indonesia Tbk.',
    sector: 'Barang Konsumen Primer',
    price: 2200,
    change: -2.65,
    g: 62,
    r: 58,
    o: 60,
    v: 55,
    e: 64,
    score: 60,
    stance: 'Underweight'
  },
  {
    rank: 11,
    symbol: 'GOTO',
    name: 'GoTo Gojek Tokopedia Tbk.',
    sector: 'Teknologi',
    price: 62,
    change: -4.62,
    g: 50,
    r: 45,
    o: 52,
    v: 48,
    e: 55,
    score: 50,
    stance: 'Underweight'
  }
]

export default function GroveScore() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStance, setSelectedStance] = useState('All')
  const [selectedSector, setSelectedSector] = useState('All')

  // Filter emiten based on search input, stance, and sector
  const filteredEmitens = initialEmitens.filter((e) => {
    const matchesSearch =
      e.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStance = selectedStance === 'All' || e.stance === selectedStance
    const matchesSector = selectedSector === 'All' || e.sector === selectedSector
    return matchesSearch && matchesStance && matchesSector
  })

  // Get unique sectors for filters
  const sectors = ['All', ...new Set(initialEmitens.map((e) => e.sector))]

  // Format currency output
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
      .format(val)
      .replace('Rp', 'Rp ')
  }

  // Determine stance styling
  const getStanceClass = (stance) => {
    switch (stance) {
      case 'Overweight':
        return 'text-[11px] font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full'
      case 'Neutral':
        return 'text-[11px] font-semibold text-amber-400 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full'
      case 'Underweight':
        return 'text-[11px] font-semibold text-rose-400 bg-rose-500/5 border border-rose-500/20 px-3 py-1 rounded-full'
      default:
        return 'text-[11px] font-semibold text-zinc-400 bg-zinc-500/5 border border-zinc-500/20 px-3 py-1 rounded-full'
    }
  }

  // Score display helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 65) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
      
      {/* HEADER SECTION */}
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Algorithmic Scoring</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Grove Score Registry</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Emiten score evaluation breakdown based on Growth, Strength, Trend, Valuation, and Endorsement metrics.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">Last updated: 14:30 WIB</span>
        </div>
      </div>

      {/* GROVE SCORE EXPLANATION GRID (IMAGE 1) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {groveMetrics.map((item, idx) => (
          <div
            key={item.letter}
            className="group relative bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
          >
            {/* Top Green Accent Indicator */}
            <div className="h-1 w-full bg-[#5cb38d] opacity-90" />
            
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              {/* Big Letter Display */}
              <span className="text-[84px] font-bold text-[#5cb38d] tracking-normal select-none leading-none pt-2">
                {item.letter}
              </span>
              
              {/* Metric Title */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-[11px] text-zinc-500 leading-normal line-clamp-3">
                  {item.desc}
                </p>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute right-2 bottom-2 text-zinc-900 font-bold text-5xl opacity-5 pointer-events-none select-none">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#09090b] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-800 transition-colors"
            placeholder="Cari emiten atau kode..."
          />
          <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sector Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Sektor:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-[#09090b] border border-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 cursor-pointer w-full sm:w-auto"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'All' ? 'Semua Sektor' : sec}
                </option>
              ))}
            </select>
          </div>

          {/* Stance Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Stance:</span>
            <select
              value={selectedStance}
              onChange={(e) => setSelectedStance(e.target.value)}
              className="bg-[#09090b] border border-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-800 cursor-pointer w-full sm:w-auto"
            >
              <option value="All">Semua Stance</option>
              <option value="Overweight">Overweight</option>
              <option value="Neutral">Neutral</option>
              <option value="Underweight">Underweight</option>
            </select>
          </div>
        </div>
      </div>

      {/* EMITEN REGISTRY TABLE (IMAGE 2) */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#09090b] border-b border-zinc-900">
              <tr>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[5%]">#</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[25%]">SAHAM</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[12%]">HARGA</th>
                <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">G</th>
                <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">R</th>
                <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">O</th>
                <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">V</th>
                <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">E</th>
                <th className="px-5 py-4 text-center text-[11px] font-semibold text-zinc-200 uppercase tracking-wider w-[10%]">SCORE</th>
                <th className="px-5 py-4 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[10%]">STANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredEmitens.length > 0 ? (
                filteredEmitens.map((emiten) => (
                  <tr key={emiten.symbol} className="hover:bg-[#09090b]/40 transition-colors group">
                    {/* Rank */}
                    <td className="px-5 py-4 font-mono text-zinc-600 text-xs">{emiten.rank}</td>
                    
                    {/* Saham / Company Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Custom visual mockup logo circle with company ticker letters */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-zinc-800 text-emerald-400 select-none shadow-inner flex-shrink-0">
                          {emiten.symbol.slice(0, 2)}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-zinc-100 text-[13px] tracking-wide block truncate">{emiten.symbol}</span>
                          <span className="text-[10px] text-zinc-500 font-normal truncate block">
                            {emiten.name} <span className="text-zinc-600">·</span> {emiten.sector}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Harga */}
                    <td className="px-5 py-4 text-right">
                      <div className="font-semibold text-zinc-100 text-[13px]">{formatCurrency(emiten.price)}</div>
                      <div className={`text-[10px] font-medium flex items-center justify-end gap-1 mt-0.5 ${
                        emiten.change > 0 ? 'text-emerald-400' : emiten.change < 0 ? 'text-rose-400' : 'text-zinc-500'
                      }`}>
                        {emiten.change > 0 ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : emiten.change < 0 ? (
                          <TrendingDown className="w-2.5 h-2.5" />
                        ) : (
                          <Minus className="w-2.5 h-2.5" />
                        )}
                        <span>
                          {emiten.change > 0 ? '+' : ''}
                          {emiten.change.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Component Scores (G, R, O, V, E) */}
                    {['g', 'r', 'o', 'v', 'e'].map((key) => (
                      <td key={key} className="px-4 py-4 text-center">
                        <div className={`text-base font-bold tracking-tight ${getScoreColor(emiten[key])}`}>
                          {emiten[key]}
                        </div>
                        <div className="text-[9px] font-semibold text-zinc-600 mt-0.5 uppercase">
                          {key}
                        </div>
                      </td>
                    ))}

                    {/* Score */}
                    <td className="px-5 py-4 text-center">
                      <div className="inline-block relative">
                        <span className={`text-base font-black tracking-tight ${getScoreColor(emiten.score)}`}>
                          {emiten.score}
                        </span>
                        {/* Underline matching the score color */}
                        <div className={`h-[2px] w-5 mx-auto mt-0.5 rounded-full ${
                          emiten.score >= 80 ? 'bg-emerald-400' : emiten.score >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                      </div>
                    </td>

                    {/* Stance badge */}
                    <td className="px-5 py-4 text-center">
                      <span className={getStanceClass(emiten.stance)}>
                        {emiten.stance}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">
                    Tidak ada emiten yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
