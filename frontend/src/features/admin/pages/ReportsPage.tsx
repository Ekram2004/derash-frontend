// src/features/admin/pages/ReportsPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { Pie, Bar } from "react-chartjs-2";
import { Download, Search, RotateCcw } from "lucide-react";
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

// ---------- KPI Card Component ----------
function KpiCard({ title, value, color, borderColor }: any) {
  return (
    <div className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${borderColor}`}>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className={`text-xl md:text-2xl font-bold mt-2 ${color}`}>{value}</p>
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

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // ---------- Load filter options (agents & billers) ----------
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

  // ---------- Fetch global report ----------
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

  // ---------- Access control & initial load ----------
  useEffect(() => {
    if (!user || !user.role?.toLowerCase().includes("admin")) {
      navigate("/");
      return;
    }
    fetchReport();
  }, [user, navigate, fetchReport]);

  // ---------- Reset all filters ----------
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setAgentId("");
    setBillerId("");
    setTimeout(() => fetchReport(), 0);
  };

  // ---------- Filter transactions on frontend ----------
  const filteredTransactions = useMemo(() => {
    if (!reportData?.transactions) return [];
    
    let filtered = [...reportData.transactions];
    
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
  }, [reportData, agentId, billerId, agents, billers]);

  // ---------- Calculate KPI totals ----------
  const calculatedStats = useMemo(() => {
    const totals = {
      collected: 0,
      agent: 0,
      system: 0,
      biller: 0,
    };

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

  // ---------- Prepare chart data ----------
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
        datasets: [
          {
            label: "Revenue (ETB)",
            data: Object.values(revenueByBiller),
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
          },
        ],
      },
      barData: {
        labels: Object.keys(transactionsCount),
        datasets: [
          {
            label: "Number of Transactions",
            data: Object.values(transactionsCount),
            backgroundColor: "#3B82F6",
            borderRadius: 8,
          },
        ],
      },
    };
  }, [filteredTransactions]);

  // ---------- Export to Excel ----------
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

  // ---------- Loading state ----------
  if (loading && !reportData) {
    return (
      <DashboardLayout title={t("reports")} links={adminLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">{t("loading_reports")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------- Main render ----------
  return (
    <DashboardLayout title={t("reports")} links={adminLinks}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            {t("reports_management")}
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            {t("reports_description")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("filtered_total")}</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700 mt-1">{calculatedStats.collected.toLocaleString()} ETB</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("agent_share")}</p>
              <p className="text-xl md:text-2xl font-bold text-green-700 mt-1">{calculatedStats.agent.toLocaleString()} ETB</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("system_profit")}</p>
              <p className="text-xl md:text-2xl font-bold text-purple-700 mt-1">{calculatedStats.system.toLocaleString()} ETB</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("net_to_biller")}</p>
              <p className="text-xl md:text-2xl font-bold text-orange-700 mt-1">{calculatedStats.biller.toLocaleString()} ETB</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-lg md:rounded-xl flex items-center justify-center">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by transaction ID, customer, biller..."
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 pl-9 md:pl-12 pr-3 md:pr-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 placeholder:text-gray-300"
          />
        </div>

        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <select
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 appearance-none"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <select
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 appearance-none"
            value={billerId}
            onChange={(e) => setBillerId(e.target.value)}
          >
            <option value="">All Billers</option>
            {billers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <input
            type="date"
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="relative">
          <input
            type="date"
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchReport}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <Search size={18} /> Search
            </span>
          </button>

          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={exportToExcel}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-500 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <Download size={18} /> Export Excel
            </span>
          </button>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {t("transaction_logs")} <span className="text-red-500">({filteredTransactions.length})</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
              {t("transaction_logs_description")}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 lg:px-8 py-4">{t("reference")}</th>
                <th className="px-4 lg:px-6 py-4">{t("customer")}</th>
                <th className="px-4 lg:px-6 py-4">{t("biller")}</th>
                <th className="px-4 lg:px-6 py-4">{t("agent")}</th>
                <th className="px-4 lg:px-6 py-4">{t("amount_shares")}</th>
                <th className="px-4 lg:px-6 py-4">{t("remaining_bal")}</th>
                <th className="px-4 lg:px-6 py-4 text-center">{t("status")}</th>
                <th className="px-4 lg:px-6 py-4">{t("payment_method")}</th>
                <th className="px-4 lg:px-6 py-4">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, index) => (
                  <tr key={t.transactionId || index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 lg:px-8 py-4 font-mono text-xs text-gray-500">{t.transactionId}</td>
                    <td className="px-4 lg:px-6 py-4 font-semibold text-gray-900">{t.bill?.customerName || "N/A"}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{t.bill?.biller?.name || "N/A"}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{t.agent?.name || "N/A"}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="font-bold text-blue-600">{t.totalAmount?.toLocaleString()} ETB</div>
                      <div className="flex gap-3 text-[10px] font-semibold mt-1">
                        <span className="text-green-600">Agt: {t.agentShare?.toLocaleString()}</span>
                        <span className="text-purple-600">Sys: {t.aggregatorShare?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-bold text-red-500">
                      {t.bill?.remainingBalance?.toLocaleString() || 0} ETB
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "SUCCESSFUL"
                            ? "bg-green-100 text-green-700"
                            : t.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-semibold text-gray-700 uppercase">
                        {t.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-gray-500 text-xs">
                      {t.createdAt ? format(new Date(t.createdAt), "MM/dd/yy HH:mm") : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("revenue")} <span className="text-red-500">{t("distribution")}</span></h2>
              <p className="text-gray-400 text-xs">{t("revenue_distribution_description")}</p>
            </div>
            <div className="p-6 h-[400px]">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("volume")} <span className="text-red-500">{t("by_biller")}</span></h2>
              <p className="text-gray-400 text-xs">{t("volume_by_biller_description")}</p>
            </div>
            <div className="p-6 h-[400px]">
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}