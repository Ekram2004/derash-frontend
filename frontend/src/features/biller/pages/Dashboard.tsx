// src/features/biller/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
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

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 2 }).format(amount);
};

export default function BillerDashboard() {
  const { t } = useTranslation();
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
        console.log("Stats API response:", response);
        
        if (response?.status === "SUCCESS" && response.data) {
          setStats({
            totalBills: response.data.totalBills || 0,
            paidBills: response.data.paidBills || 0,
            unpaidBills: response.data.unpaidBills || 0,
            partiallyPaidBills: response.data.partiallyPaidBills || 0,
            revenue: response.data.revenue || 0,
            thisMonthRevenue: response.data.thisMonthRevenue || 0,
          });
        } else if (response?.data) {
          setStats({
            totalBills: response.data.totalBills || 0,
            paidBills: response.data.paidBills || 0,
            unpaidBills: response.data.unpaidBills || 0,
            partiallyPaidBills: response.data.partiallyPaidBills || 0,
            revenue: response.data.revenue || 0,
            thisMonthRevenue: response.data.thisMonthRevenue || 0,
          });
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);
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
      <DashboardLayout title={t("biller_dashboard")} links={billerLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">{t("loading_dashboard")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("biller_dashboard")} links={billerLinks}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 md:space-y-8 px-2 sm:px-0"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="max-w-2xl">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent">
                {t("welcome_biller_dashboard")}
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
                {t("biller_dashboard_description")}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">{t("collection_rate")}</span>
                  <span className="text-lg font-bold text-green-600">{collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          <StatCard
            title={t("total_bills")}
            value={stats.totalBills}
            icon={ClipboardDocumentListIcon}
            color="blue"
            trend="+12%"
          />

          <StatCard
            title={t("paid_bills")}
            value={stats.paidBills}
            icon={CheckCircleIcon}
            color="green"
            trend="+8%"
          />

          <StatCard
            title={t("unpaid_bills")}
            value={stats.unpaidBills}
            icon={ClockIcon}
            color="red"
            trend="-5%"
            trendDirection="down"
          />

          <StatCard
            title={t("partially_paid")}
            value={stats.partiallyPaidBills}
            icon={ExclamationCircleIcon}
            color="yellow"
            trend="+3%"
          />
        </motion.div>

        {/* Revenue Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RevenueCard
            title={t("total_revenue")}
            value={stats.revenue}
            subtitle={t("all_time_revenue")}
            icon={CurrencyDollarIcon}
            color="emerald"
          />

          <RevenueCard
            title={t("this_month_revenue")}
            value={stats.thisMonthRevenue}
            subtitle={`${revenueGrowth}% ${t("vs_total_revenue")}`}
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
                  {t("collection_performance")}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("collection_rate_analysis")}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DocumentCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("collection_rate")}</span>
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
                  <p className="text-xs text-gray-500">{t("paid_bills")}</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.paidBills}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">{t("total_bills")}</p>
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
                  {t("quick_summary")}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("key_metrics_glance")}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="space-y-3">
              <SummaryItem
                label={t("total_bills_issued")}
                value={stats.totalBills.toLocaleString()}
                icon={ClipboardDocumentListIcon}
                color="blue"
              />
              <SummaryItem
                label={t("successfully_paid")}
                value={stats.paidBills.toLocaleString()}
                icon={CheckCircleIcon}
                color="green"
              />
              <SummaryItem
                label={t("unpaid_bills")}
                value={stats.unpaidBills.toLocaleString()}
                icon={ClockIcon}
                color="red"
              />
              <SummaryItem
                label={t("partially_paid")}
                value={stats.partiallyPaidBills.toLocaleString()}
                icon={ExclamationCircleIcon}
                color="yellow"
              />
              <SummaryItem
                label={t("total_revenue")}
                value={formatCurrency(stats.revenue)}
                icon={CurrencyDollarIcon}
                color="emerald"
              />
            </div>
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
  const colorMap = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  const bgColorMap = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
    purple: "bg-purple-50",
    emerald: "bg-emerald-50",
  };

  const textColorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-1 ${colorMap[color]}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColorMap[color]}`}>
            <Icon className={`w-6 h-6 ${textColorMap[color]}`} />
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
          {formatCurrency(value)}
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