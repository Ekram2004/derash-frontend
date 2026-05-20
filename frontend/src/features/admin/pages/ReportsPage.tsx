// src/features/admin/pages/ReportsPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { adminApi } from "@/features/admin/api/admin.api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ---------- Interfaces ----------
interface TransactionDetail {
  transactionId: string;
  total_amount: number;
  agent_share: number;
  aggregator_share: number;
  status: string;
  payment_method: string;
  createdAt: string;
  bill: {
    customer: { full_name: string };
    biller: { name: string };
    remaining_bal: number;
  };
  agent: { name: string };
}

interface ReportResponse {
  report: {
    transactions: TransactionDetail[];
  };
}

// ---------- KPI Card Component ----------
function KpiCard({ title, value, color, borderColor }: any) {
  return (
    <div className={`bg-white shadow-sm rounded-xl p-6 border-b-4 ${borderColor}`}>
      <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{title}</h3>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ---------- Main Component ----------
export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
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

  // ---------- Fetch detailed report ----------
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (agentId) params.agent_id = agentId;
      if (billerId) params.biller_id = billerId;

      const data = await adminApi.getDetailedReport(params);
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, agentId, billerId]);

  // ---------- Access control & initial load ----------
  useEffect(() => {
    // Allow SYSTEM_ADMIN (backend) or any role containing "ADMIN"
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
    fetchReport();
  };

  // ---------- Extract transactions from report ----------
  const transactionList = useMemo(() => {
    return Array.isArray(reportData?.report?.transactions)
      ? reportData.report.transactions
      : [];
  }, [reportData]);

  // ---------- Calculate KPI totals ----------
  const calculatedStats = useMemo(() => {
    const totals = {
      collected: 0,
      agent: 0,
      system: 0,
      biller: 0,
    };

    transactionList.forEach((t) => {
      const amt = Number(t.total_amount || 0);
      const agtShare = Number(t.agent_share || 0);
      const sysShare = Number(t.aggregator_share || 0);

      totals.collected += amt;
      totals.agent += agtShare;
      totals.system += sysShare;
      totals.biller += amt - (agtShare + sysShare);
    });

    return totals;
  }, [transactionList]);

  // ---------- Prepare chart data ----------
  const { pieData, barData } = useMemo(() => {
    const revenueByBiller: Record<string, number> = {};
    const transactionsCount: Record<string, number> = {};

    transactionList.forEach((t) => {
      const name = t.bill?.biller?.name || "Unknown";
      const amt = Number(t.total_amount || 0);
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
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
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
          },
        ],
      },
    };
  }, [transactionList]);

  // ---------- Export to Excel ----------
  const exportToExcel = () => {
    const simpleData = transactionList.map((t) => ({
      "Transaction ID": t.transactionId,
      Customer: t.bill?.customer?.full_name || "N/A",
      Biller: t.bill?.biller?.name || "N/A",
      Agent: t.agent?.name || "N/A",
      "Total Amount (ETB)": t.total_amount,
      "Agent Share (ETB)": t.agent_share,
      "System Share (ETB)": t.aggregator_share,
      "Biller Net (ETB)": t.total_amount - (t.agent_share + t.aggregator_share),
      "Remaining Balance (ETB)": t.bill?.remaining_bal || 0,
      Status: t.status,
      "Payment Method": t.payment_method || "N/A",
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
      <DashboardLayout title="Reports" links={adminLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------- Main render ----------
  return (
    <DashboardLayout title="Admin Reports" links={adminLinks}>
      {/* Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Agent</label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-gray-50"
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
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Biller</label>
          <select
            className="w-full border rounded-lg p-2 text-sm bg-gray-50"
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
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">From Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm bg-gray-50"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">To Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm bg-gray-50"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReport}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 h-[40px]"
          >
            <Search size={18} /> Search
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition h-[40px]"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
          onClick={exportToExcel}
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Filtered Total"
          value={`${calculatedStats.collected.toLocaleString()} ETB`}
          color="text-blue-700"
          borderColor="border-blue-500"
        />
        <KpiCard
          title="Agent Share"
          value={`${calculatedStats.agent.toLocaleString()} ETB`}
          color="text-green-700"
          borderColor="border-green-500"
        />
        <KpiCard
          title="System Profit"
          value={`${calculatedStats.system.toLocaleString()} ETB`}
          color="text-purple-700"
          borderColor="border-purple-500"
        />
        <KpiCard
          title="Net to Biller"
          value={`${calculatedStats.biller.toLocaleString()} ETB`}
          color="text-orange-700"
          borderColor="border-orange-500"
        />
      </div>

      {/* Transaction Logs Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-bold text-gray-700 text-center">
            Transaction Logs ({transactionList.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead className="bg-gray-100 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Biller</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Amount & Shares</th>
                <th className="p-4">Remaining Bal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactionList.map((t) => (
                <tr key={t.transactionId} className="hover:bg-blue-50/40 transition">
                  <td className="p-4 font-mono text-[10px] text-gray-500">{t.transactionId}</td>
                  <td className="p-4 font-bold text-black">{t.bill?.customer?.full_name || "N/A"}</td>
                  <td className="p-4 text-xs text-gray-600">{t.bill?.biller?.name || "N/A"}</td>
                  <td className="p-4 text-xs text-gray-600">{t.agent?.name || "N/A"}</td>
                  <td className="p-4">
                    <div className="font-black text-blue-600">{t.total_amount.toLocaleString()} ETB</div>
                    <div className="flex gap-2 text-[9px] font-bold mt-0.5">
                      <span className="text-green-600">Agt: {t.agent_share.toLocaleString()}</span>
                      <span className="text-purple-600">Sys: {t.aggregator_share.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-red-500">
                    {t.bill?.remaining_bal?.toLocaleString() || 0} ETB
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        t.status === "SUCCESSFUL"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase">
                      {t.payment_method || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {t.createdAt ? format(new Date(t.createdAt), "MM/dd/yy HH:mm") : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 h-[400px]">
          <h3 className="font-bold mb-4 text-gray-700 text-center">Revenue Distribution (ETB)</h3>
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 h-[400px]">
          <h3 className="font-bold mb-4 text-gray-700 text-center">Volume by Biller</h3>
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </DashboardLayout>
  );
}