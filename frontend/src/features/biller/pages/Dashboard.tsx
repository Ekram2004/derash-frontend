import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
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

import { getBillerStats } from "../api/biller.api";
import { billerLinks } from "../billerLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface BillerStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  partiallyPaidBills: number;
  revenue: number;
  thisMonthRevenue: number;
}

// Animation Variants
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

export default function BillerDashboard() {
  const [stats, setStats] = useState<BillerStats>({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    partiallyPaidBills: 0,
    revenue: 0,
    thisMonthRevenue: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getBillerStats();

        if (response?.status === "SUCCESS") {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const collectionRate =
    stats.totalBills > 0
      ? ((stats.paidBills / stats.totalBills) * 100).toFixed(1)
      : "0";

  const revenueGrowth = stats.revenue > 0 
    ? ((stats.thisMonthRevenue / stats.revenue) * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <DashboardLayout title="Biller Dashboard" links={billerLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Biller Dashboard" links={billerLinks}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 md:space-y-8"
      >
        {/* HEADER - Same as Admin Dashboard */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="max-w-2xl">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold 
             bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent">
                Welcome to Biller Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
                Monitor your bills, track payments, and analyze revenue performance with real-time insights.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <span className="text-lg font-bold text-green-600">{collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
        >
          <StatCard
            title="Total Bills"
            value={stats.totalBills}
            icon={ClipboardDocumentListIcon}
            color="blue"
            trend="+12%"
          />

          <StatCard
            title="Paid Bills"
            value={stats.paidBills}
            icon={CheckCircleIcon}
            color="green"
            trend="+8%"
          />

          <StatCard
            title="Unpaid Bills"
            value={stats.unpaidBills}
            icon={ClockIcon}
            color="red"
            trend="-5%"
            trendDirection="down"
          />

          <StatCard
            title="Partially Paid"
            value={stats.partiallyPaidBills}
            icon={ExclamationCircleIcon}
            color="yellow"
            trend="+3%"
          />
        </motion.div>

        {/* Revenue Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RevenueCard
            title="Total Revenue"
            value={stats.revenue}
            subtitle="All time revenue"
            icon={CurrencyDollarIcon}
            color="emerald"
          />

          <RevenueCard
            title="This Month Revenue"
            value={stats.thisMonthRevenue}
            subtitle={`${revenueGrowth}% vs total revenue`}
            icon={ArrowTrendingUpIcon}
            color="purple"
            growth={revenueGrowth}
          />
        </motion.div>

        {/* Performance Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Collection Performance */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Collection Performance
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Bills collection rate analysis
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DocumentCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collection Rate</span>
                <span className="font-bold text-green-600">
                  {collectionRate}%
                </span>
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
                  <p className="text-xs text-gray-500">Paid Bills</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.paidBills}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Total Bills</p>
                  <p className="text-lg font-bold text-gray-700">
                    {stats.totalBills}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Quick Summary
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Key metrics at a glance
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="space-y-3">
              <SummaryItem
                label="Total Bills Issued"
                value={stats.totalBills.toLocaleString()}
                icon={ClipboardDocumentListIcon}
                color="blue"
              />
              <SummaryItem
                label="Successfully Paid"
                value={stats.paidBills.toLocaleString()}
                icon={CheckCircleIcon}
                color="green"
              />
              <SummaryItem
                label="Unpaid Bills"
                value={stats.unpaidBills.toLocaleString()}
                icon={ClockIcon}
                color="red"
              />
              <SummaryItem
                label="Partially Paid"
                value={stats.partiallyPaidBills.toLocaleString()}
                icon={ExclamationCircleIcon}
                color="yellow"
              />
              <SummaryItem
                label="Total Revenue"
                value={`ETB ${stats.revenue.toLocaleString()}`}
                icon={CurrencyDollarIcon}
                color="emerald"
              />
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest billing transactions
              </p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bill Payment</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700">ETB 1,500</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
  trend?: string;
  trendDirection?: "up" | "down";
}

function StatCard({ title, value, icon: Icon, color, trend, trendDirection = "up" }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trendDirection === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trendDirection === "up" ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">
        {value.toLocaleString()}
      </p>
    </motion.div>
  );
}

// Revenue Card Component
interface RevenueCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
  growth?: string;
}

function RevenueCard({ title, value, subtitle, icon: Icon, color, growth }: RevenueCardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-1 ${colorClasses[color]}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          {growth && parseFloat(growth) > 0 && (
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowTrendingUpIcon className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">{growth}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mb-2">
          ETB {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </motion.div>
  );
}

// Summary Item Component
interface SummaryItemProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "emerald";
}

function SummaryItem({ label, value, icon: Icon, color }: SummaryItemProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}