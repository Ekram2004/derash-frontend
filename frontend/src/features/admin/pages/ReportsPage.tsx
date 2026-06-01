// src/features/admin/pages/ReportsPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { Pie, Bar } from "react-chartjs-2";
import { Download, Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import * as XLSX from "xlsx";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useNavigate } from "react-router-dom";
import { adminApi, type FullReportData } from "@/features/admin/api/admin.api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ---------- KPI Card Component (Responsive) ----------
function KpiCard({ title, value, color, borderColor }: any) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 ${borderColor}`}>
      <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{title}</h3>
      <p className={`text-sm sm:text-xl md:text-2xl font-bold mt-1 sm:mt-2 ${color}`}>{value}</p>
    </div>
  );
}

// ---------- Mobile Transaction Card Component ----------
function MobileTransactionCard({ transaction }: { transaction: any }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{transaction.transactionId}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            {transaction.bill?.customerName || "N/A"}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {transaction.bill?.biller?.name || "N/A"}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              transaction.status === "SUCCESSFUL" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              transaction.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {transaction.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("amount")}:</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {transaction.totalAmount?.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("agent_share")}:</span>
            <span className="text-xs text-green-600 dark:text-green-400">
              {transaction.agentShare?.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("system_share")}:</span>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              {transaction.aggregatorShare?.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("remaining_balance")}:</span>
            <span className="text-xs font-semibold text-red-500 dark:text-red-400">
              {transaction.bill?.remainingBalance?.toLocaleString() || 0} ETB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("payment_method")}:</span>
            <span className="text-xs text-gray-700 dark:text-gray-300 uppercase">
              {transaction.paymentMethod || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("date")}:</span>
            <span className="text-xs text-gray-500">
              {transaction.createdAt ? format(new Date(transaction.createdAt), "MM/dd/yy HH:mm") : "N/A"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------
export default function ReportsPage() {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<FullReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [agentId, setAgentId] = useState("");
  const [billerId, setBillerId] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [billers, setBillers] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [agentsList, billersList] = await Promise.all([
          adminApi.getAgents(),
          adminApi.getBillers(),
        ]);
        setAgents(agentsList);
        setBillers(billersList);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadFilterOptions();
  }, []);

  // Fetch global report
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const data = await adminApi.getReportData(params);
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Access control & initial load
  useEffect(() => {
    if (!user || !user.role?.toLowerCase().includes("admin")) {
      navigate("/");
      return;
    }
    fetchReport();
  }, [user, navigate, fetchReport]);

  // Reset all filters
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setAgentId("");
    setBillerId("");
    setSearchTerm("");
    setTimeout(() => fetchReport(), 0);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!reportData?.transactions) return [];
    let filtered = [...reportData.transactions];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.transactionId?.toLowerCase().includes(term) ||
        t.bill?.customerName?.toLowerCase().includes(term) ||
        t.bill?.biller?.name?.toLowerCase().includes(term) ||
        t.agent?.name?.toLowerCase().includes(term)
      );
    }
    
    if (agentId) {
      const selectedAgent = agents.find(a => a.id === agentId);
      if (selectedAgent) {
        filtered = filtered.filter(t => t.agent?.name === selectedAgent.name);
      }
    }
    
    if (billerId) {
      const selectedBiller = billers.find(b => b.id === billerId);
      if (selectedBiller) {
        filtered = filtered.filter(t => t.bill?.biller?.name === selectedBiller.name);
      }
    }
    return filtered;
  }, [reportData, searchTerm, agentId, billerId, agents, billers]);

  // Calculate KPI totals
  const calculatedStats = useMemo(() => {
    const totals = { collected: 0, agent: 0, system: 0, biller: 0 };
    filteredTransactions.forEach((t) => {
      const amt = Number(t.totalAmount || 0);
      const agtShare = Number(t.agentShare || 0);
      const sysShare = Number(t.aggregatorShare || 0);
      totals.collected += amt;
      totals.agent += agtShare;
      totals.system += sysShare;
      totals.biller += amt - (agtShare + sysShare);
    });
    return totals;
  }, [filteredTransactions]);

  // Prepare chart data
  const { pieData, barData } = useMemo(() => {
    const revenueByBiller: Record<string, number> = {};
    const transactionsCount: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const name = t.bill?.biller?.name || "Unknown";
      const amt = Number(t.totalAmount || 0);
      revenueByBiller[name] = (revenueByBiller[name] || 0) + amt;
      transactionsCount[name] = (transactionsCount[name] || 0) + 1;
    });
    return {
      pieData: {
        labels: Object.keys(revenueByBiller),
        datasets: [{
          label: "Revenue (ETB)",
          data: Object.values(revenueByBiller),
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        }],
      },
      barData: {
        labels: Object.keys(transactionsCount),
        datasets: [{
          label: "Number of Transactions",
          data: Object.values(transactionsCount),
          backgroundColor: "#3B82F6",
          borderRadius: 8,
        }],
      },
    };
  }, [filteredTransactions]);

  // Export to Excel
  const exportToExcel = () => {
    const simpleData = filteredTransactions.map((t) => ({
      "Transaction ID": t.transactionId,
      Customer: t.bill?.customerName || "N/A",
      Biller: t.bill?.biller?.name || "N/A",
      Agent: t.agent?.name || "N/A",
      "Total Amount (ETB)": t.totalAmount,
      "Agent Share (ETB)": t.agentShare,
      "System Share (ETB)": t.aggregatorShare,
      "Biller Net (ETB)": t.totalAmount - (t.agentShare + t.aggregatorShare),
      "Remaining Balance (ETB)": t.bill?.remainingBalance || 0,
      Status: t.status,
      "Payment Method": t.paymentMethod || "N/A",
      Date: t.createdAt ? format(new Date(t.createdAt), "MM/dd/yy HH:mm") : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(simpleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Report");
    XLSX.writeFile(wb, `Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Loading state
  if (loading && !reportData) {
    return (
      <DashboardLayout title={t("reports")} links={adminLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-3">{t("loading_reports")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("reports")} links={adminLinks}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
              {t("reports_management")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">{t("reports_description")}</p>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <KpiCard
            title={t("filtered_total")}
            value={`${calculatedStats.collected.toLocaleString()} ETB`}
            color="text-blue-700 dark:text-blue-400"
            borderColor="border-blue-500"
          />
          <KpiCard
            title={t("agent_share")}
            value={`${calculatedStats.agent.toLocaleString()} ETB`}
            color="text-green-700 dark:text-green-400"
            borderColor="border-green-500"
          />
          <KpiCard
            title={t("system_profit")}
            value={`${calculatedStats.system.toLocaleString()} ETB`}
            color="text-purple-700 dark:text-purple-400"
            borderColor="border-purple-500"
          />
          <KpiCard
            title={t("net_to_biller")}
            value={`${calculatedStats.biller.toLocaleString()} ETB`}
            color="text-orange-700 dark:text-orange-400"
            borderColor="border-orange-500"
          />
        </div>

        {/* Filter Bar - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            {/* Search Row */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_transactions")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition dark:bg-gray-800 dark:text-white text-sm"
              />
            </div>
            
            {/* Filters Row - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500"
              >
                <option value="">{t("all_agents")}</option>
                {agents.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>

              <select
                value={billerId}
                onChange={(e) => setBillerId(e.target.value)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500"
              >
                <option value="">{t("all_billers")}</option>
                {billers.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-2 col-span-2 sm:col-span-1">
                <button
                  onClick={fetchReport}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-1"
                >
                  <Search size={14} /> {t("search")}
                </button>
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition"
                  title={t("reset_filters")}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                >
                  <Download size={14} /> <span className="hidden sm:inline">{t("export")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Logs - Mobile Cards + Desktop Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {t("transaction_logs")} <span className="text-red-500">({filteredTransactions.length})</span>
            </h2>
          </div>
          
          {/* Mobile Card View (visible on small screens) */}
          <div className="block md:hidden p-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">{t("no_transactions")}</p>
              </div>
            ) : (
              filteredTransactions.map((t, idx) => <MobileTransactionCard key={t.transactionId || idx} transaction={t} />)
            )}
          </div>
          
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">{t("reference")}</th>
                  <th className="px-4 py-3">{t("customer")}</th>
                  <th className="px-4 py-3">{t("biller")}</th>
                  <th className="px-4 py-3">{t("agent")}</th>
                  <th className="px-4 py-3">{t("amount_shares")}</th>
                  <th className="px-4 py-3">{t("remaining_bal")}</th>
                  <th className="px-4 py-3 text-center">{t("status")}</th>
                  <th className="px-4 py-3">{t("payment_method")}</th>
                  <th className="px-4 py-3">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">{t("no_transactions")}</td></tr>
                ) : (
                  filteredTransactions.map((t, idx) => (
                    <tr key={t.transactionId || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{t.transactionId}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{t.bill?.customerName || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.bill?.biller?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.agent?.name || "N/A"}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-blue-600 dark:text-blue-400">{t.totalAmount?.toLocaleString()} ETB</div>
                        <div className="flex gap-2 text-[9px] font-semibold mt-0.5">
                          <span className="text-green-600 dark:text-green-400">Agt: {t.agentShare?.toLocaleString()}</span>
                          <span className="text-purple-600 dark:text-purple-400">Sys: {t.aggregatorShare?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-500 dark:text-red-400">
                        {t.bill?.remainingBalance?.toLocaleString() || 0} ETB
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                          t.status === "SUCCESSFUL" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          t.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[9px] font-semibold">{t.paymentMethod || "N/A"}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{t.createdAt ? format(new Date(t.createdAt), "MM/dd/yy HH:mm") : "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row - Responsive */}
        {filteredTransactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t("revenue")} <span className="text-red-500">{t("distribution")}</span></h2>
              </div>
              <div className="p-4 h-[300px] sm:h-[350px] md:h-[400px]">
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t("volume")} <span className="text-red-500">{t("by_biller")}</span></h2>
              </div>
              <div className="p-4 h-[300px] sm:h-[350px] md:h-[400px]">
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}