import { Fragment, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  LineChart,
  Database,
  BarChart3,
  TrendingUp,
  DollarSign,
  Wallet,
  MoreHorizontal,
} from "lucide-react";
import { useGetListingDetail, useSyncStockPrice } from "@/hooks/useListings";
import {
  useGetIncomeStatementsByCompany,
  useSyncIncomeStatements,
} from "@/hooks/useIncomeStatements";
import { useFormStore } from "@/store/useFormStore";
import { formatAbbreviated } from "@/utils/formatters";
import StockChart from "../dashboard/StockChart";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useFormStore((state) => state.showToast);

  // State untuk tab keuangan lama
  const [activeTab, setActiveTab] = useState("Net Income");
  const [activeFinancialTab, setActiveFinancialTab] = useState("income");
  const [chartKey, setChartKey] = useState(0);
  const [isCashFlowLoading, setIsCashFlowLoading] = useState(false);
  const [isBalanceSheetLoading, setIsBalanceSheetLoading] = useState(false);

  // State untuk tab utama & dropdown lebih
  const [activeMainTab, setActiveMainTab] = useState("financials");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: listing, isLoading } = useGetListingDetail(id);
  const {
    data: financials = [],
    isFetching: isFetchingFinancials,
    refetch: refetchFinancials,
  } = useGetIncomeStatementsByCompany(listing?.company?.id);

  const syncPriceMutation = useSyncStockPrice(id, listing?.symbol);
  const syncIncomeStatementMutation = useSyncIncomeStatements(
    id,
    listing?.company?.id,
  );

  const years = useMemo(() => {
    return [
      ...new Set(financials.map((financial) => financial.fiscalYear)),
    ].sort((a, b) => b - a);
  }, [financials]);

  const cashFlowRows = useMemo(
    () => [
      {
        group: "Operating Activities",
        rows: [
          ["Net Income Start", "Lorem ipsum", "Dolor sit amet", "Consectetur"],
          [
            "Depreciation & Amortization",
            "Adipiscing elit",
            "Sed do eiusmod",
            "Tempor incididunt",
          ],
          [
            "Stock-Based Compensation",
            "Ut labore",
            "Et dolore",
            "Magna aliqua",
          ],
          [
            "Change In Working Capital",
            "Lorem data",
            "Demo only",
            "Placeholder",
          ],
          ["Change In Receivables", "Ipsum value", "Static row", "No backend"],
          ["Change In Inventory", "Dolor value", "Demo row", "Frontend only"],
          ["Change In Payables", "Lorem text", "Ipsum text", "Dummy data"],
          ["Other Operating Activities", "Alpha", "Beta", "Gamma"],
          ["Net Cash From Operations", "100.00", "200.00", "300.00"],
        ],
      },
      {
        group: "Investing Activities",
        rows: [
          ["Capital Expenditures", "-50.00", "-60.00", "-70.00"],
          ["Acquisitions", "Lorem ipsum", "Dolor sit amet", "Consectetur"],
          [
            "Purchase Of Investments",
            "Adipiscing elit",
            "Sed do eiusmod",
            "Tempor incididunt",
          ],
          ["Sale Of Investments", "Ut labore", "Et dolore", "Magna aliqua"],
          [
            "Other Investing Activities",
            "Lorem data",
            "Demo only",
            "Placeholder",
          ],
          ["Net Cash From Investing", "-80.00", "-90.00", "-100.00"],
        ],
      },
      {
        group: "Financing Activities",
        rows: [
          ["Debt Issuance", "Lorem ipsum", "Dolor sit amet", "Consectetur"],
          [
            "Debt Repayment",
            "Adipiscing elit",
            "Sed do eiusmod",
            "Tempor incididunt",
          ],
          ["Common Stock Issuance", "Ut labore", "Et dolore", "Magna aliqua"],
          ["Common Stock Repurchase", "Lorem data", "Demo only", "Placeholder"],
          ["Dividends Paid", "Ipsum value", "Static row", "No backend"],
          [
            "Other Financing Activities",
            "Dolor value",
            "Demo row",
            "Frontend only",
          ],
          ["Net Cash From Financing", "10.00", "20.00", "30.00"],
        ],
      },
      {
        group: "Summary",
        rows: [
          ["Net Change In Cash", "5.00", "15.00", "25.00"],
          ["Cash Beginning Period", "1000.00", "1100.00", "1200.00"],
          ["Cash End Period", "1005.00", "1115.00", "1225.00"],
          ["Free Cash Flow", "50.00", "60.00", "70.00"],
        ],
      },
    ],
    [],
  );

  const handleSyncPrice = () => {
    syncPriceMutation.mutate(null, {
      onSuccess: () => {
        showToast("Stock price synchronized successfully", "success");
        setChartKey((currentKey) => currentKey + 1);
      },
      onError: () => showToast("Failed to sync price", "error"),
    });
  };

  const handleSyncCashFlow = () => {
    setIsCashFlowLoading(true);
    setTimeout(() => {
      setIsCashFlowLoading(false);
      showToast("Cash flow data refreshed", "success");
    }, 2000);
  };

  const handleSyncBalanceSheet = () => {
    setIsBalanceSheetLoading(true);
    setTimeout(() => {
      setIsBalanceSheetLoading(false);
      showToast("Balance sheet data refreshed", "success");
    }, 2000);
  };

  const handleSyncIncomeStatements = () => {
    syncIncomeStatementMutation.mutate(null, {
      onSuccess: async () => {
        await refetchFinancials();
        showToast("Income statement synchronized successfully", "success");
      },
      onError: () => showToast("Failed to sync income statement", "error"),
    });
  };

  if (isLoading || !listing) {
    return (
      <div className="p-10 text-center text-zinc-500 font-mono">Loading...</div>
    );
  }

  const isSyncingPrice = syncPriceMutation.isPending;
  const isSyncingIncomeStatement = syncIncomeStatementMutation.isPending;
  const isFinancialOverviewLoading =
    isSyncingIncomeStatement || isFetchingFinancials;
  const actionButtonClassName = (isSyncing) => `
        relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2
        text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300
        ${
          isSyncing
            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/40 cursor-not-allowed"
            : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-400"
        }
    `;

  const mainTabs = [
    // { id: "stream", label: "Stream" },
    { id: "keystat", label: "Key Stat" },
    // { id: "analysis", label: "Analysis" },
    { id: "financials", label: "Financials" },
    // { id: "insider", label: "Insider" },
    { id: "corpaction", label: "Corp Action" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in pb-12 text-sm text-zinc-300">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4 border-b border-zinc-900 pb-5">
        <button
          onClick={() => navigate("/dashboard/listings")}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            {listing.company?.logoUrl ? (
              <img
                src={listing.company.logoUrl}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <BarChart3 className="h-5 w-5 text-zinc-600" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-zinc-100">
              {listing.company?.displayName}
            </h1>
            <p className="truncate text-xs font-mono text-zinc-500">
              {listing.symbol} - {listing.exchange?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Buttons */}
      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 mb-6">
        <button
          onClick={handleSyncBalanceSheet}
          className={actionButtonClassName(isBalanceSheetLoading)}
        >
          {isBalanceSheetLoading && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
          )}
          <RefreshCw
            className={`h-3.5 w-3.5 ${isBalanceSheetLoading ? "animate-spin text-emerald-500/40" : ""}`}
          />
          {isBalanceSheetLoading ? "Syncing..." : "Sync Balance Sheet"}
        </button>
        <button
          onClick={handleSyncCashFlow}
          className={actionButtonClassName(false)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Cash Flow
        </button>
        <button
          onClick={handleSyncIncomeStatements}
          disabled={isSyncingIncomeStatement}
          className={actionButtonClassName(isSyncingIncomeStatement)}
        >
          {isSyncingIncomeStatement && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
          )}
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncingIncomeStatement ? "animate-spin text-emerald-500/40" : ""}`}
          />
          {isSyncingIncomeStatement ? "Syncing..." : "Sync Income Statement"}
        </button>

        <button
          onClick={handleSyncPrice}
          disabled={isSyncingPrice}
          className={actionButtonClassName(isSyncingPrice)}
        >
          {isSyncingPrice && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
          )}
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncingPrice ? "animate-spin text-emerald-500/40" : ""}`}
          />
          {isSyncingPrice ? "Syncing..." : "Sync Price"}
        </button>
      </div>

      {/* Price Analytics */}
      <div className="mb-6 rounded-xl border border-zinc-900 bg-[#09090b] p-6">
        <div className="mb-4 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Price Analytics
          </h3>
        </div>
        <StockChart
          key={chartKey}
          symbol={listing.symbol}
          isSyncing={isSyncingPrice}
        />
      </div>

      {/* MAIN TABS NAVIGATION */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-zinc-900 bg-[#09090b] p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeMainTab === tab.id
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* More Icon Dropdown */}
          <div className="relative ml-auto shrink-0" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {isMoreOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-900 bg-[#09090b] p-2 shadow-2xl z-50 animate-fade-in">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMainTab(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-all ${
                      activeMainTab === tab.id
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeMainTab === "financials" ? (
        <>
          {/* tabs detail (Sub-tabs untuk Financials) */}
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-zinc-900 bg-[#09090b] p-2">
            {[
              { id: "income", label: "Income Statements" },
              { id: "cashflow", label: "Cash Flow" },
              { id: "balance", label: "Balance Sheet" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFinancialTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all w-full ${activeFinancialTab === tab.id ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* end tabs detail */}

          {/* income statements */}
          {activeFinancialTab === "income" && (
            <>
              <h3 className="text-lg font-bold text-zinc-300 mb-6">
                Income Statements
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
                <div className="md:col-span-1">
                  <div className="space-y-4 rounded-xl border border-zinc-900 bg-[#09090b] p-6">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Key Statistics
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs text-zinc-500">
                          Asset Type
                        </span>
                        <span className="text-xs font-mono text-zinc-200">
                          {listing.assetType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-zinc-500">Exchange</span>
                        <span className="text-xs font-mono text-zinc-200">
                          {listing.exchange?.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="relative rounded-xl border border-zinc-900 bg-[#09090b] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Financial Overview
                      </h3>
                      <div className="flex items-center gap-2 rounded-full border border-zinc-900 bg-zinc-900/50 p-1">
                        {["Net Income", "EPS", "Revenue"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${activeTab === tab ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`overflow-x-auto pb-2 transition-opacity duration-300 ${isFinancialOverviewLoading ? "opacity-30" : "opacity-100"}`}
                    >
                      <table className="w-full border-collapse text-xs font-mono text-zinc-400">
                        <thead>
                          <tr className="border-b border-zinc-900 text-left text-zinc-500">
                            <th className="sticky left-0 z-10 w-32 bg-[#09090b] py-3">
                              Period
                            </th>
                            {years.map((year) => (
                              <th key={year} className="px-6 py-3 text-right">
                                {year}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                            <tr
                              key={quarter}
                              className="border-b border-zinc-900/40"
                            >
                              <td className="sticky left-0 z-10 bg-[#09090b] py-3 font-medium text-zinc-300">
                                {quarter}
                              </td>
                              {years.map((year) => {
                                const data = financials.find(
                                  (financial) =>
                                    financial.fiscalYear === year &&
                                    financial.period === quarter,
                                );
                                const value =
                                  activeTab === "Net Income"
                                    ? data?.netIncome
                                    : activeTab === "Revenue"
                                      ? data?.revenue
                                      : data?.eps;

                                return (
                                  <td
                                    key={year}
                                    className="whitespace-nowrap px-6 py-3 text-right text-zinc-200"
                                  >
                                    {value ? formatAbbreviated(value) : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {isFinancialOverviewLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[#09090b]/80 backdrop-blur-sm">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80">
                          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
                          <TrendingUp className="relative h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-xs font-mono tracking-wider text-zinc-500">
                          {isSyncingIncomeStatement
                            ? "Syncing financial data..."
                            : "Refreshing financial overview..."}
                        </p>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((index) => (
                            <div
                              key={index}
                              className="h-1 w-1 rounded-full bg-emerald-500/60 animate-bounce"
                              style={{ animationDelay: `${index * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {/* end income statements */}

          {/* cash flow */}
          {activeFinancialTab === "cashflow" && (
            <>
              <h3 className="text-lg font-bold text-zinc-300 mb-6">
                Cash Flow
              </h3>
              <div className="mb-6 rounded-xl border border-zinc-900 bg-[#09090b] p-6 relative overflow-hidden">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Cash Flow Overview
                    </h3>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-600">
                    Demo table
                  </p>
                </div>

                <div
                  className={`overflow-x-auto pb-2 transition-opacity duration-300 ${
                    isCashFlowLoading ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <table className="w-full border-collapse text-xs font-mono text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-900 text-left text-zinc-500">
                        <th className="sticky left-0 z-10 w-32 bg-[#09090b] py-3">
                          Field
                        </th>
                        {["Q1", "Q2", "Q3"].map((period) => (
                          <th key={period} className="px-6 py-3 text-right">
                            {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cashFlowRows.map((section) => (
                        <Fragment key={section.group}>
                          <tr className="border-b border-zinc-900/60 bg-zinc-950/40">
                            <td
                              colSpan={4}
                              className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400"
                            >
                              {section.group}
                            </td>
                          </tr>
                          {section.rows.map((row) => (
                            <tr
                              key={row[0]}
                              className="border-b border-zinc-900/40"
                            >
                              <td className="sticky left-0 z-10 bg-[#09090b] py-3 font-medium text-zinc-300">
                                {row[0]}
                              </td>
                              {row.slice(1).map((value) => (
                                <td
                                  key={value}
                                  className="whitespace-nowrap px-6 py-3 text-right text-zinc-200"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isCashFlowLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[#09090b]/80 backdrop-blur-sm">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
                      <DollarSign className="relative h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-xs font-mono tracking-wider text-zinc-500">
                      Refreshing cash flow data...
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="h-1 w-1 rounded-full bg-emerald-500/60 animate-bounce"
                          style={{ animationDelay: `${index * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* end cash flow */}

          {/* balance sheet */}
          {activeFinancialTab === "balance" && (
            <>
              <h3 className="text-lg font-bold text-zinc-300 mb-6">
                Balance Sheet
              </h3>
              <div className="mb-6 rounded-xl border border-zinc-900 bg-[#09090b] p-6 relative overflow-hidden">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Balance Sheet Overview
                    </h3>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-600">
                    Demo table
                  </p>
                </div>
                <div
                  className={`overflow-x-auto pb-2 transition-opacity duration-300 ${
                    isBalanceSheetLoading ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <table className="w-full border-collapse text-xs font-mono text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-900 text-left text-zinc-500">
                        <th className="sticky left-0 z-10 w-56 bg-[#09090b] py-3">
                          Field
                        </th>
                        {["FY 2024", "FY 2025", "FY 2026"].map((period) => (
                          <th key={period} className="px-6 py-3 text-right">
                            {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          group: "Current Assets",
                          rows: [
                            [
                              "Cash",
                              "Lorem ipsum",
                              "Dolor sit amet",
                              "Consectetur",
                            ],
                            [
                              "Short-Term Investments",
                              "Adipiscing elit",
                              "Sed do eiusmod",
                              "Tempor incididunt",
                            ],
                            [
                              "Accounts Receivable",
                              "Ut labore",
                              "Et dolore",
                              "Magna aliqua",
                            ],
                            [
                              "Inventory",
                              "Lorem data",
                              "Demo only",
                              "Placeholder",
                            ],
                            [
                              "Other Current Assets",
                              "Ipsum value",
                              "Static row",
                              "No backend",
                            ],
                            [
                              "Total Current Assets",
                              "100.00",
                              "200.00",
                              "300.00",
                            ],
                          ],
                        },
                        {
                          group: "Non-Current Assets",
                          rows: [
                            [
                              "Property, Plant & Equipment",
                              "50.00",
                              "60.00",
                              "70.00",
                            ],
                            [
                              "Intangible Assets",
                              "Lorem ipsum",
                              "Dolor sit amet",
                              "Consectetur",
                            ],
                            [
                              "Goodwill",
                              "Adipiscing elit",
                              "Sed do eiusmod",
                              "Tempor incididunt",
                            ],
                            [
                              "Long-Term Investments",
                              "Ut labore",
                              "Et dolore",
                              "Magna aliqua",
                            ],
                            [
                              "Other Non-Current Assets",
                              "Lorem data",
                              "Demo only",
                              "Placeholder",
                            ],
                            [
                              "Total Non-Current Assets",
                              "400.00",
                              "500.00",
                              "600.00",
                            ],
                          ],
                        },
                        {
                          group: "Current Liabilities",
                          rows: [
                            [
                              "Short-Term Debt",
                              "Lorem ipsum",
                              "Dolor sit amet",
                              "Consectetur",
                            ],
                            [
                              "Accounts Payable",
                              "Adipiscing elit",
                              "Sed do eiusmod",
                              "Tempor incididunt",
                            ],
                            [
                              "Deferred Revenue",
                              "Ut labore",
                              "Et dolore",
                              "Magna aliqua",
                            ],
                            [
                              "Other Current Liabilities",
                              "Lorem data",
                              "Demo only",
                              "Placeholder",
                            ],
                            [
                              "Total Current Liabilities",
                              "80.00",
                              "90.00",
                              "100.00",
                            ],
                          ],
                        },
                        {
                          group: "Non-Current Liabilities",
                          rows: [
                            [
                              "Long-Term Debt",
                              "Lorem ipsum",
                              "Dolor sit amet",
                              "Consectetur",
                            ],
                            [
                              "Deferred Tax Liabilities",
                              "Adipiscing elit",
                              "Sed do eiusmod",
                              "Tempor incididunt",
                            ],
                            [
                              "Other Non-Current Liabilities",
                              "Ut labore",
                              "Et dolore",
                              "Magna aliqua",
                            ],
                            [
                              "Total Non-Current Liabilities",
                              "110.00",
                              "120.00",
                              "130.00",
                            ],
                          ],
                        },
                        {
                          group: "Equity",
                          rows: [
                            [
                              "Common Stock",
                              "Lorem data",
                              "Demo only",
                              "Placeholder",
                            ],
                            [
                              "Additional Paid In Capital",
                              "Ipsum value",
                              "Static row",
                              "No backend",
                            ],
                            [
                              "Retained Earnings",
                              "1000.00",
                              "1100.00",
                              "1200.00",
                            ],
                            ["Treasury Stock", "-20.00", "-30.00", "-40.00"],
                            ["Other Equity", "Alpha", "Beta", "Gamma"],
                            [
                              "Minority Interest Equity",
                              "12.00",
                              "14.00",
                              "16.00",
                            ],
                            ["Total Equity", "1500.00", "1600.00", "1700.00"],
                          ],
                        },
                        {
                          group: "Derived",
                          rows: [
                            ["Book Value Per Share", "1.20", "1.35", "1.50"],
                            ["Net Debt", "200.00", "210.00", "220.00"],
                            ["Working Capital", "300.00", "320.00", "340.00"],
                            ["Total Assets", "2000.00", "2200.00", "2400.00"],
                            ["Total Liabilities", "600.00", "650.00", "700.00"],
                          ],
                        },
                      ].map((section) => (
                        <Fragment key={section.group}>
                          <tr className="border-b border-zinc-900/60 bg-zinc-950/40">
                            <td
                              colSpan={4}
                              className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400"
                            >
                              {section.group}
                            </td>
                          </tr>
                          {section.rows.map((row) => (
                            <tr
                              key={row[0]}
                              className="border-b border-zinc-900/40"
                            >
                              <td className="sticky left-0 z-10 bg-[#09090b] py-3 font-medium text-zinc-300">
                                {row[0]}
                              </td>
                              {row.slice(1).map((value) => (
                                <td
                                  key={value}
                                  className="whitespace-nowrap px-6 py-3 text-right text-zinc-200"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isBalanceSheetLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-[#09090b]/80 backdrop-blur-sm">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
                      <Wallet className="relative h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-xs font-mono tracking-wider text-zinc-500">
                      Refreshing balance sheet data...
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="h-1 w-1 rounded-full bg-emerald-500/60 animate-bounce"
                          style={{ animationDelay: `${index * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* end balance sheet */}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-900 bg-[#09090b] p-16 text-center">
          <Database className="h-10 w-10 text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">
            Halaman ini sedang kami kerjakan dan belum bisa diakses.
          </p>
        </div>
      )}
    </div>
  );
}
