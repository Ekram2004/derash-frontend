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
} from "lucide-react";
import * as XLSX from "xlsx";

// ------------------ Types (matching backend response) ------------------
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
      setAgentName(response.agent_name || user?.agent?.name || "Agent");
      const rawTx = response.data?.transactions || [];
      const displayTx: DisplayTransaction[] = rawTx.map((tx) => ({
        id: tx.id,
        transactionId: tx.transactionId,
        createdAt: tx.createdAt,
        status: tx.status,
        amount: parseFloat(tx.totalAmount || tx.amount || "0"),
        commission: parseFloat(tx.agentShare || "0"),
        customerName: tx.bill?.customer?.fullName || "N/A",
        billerName: tx.bill?.biller?.name || "N/A",
        billReference: tx.bill?.billReference || "N/A",
        remainingBalance: tx.bill?.remainingBalance ?? 0,
      }));
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
    getAgentReport({ fromDate: "", toDate: "" })
      .then((response: BackendResponse) => {
        setAgentName(response.agent_name || user?.agent?.name || "Agent");
        const rawTx = response.data?.transactions || [];
        const displayTx = rawTx.map((tx) => ({
          id: tx.id,
          transactionId: tx.transactionId,
          createdAt: tx.createdAt,
          status: tx.status,
          amount: parseFloat(tx.totalAmount || tx.amount || "0"),
          commission: parseFloat(tx.agentShare || "0"),
          customerName: tx.bill?.customer?.fullName || "N/A",
          billerName: tx.bill?.biller?.name || "N/A",
          billReference: tx.bill?.billReference || "N/A",
          remainingBalance: tx.bill?.remainingBalance ?? 0,
        }));
        setTransactions(displayTx);
        const totalVolume = displayTx.reduce((sum, tx) => sum + tx.amount, 0);
        const totalCommission = displayTx.reduce((sum, tx) => sum + tx.commission, 0);
        const count = displayTx.length;
        const statusBreakdown: Record<string, number> = {};
        displayTx.forEach((tx) => {
          statusBreakdown[tx.status] = (statusBreakdown[tx.status] || 0) + 1;
        });
        setSummary({ totalVolume, totalCommission, count, statusBreakdown });
      })
      .catch((err) => console.error(err));
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
    if (user?.agent) fetchReport();
  }, [user]);

  return (
    <DashboardLayout title="Agent Revenue Report" links={agentLinks}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Filter Bar */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                {agentName} Performance
              </h1>
              <p className="text-gray-500 text-sm">Real‑time financial breakdown and audit logs.</p>
            </div>
            <button
              onClick={exportToExcel}
              className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <Download size={18} />
              Export Excel
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">From Date</label>
              <input
                type="date"
                className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">To Date</label>
              <input
                type="date"
                className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <button
                onClick={fetchReport}
                className="relative overflow-hidden group flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 h-[38px]"
              >
                <Search size={16} />
                {loading ? "Loading..." : "Filter"}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition h-[38px]"
                title="Reset Filters"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">Error: {error}</div>}
        </motion.div>

        {loading && <div className="text-center py-10">Loading report...</div>}

        {!loading && summary && (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-600 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Volume</p>
                  <p className="text-2xl font-black text-gray-800">{summary.totalVolume.toLocaleString()} ETB</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <TrendingUp />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-600 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Your Commission</p>
                  <p className="text-2xl font-black text-red-600">{summary.totalCommission.toLocaleString()} ETB</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <FileText />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-600 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Transaction Count</p>
                  <p className="text-2xl font-black text-gray-800">{summary.count}</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <PieChart />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-8 py-4">Biller</th>
                      <th className="px-6 py-4">Amount Paid</th>
                      <th className="px-6 py-4">Remaining Balance</th>
                      <th className="px-6 py-4">Commission</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-gray-700 uppercase">{tx.transactionId}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{tx.customerName}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{tx.billerName}</span></td>
                        <td className="px-6 py-4 font-black text-gray-900">{tx.amount} ETB</td>
                        <td className="px-6 py-4 font-bold text-red-600">{tx.remainingBalance} ETB</td>
                        <td className="px-6 py-4 font-black text-green-600">+{tx.commission} ETB</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] text-white font-bold ${getStatusColor(tx.status)}`}>{tx.status}</span></td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{format(new Date(tx.createdAt), "MM/dd/yy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:hidden divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div><p className="text-[10px] font-mono text-gray-400">#{tx.transactionId.slice(-8)}</p><p className="font-bold text-gray-800">{tx.customerName}</p></div>
                      <div className="text-right"><p className="font-black text-gray-900">{tx.amount} ETB</p><p className="text-[10px] text-red-500 font-bold">Bal: {tx.remainingBalance} ETB</p><p className="text-[10px] text-green-600 font-bold">+{tx.commission} Comm.</p></div>
                    </div>
                    <div className="flex justify-between items-center"><span className={`px-2 py-0.5 rounded-full text-[9px] text-white font-bold ${getStatusColor(tx.status)}`}>{tx.status}</span><span className="text-[10px] text-gray-500">{format(new Date(tx.createdAt), "MM/dd/yy")}</span></div>
                  </div>
                ))}
              </div>
              {transactions.length === 0 && !loading && <div className="text-center py-8 text-gray-500">No transactions found for the selected period.</div>}
            </motion.div>

            {Object.keys(summary.statusBreakdown).length > 0 && (
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-500 uppercase">{status}</p>
                      <p className="text-2xl font-black text-gray-800">{count}</p>
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