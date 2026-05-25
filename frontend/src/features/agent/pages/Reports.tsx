// src/features/agent/pages/Reports.tsx
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
  ChevronDown,
  ChevronUp,
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

// Mobile Transaction Card Component
function MobileTransactionCard({ transaction }: { transaction: DisplayTransaction }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 inline-block px-2 py-0.5 rounded">
            {transaction.transactionId.slice(-12)}
          </p>
          <p className="font-bold text-gray-800 dark:text-white mt-2">{transaction.customerName}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {transaction.billerName}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div>
          <p className="text-lg font-black text-gray-900 dark:text-white">{transaction.amount.toLocaleString()} ETB</p>
          <p className="text-xs text-green-600 dark:text-green-400">+{transaction.commission.toLocaleString()} ETB commission</p>
        </div>
        <p className="text-xs text-gray-400">{format(new Date(transaction.createdAt), "dd MMM yyyy")}</p>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Transaction ID:</span>
            <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{transaction.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Bill Reference:</span>
            <span className="text-xs text-gray-700 dark:text-gray-300">{transaction.billReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance:</span>
            <span className="text-xs font-semibold text-red-500 dark:text-red-400">{transaction.remainingBalance.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Amount Paid:</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{transaction.amount.toLocaleString()} ETB</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6"
      >
        {/* Filter Bar - Responsive */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
                {agentName} Performance
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Real‑time financial breakdown and audit logs.</p>
            </div>
            <button
              onClick={exportToExcel}
              className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 dark:from-red-500 dark:via-gray-600 dark:to-red-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> From Date
              </label>
              <input
                type="date"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition dark:bg-gray-800 dark:text-white"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> To Date
              </label>
              <input
                type="date"
                className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition dark:bg-gray-800 dark:text-white"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end col-span-1 sm:col-span-2 lg:col-span-1">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-2 px-3 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
                {loading ? "Loading..." : "Filter"}
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
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
            {/* Summary Cards - Responsive Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-500 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Total Volume</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 dark:text-white">{summary.totalVolume.toLocaleString()} ETB</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-500 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Your Commission</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-red-600">{summary.totalCommission.toLocaleString()} ETB</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full">
                    <FileText size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-red-500 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Transaction Count</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 dark:text-white">{summary.count}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full">
                    <PieChart size={20} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transactions Table - Fully Responsive */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Transaction History</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">All payments processed by you</p>
              </div>

              {/* Desktop Table - Horizontal Scroll on small screens */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-[800px] lg:min-w-full w-full text-sm">
                  <thead className="bg-gray-50/80 dark:bg-gray-700/50 text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Transaction ID</th>
                      <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                      <th className="px-4 py-3 whitespace-nowrap">Biller</th>
                      <th className="px-4 py-3 whitespace-nowrap">Amount Paid</th>
                      <th className="px-4 py-3 whitespace-nowrap">Remaining</th>
                      <th className="px-4 py-3 whitespace-nowrap">Commission</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                      <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {tx.transactionId}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{tx.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-[9px] sm:text-[10px] font-medium">
                            {tx.billerName}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {tx.amount.toLocaleString()} ETB
                        </td>
                        <td className="px-4 py-3 text-red-500 dark:text-red-400 font-semibold whitespace-nowrap">
                          {tx.remainingBalance.toLocaleString()} ETB
                        </td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400 font-bold whitespace-nowrap">
                          +{tx.commission.toLocaleString()} ETB
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold text-white ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                          {format(new Date(tx.createdAt), "dd MMM yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-3">
                {transactions.map((tx) => (
                  <MobileTransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>

              {transactions.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                  <FileText size={40} className="text-gray-300 dark:text-gray-600" />
                  <p>No transactions found for the selected period.</p>
                  <button onClick={resetFilters} className="text-red-600 text-sm font-medium hover:underline">
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>

            {/* Status Breakdown - Responsive */}
            {Object.keys(summary.statusBreakdown).length > 0 && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <PieChart size={18} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Payment Status Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{status}</p>
                      <p className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mt-1">{count}</p>
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