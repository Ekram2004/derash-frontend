import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { getAgentReport } from "../api/agent.api";
import { format } from "date-fns";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  FileText,
  Download,
  PieChart,
  TrendingUp,
  Search,
  RotateCcw,
  Calendar,
  AlertCircle,
  Building2,
  DollarSign,
} from "lucide-react";
import * as XLSX from "xlsx";

// ------------------ Types ------------------
interface BackendTransaction {
  id: string;
  transactionId: string;
  createdAt: string;
  status: string;
  amount: string;
  agentShare: string;
  totalAmount: string;
  bill?: {
    remainingBalance: number;
    customerName?: string;
    customer?: { fullName: string };
    biller?: { name: string };
    billReference?: string;
  };
}

interface BackendReportData {
  transactions: BackendTransaction[];
  total_collected: number;
  total_agent_commissions: number;
  count: number;
}

interface BackendResponse {
  status: string;
  agent_name: string;
  data: BackendReportData;
}

interface DisplayTransaction {
  id: string;
  transactionId: string;
  createdAt: string;
  status: string;
  amount: number;
  commission: number;
  customerName: string;
  billerName: string;
  billReference: string;
  remainingBalance: number;
}

interface SummaryStats {
  totalVolume: number;
  totalCommission: number;
  count: number;
  statusBreakdown: Record<string, number>;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    SUCCESSFUL: "bg-green-500",
    FAILED: "bg-red-500",
    PENDING: "bg-yellow-500",
    REVERSED: "bg-purple-500",
    TIMEOUT: "bg-gray-500",
    INITIATED: "bg-blue-500",
  };
  return colors[status] || "bg-gray-500";
};

export default function Reports() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: BackendResponse = await getAgentReport({ fromDate, toDate });
      setAgentName(response.agent_name || (user as any)?.agent?.name || "Agent");

      const rawTx = response.data?.transactions || [];
      const displayTx: DisplayTransaction[] = rawTx.map((tx) => {
        const customerName = tx.bill?.customerName || tx.bill?.customer?.fullName || "N/A";
        return {
          id: tx.id,
          transactionId: tx.transactionId,
          createdAt: tx.createdAt,
          status: tx.status,
          amount: parseFloat(tx.totalAmount || tx.amount || "0"),
          commission: parseFloat(tx.agentShare || "0"),
          customerName: customerName,
          billerName: tx.bill?.biller?.name || "N/A",
          billReference: tx.bill?.billReference || "N/A",
          remainingBalance: tx.bill?.remainingBalance ?? 0,
        };
      });
      setTransactions(displayTx);

      const totalVolume = displayTx.reduce((sum, tx) => sum + tx.amount, 0);
      const totalCommission = displayTx.reduce((sum, tx) => sum + tx.commission, 0);
      const count = displayTx.length;
      const statusBreakdown: Record<string, number> = {};
      displayTx.forEach((tx) => {
        statusBreakdown[tx.status] = (statusBreakdown[tx.status] || 0) + 1;
      });
      setSummary({ totalVolume, totalCommission, count, statusBreakdown });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    fetchReport();
  };

  const exportToExcel = () => {
    const dataToExport = transactions.map((tx) => ({
      "Transaction ID": tx.transactionId,
      Date: format(new Date(tx.createdAt), "MM/dd/yy"),
      Customer: tx.customerName,
      Biller: tx.billerName,
      "Amount Paid (ETB)": tx.amount,
      "Remaining Balance (ETB)": tx.remainingBalance,
      "Commission (ETB)": tx.commission,
      Status: tx.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue Report");
    XLSX.writeFile(workbook, `${agentName}_Report_${format(new Date(), "MM-dd-yy")}.xlsx`);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <DashboardLayout title="Agent Revenue Report" links={agentLinks}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6"
      >
        {/* Filter Bar */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
                {agentName} Performance
              </h1>
              <p className="text-gray-500 text-sm mt-1">Real‑time financial breakdown and audit logs.</p>
            </div>
            <button
              onClick={exportToExcel}
              className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <Download size={18} />
              Export Excel
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> From Date
              </label>
              <input
                type="date"
                className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> To Date
              </label>
              <input
                type="date"
                className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="relative overflow-hidden group flex-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {loading ? "Loading..." : "Filter"}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
                title="Reset Filters"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
          </div>
        )}

        {/* Summary & Table */}
        {!loading && summary && (
          <>
            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-red-500 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Volume</p>
                    <p className="text-2xl font-black text-gray-800">{summary.totalVolume.toLocaleString()} ETB</p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-full">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-red-500 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Your Commission</p>
                    <p className="text-2xl font-black text-red-600">{summary.totalCommission.toLocaleString()} ETB</p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-full">
                    <FileText size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-red-500 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Transaction Count</p>
                    <p className="text-2xl font-black text-gray-800">{summary.count}</p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-full">
                    <PieChart size={24} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transactions Table - FULL CONTENT + RESPONSIVE */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
                <p className="text-sm text-gray-500">All payments processed by you</p>
              </div>

              {/* Desktop Table - full transaction ID, horizontal scroll on small desktops */}
              <div className="overflow-x-auto">
                <table className="min-w-[900px] lg:min-w-full w-full text-sm">
                  <thead className="bg-gray-50/80 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Transaction ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-4 whitespace-nowrap">Biller</th>
                      <th className="px-6 py-4 whitespace-nowrap">Amount Paid</th>
                      <th className="px-6 py-4 whitespace-nowrap">Remaining</th>
                      <th className="px-6 py-4 whitespace-nowrap">Commission</th>
                      <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 font-medium">
                          {tx.transactionId}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{tx.customerName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium">
                            {tx.billerName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                          {tx.amount.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 text-red-600 font-semibold whitespace-nowrap">
                          {tx.remainingBalance.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 text-green-600 font-bold whitespace-nowrap">
                          +{tx.commission.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {format(new Date(tx.createdAt), "dd MMM yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-5 space-y-3 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-mono text-gray-400 bg-gray-100 inline-block px-2 py-0.5 rounded">
                          {tx.transactionId.slice(-12)}
                        </p>
                        <p className="font-bold text-gray-800 mt-1">{tx.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{tx.amount.toLocaleString()} ETB</p>
                        <p className="text-[11px] text-red-500 font-medium">Bal: {tx.remainingBalance.toLocaleString()} ETB</p>
                        <p className="text-[11px] text-green-600 font-medium">+{tx.commission.toLocaleString()} Comm.</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                      <span className="text-[11px] text-gray-400">{format(new Date(tx.createdAt), "dd MMM yyyy")}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={10} /> {tx.billerName}</span>
                      <span className="flex items-center gap-1"><DollarSign size={10} /> {tx.amount} ETB</span>
                    </div>
                  </div>
                ))}
              </div>

              {transactions.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                  <FileText size={40} className="text-gray-300" />
                  <p>No transactions found for the selected period.</p>
                  <button onClick={resetFilters} className="text-red-600 text-sm font-medium hover:underline">
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>

            {/* Status Breakdown */}
            {Object.keys(summary.statusBreakdown).length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <PieChart size={18} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Payment Status Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <p className="text-xs font-bold text-gray-500 uppercase">{status}</p>
                      <p className="text-2xl font-black text-gray-800 mt-1">{count}</p>
                      <div className={`mt-2 h-1 w-full rounded-full ${getStatusColor(status)} opacity-50`} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}