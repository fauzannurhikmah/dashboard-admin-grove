import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  LineChart,
  Database,
  BarChart3,
  TrendingUp,
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
  const [activeTab, setActiveTab] = useState("Net Income");
  const [chartKey, setChartKey] = useState(0);

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

  const handleSyncPrice = () => {
    syncPriceMutation.mutate(null, {
      onSuccess: () => {
        showToast("Stock price synchronized successfully", "success");
        setChartKey((currentKey) => currentKey + 1);
      },
      onError: () => showToast("Failed to sync price", "error"),
    });
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

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in pb-12 text-sm text-zinc-300">
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
      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 mb-6">
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
          {isSyncingIncomeStatement ? "Syncing..." : "Sync Balance Sheet"}
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
          {isSyncingIncomeStatement ? "Syncing..." : "Sync Cash Flow"}
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <span className="text-xs text-zinc-500">Asset Type</span>
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
                    <tr key={quarter} className="border-b border-zinc-900/40">
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
    </div>
  );
}
