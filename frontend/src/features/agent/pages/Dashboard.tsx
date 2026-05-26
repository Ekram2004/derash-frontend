// src/features/agent/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { getAgentDashboard } from "../api/agent.api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import {
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";

// ------------------ Types ------------------
interface Transaction {
  id: string;
  transactionId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  bill: {
    billReference: string;
    customerName?: string;
    customer?: { fullName: string } | null;
    biller: { name: string };
  };
}

interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue: number;
}

// ------------------ Animation Variants ------------------
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const chartVariants: Variants = {
  hidden: { width: 0 },
  visible: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 1, ease: "easeOut", delay: 0.3 },
  }),
};

// ------------------ Mobile Transaction Card Component ------------------
function MobileTransactionCard({ transaction }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const customerName = transaction.bill?.customerName || transaction.bill?.customer?.fullName || "N/A";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 inline-block px-2 py-0.5 rounded">
            {transaction.transactionId.slice(-12)}
          </p>
          <p className="font-bold text-gray-800 dark:text-white mt-2">{customerName}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {transaction.bill?.biller?.name || "N/A"}
            </span>
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div>
          <p className="text-lg font-black text-gray-900 dark:text-white">{transaction.totalAmount.toLocaleString()} ETB</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</p>
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
            <span className="text-xs text-gray-700 dark:text-gray-300">{transaction.bill?.billReference || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Customer:</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{customerName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------ Main Component ------------------
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getAgentDashboard();
        setStats({
          totalTransactions: data.stats.totalTransactions,
          successfulTransactions: data.stats.successfulTransactions,
          totalRevenue: data.stats.totalRevenue,
        });
        setTransactions(data.recentTransactions || []);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Chart data grouped by date
  const chartData = transactions.reduce((acc: any[], t) => {
    const date = format(new Date(t.createdAt), "MM-dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.revenue += t.totalAmount || 0;
    } else {
      acc.push({ date, revenue: t.totalAmount || 0 });
    }
    return acc.slice(-7); // Last 7 days
  }, []);

  const collectionRate =
    stats && stats.totalTransactions > 0
      ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)
      : "0";

  const revenueGrowth = stats && stats.totalRevenue > 0 ? "8.5" : "0";

  if (loading) {
    return (
      <DashboardLayout title="Agent Dashboard" links={agentLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Agent Dashboard" links={agentLinks}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800/30"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Dashboard" links={agentLinks}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
                Agent Performance Overview
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                Track your collections, commissions, and transaction trends in real‑time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Collection Rate</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">{collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Responsive */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5"
        >
          {stats && (
            <>
              <StatCard
                title="Total Transactions"
                value={stats.totalTransactions}
                icon={ClipboardDocumentListIcon}
                color="blue"
                trend="+12%"
              />
              <StatCard
                title="Successful Payments"
                value={stats.successfulTransactions}
                icon={CheckCircleIcon}
                color="green"
                trend="+8%"
              />
              <StatCard
                title="Total Revenue"
                value={stats.totalRevenue}
                icon={CurrencyDollarIcon}
                color="emerald"
                trend="+15%"
                prefix="ETB "
              />
            </>
          )}
        </motion.div>

        {/* Revenue Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <RevenueCard
            title="Total Revenue"
            value={stats?.totalRevenue || 0}
            subtitle="All time revenue from successful payments"
            icon={CurrencyDollarIcon}
            color="emerald"
          />
          <RevenueCard
            title="Commission Earned"
            value={stats ? Math.round(stats.totalRevenue * 0.02) : 0}
            subtitle={`${revenueGrowth}% vs total revenue`}
            icon={BanknotesIcon}
            color="purple"
            growth={revenueGrowth}
          />
        </motion.div>

        {/* Performance & Chart */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Collection Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Collection Performance</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Success rate & efficiency</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DocumentCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-bold text-green-600">{collectionRate}%</span>
              </div>
              <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                <motion.div
                  custom={parseFloat(collectionRate)}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Successful Tx</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">
                    {stats?.successfulTransactions || 0}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total Tx</p>
                  <p className="text-base sm:text-lg font-bold text-gray-700 dark:text-white">
                    {stats?.totalTransactions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Revenue Trend</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Daily revenue (last transactions)</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="h-[200px] sm:h-[220px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="5 5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#dc2626", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Table - Responsive */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Latest payments processed</p>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[800px] lg:min-w-full w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Biller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bill Ref</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (ETB)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => {
                  const customerName = tx.bill?.customerName || tx.bill?.customer?.fullName || "N/A";
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-[10px] font-mono text-gray-700 dark:text-gray-300">{tx.transactionId}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">{customerName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{tx.bill?.biller?.name || "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{tx.bill?.billReference || "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">{tx.totalAmount.toLocaleString()} ETB</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                        {format(new Date(tx.createdAt), "dd MMM yyyy")}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">No transactions available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3">
            {transactions.map((tx) => (
              <MobileTransactionCard key={tx.id} transaction={tx} />
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No transactions available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Summary - Responsive */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Quick Summary</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Key metrics at a glance</p>
            </div>
            <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <SummaryItem
              label="Total Transactions"
              value={stats?.totalTransactions.toLocaleString() || "0"}
              icon={ClipboardDocumentListIcon}
              color="blue"
            />
            <SummaryItem
              label="Total Revenue"
              value={`ETB ${stats?.totalRevenue.toLocaleString() || "0"}`}
              icon={CurrencyDollarIcon}
              color="emerald"
            />
            <SummaryItem
              label="Success Rate"
              value={`${collectionRate}%`}
              icon={CheckCircleIcon}
              color="green"
            />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// ------------------ Reusable Components ------------------

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
  trend?: string;
  trendDirection?: "up" | "down";
  prefix?: string;
}

function StatCard({ title, value, icon: Icon, color, trend, trendDirection = "up", prefix = "" }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${trendDirection === "up" ? "text-green-600" : "text-red-600"}`}>
            {trendDirection === "up" ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{prefix}{value.toLocaleString()}</p>
    </motion.div>
  );
}

interface RevenueCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
  growth?: string;
}

function RevenueCard({ title, value, subtitle, icon: Icon, color, growth }: RevenueCardProps) {
  const colorMap = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  const bgColorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/30",
    green: "bg-green-50 dark:bg-green-900/30",
    red: "bg-red-50 dark:bg-red-900/30",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30",
    purple: "bg-purple-50 dark:bg-purple-900/30",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30",
  };

  const textColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-1 ${colorMap[color]}`}></div>
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-xl ${bgColorMap[color]}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${textColorMap[color]}`} />
          </div>
          {growth && parseFloat(growth) > 0 && (
            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
              <ArrowTrendingUpIcon className="w-3 h-3 text-green-600" />
              <span className="text-[10px] sm:text-xs font-medium text-green-600">{growth}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">{title}</h3>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">ETB {value.toLocaleString()}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
}

function SummaryItem({ label, value, icon: Icon, color }: SummaryItemProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    green: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
    red: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
    yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-500";
  let label = status;
  
  if (status === "SUCCESSFUL") {
    color = "bg-green-500";
    label = "Success";
  } else if (status === "FAILED") {
    color = "bg-red-500";
    label = "Failed";
  } else if (status === "PENDING") {
    color = "bg-yellow-500";
    label = "Pending";
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold text-white ${color} inline-block`}>
      {label}
    </span>
  );
}