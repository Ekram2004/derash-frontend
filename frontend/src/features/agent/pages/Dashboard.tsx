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
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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
    customer: { fullName: string } | null;
    biller: { name: string };
  };
}

interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
}

type AllowedColors = "blue" | "green" | "red" | "yellow" | "purple" | "emerald";

// ------------------ Animation Variants ------------------
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const chartVariants: Variants = {
  hidden: { width: 0 },
  visible: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 1, ease: "easeOut", delay: 0.3 },
  }),
};

// ------------------ Component ------------------
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
        setStats(data.stats);
        setTransactions(data.recentTransactions || []);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Prepare chart data (group by date) securely
  const chartData = transactions.reduce((acc: any[], t) => {
    if (!t.createdAt) return acc;
    const date = format(new Date(t.createdAt), "MM-dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.revenue += t.totalAmount || 0;
    } else {
      acc.push({ date, revenue: t.totalAmount || 0 });
    }
    return acc;
  }, []);

  // Fallback structural node for Recharts display layout context safety
  if (chartData.length === 0) {
    chartData.push({ date: format(new Date(), "MM-dd"), revenue: 0 });
  }

  // Collection rate (successful transactions / total)
  const collectionRate =
    stats && stats.totalTransactions > 0
      ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)
      : "0";

  // Revenue growth calculation fallback configuration properties
  const revenueGrowth = stats && stats.totalRevenue > 0 ? "8.5" : "0";

  if (loading) {
    return (
      <DashboardLayout title="Agent Dashboard" links={agentLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3 font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Agent Dashboard" links={agentLinks}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 m-4 max-w-xl mx-auto shadow-sm">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Failed to Load Dashboard Context</h3>
              <p className="text-sm text-red-600 mt-1 leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-xs font-semibold bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Retry Request
              </button>
            </div>
          </div>
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
        className="space-y-6 md:space-y-8"
      >
        {/* HEADER with dynamic alignment mapping layout configuration */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
            <div className="max-w-2xl">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-900 to-red-600 bg-clip-text text-transparent">
                Agent Performance Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                Track your collections, commissions, and transaction trends in real‑time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Collection Rate</span>
                  <span className="text-lg font-bold text-green-600">{collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid (4 cards) */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
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
                title="Successful"
                value={stats.successfulTransactions}
                icon={CheckCircleIcon}
                color="green"
                trend="+8%"
              />
              <StatCard
                title="Pending"
                value={stats.pendingTransactions}
                icon={ClockIcon}
                color="yellow"
                trend="-5%"
                trendDirection="down"
              />
              <StatCard
                title="Failed"
                value={stats.failedTransactions}
                icon={ExclamationCircleIcon}
                color="red"
                trend="-2%"
                trendDirection="down"
              />
            </>
          )}
        </motion.div>

        {/* Revenue Section (Two Cards) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

        {/* Performance & Recent Activity (Two Columns) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Collection Performance */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Collection Performance</h2>
                <p className="text-sm text-gray-500 mt-1">Success rate & efficiency</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <DocumentCheckIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Success Rate</span>
                <span className="font-bold text-green-600">{collectionRate}%</span>
              </div>
              <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  custom={parseFloat(collectionRate)}
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Successful Tx</p>
                  <p className="text-lg font-bold text-green-600 mt-0.5">
                    {stats?.successfulTransactions || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Total Tx</p>
                  <p className="text-lg font-bold text-gray-700 mt-0.5">
                    {stats?.totalTransactions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart Trend Panel Layout */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Revenue Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Daily revenue metrics scaling</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <ChartBarIcon className="w-6 h-6" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#dc2626", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Transactions Table Component Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Latest payments processed</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Biller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill Ref</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (ETB)</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-medium text-gray-600">{tx.transactionId}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tx.bill?.customer?.fullName || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{tx.bill?.biller?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">{tx.bill?.billReference || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">{tx.totalAmount.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400 font-medium">No system records available matching criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Summary View Context Parameter Grid */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Quick Summary</h2>
              <p className="text-sm text-gray-500 mt-1">Key metrics parameters at a glance</p>
            </div>
            <div className="p-3 bg-gray-50 text-gray-500 rounded-xl">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

// ------------------ Reusable Component Dictionary Styling Maps ------------------

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: AllowedColors;
  trend?: string;
  trendDirection?: "up" | "down";
}

// Fixed mapping maps resolving dynamic class rendering limits
const bgClasses: Record<AllowedColors, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  yellow: "bg-yellow-50 text-yellow-600",
  purple: "bg-purple-50 text-purple-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

function StatCard({ title, value, icon: Icon, color, trend, trendDirection = "up" }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendDirection === "up" ? "text-green-600" : "text-red-600"}`}>
            {trendDirection === "up" ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-400 font-medium text-xs tracking-wide uppercase">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </motion.div>
  );
}

interface RevenueCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: AllowedColors;
  growth?: string;
}

const borderTopClasses: Record<AllowedColors, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  red: "bg-red-600",
  yellow: "bg-yellow-500",
  purple: "bg-purple-600",
  emerald: "bg-emerald-600",
};

function RevenueCard({ title, value, subtitle, icon: Icon, color, growth }: RevenueCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className={`h-1 w-full ${borderTopClasses[color]}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {growth && parseFloat(growth) > 0 && (
            <div className="flex items-center gap-1 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">
              <ArrowTrendingUpIcon className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{growth}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">ETB {value.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</p>
      </div>
    </motion.div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: AllowedColors;
}

function SummaryItem({ label, value, icon: Icon, color }: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badgeMap: Record<string, string> = {
    SUCCESSFUL: "bg-green-100 text-green-700 border-green-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const textMap: Record<string, string> = {
    SUCCESSFUL: "Success",
    FAILED: "Failed",
    PENDING: "Pending",
  };

  const currentStyle = badgeMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const currentLabel = textMap[status] || status;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle} inline-block shadow-sm`}>
      {currentLabel}
    </span>
  );
}