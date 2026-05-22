import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminApi, type DashboardData } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  type ChartOptions,
} from "chart.js";
import {
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// ---------- Helper Functions (safe with null/undefined) ----------
const formatETB = (amount: number | null | undefined): string => {
  const num = Number(amount);
  if (isNaN(num)) return "0 ETB";
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(num);
};

const formatNumber = (num: number | null | undefined): string => {
  const n = Number(num);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "successful": return "text-green-600 bg-green-100";
    case "pending": return "text-yellow-600 bg-yellow-100";
    case "failed": return "text-red-600 bg-red-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

// Loading Skeleton
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100 shadow-sm animate-pulse">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="mt-3 md:mt-4 lg:mt-5">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

// Safe conversion for any nullable number
const toNumber = (value: unknown): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboardData = await adminApi.getDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("failed_load_data"));
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [t]);

  if (loading) {
    return (
      <DashboardLayout title={t("dashboard_overview")} links={adminLinks}>
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
            {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 h-80 animate-pulse"></div>
            <div className="bg-white rounded-2xl shadow-sm p-6 h-80 animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title={t("dashboard_overview")} links={adminLinks}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 m-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{t("error")}: {error || t("no_data")}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
            {t("retry")}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, trends, paymentMethods, topBillers, recentTransactions } = data;

  const totalUsers = toNumber(stats?.totalUsers);
  const totalAgents = toNumber(stats?.totalAgents);
  const totalBillers = toNumber(stats?.totalBillers);
  const totalTransactions = toNumber(stats?.totalTransactions);
  const totalRevenue = toNumber(stats?.totalRevenue);

  const trendValues = trends?.values?.map(v => toNumber(v)) ?? [];
  const trendLabels = trends?.labels ?? [];

  let revenueGrowth = 0;
  if (trendValues.length >= 2) {
    const last = trendValues[trendValues.length - 1];
    const prev = trendValues[trendValues.length - 2];
    revenueGrowth = prev !== 0 ? ((last - prev) / prev) * 100 : 0;
  }

  const mainCards = [
    { title: t("total_users"), value: totalUsers, formatted: formatNumber(totalUsers), icon: UserGroupIcon, color: "blue", growth: 0 },
    { title: t("agents"), value: totalAgents, formatted: formatNumber(totalAgents), icon: UsersIcon, color: "green", subtext: `${totalAgents} ${t("active")}` },
    { title: t("billers"), value: totalBillers, formatted: formatNumber(totalBillers), icon: BuildingOfficeIcon, color: "yellow", subtext: `${totalBillers} ${t("providers")}` },
    { title: t("transactions"), value: totalTransactions, formatted: formatNumber(totalTransactions), icon: ChartBarIcon, color: "purple", growth: 0 },
    { title: t("total_revenue"), value: totalRevenue, formatted: formatETB(totalRevenue), icon: CurrencyDollarIcon, color: "red", growth: revenueGrowth },
  ];

  const additionalMetrics = [
    { title: t("financial_institutions"), value: 16, icon: CreditCardIcon, bg: "indigo", formatted: "16" },
    { title: t("mobile_wallets"), value: 10, icon: DevicePhoneMobileIcon, bg: "pink", formatted: "10" },
    { title: t("active_agents"), value: totalAgents, icon: CheckCircleIcon, bg: "emerald", formatted: `${formatNumber(totalAgents)} (100%)` },
    { title: t("system_uptime"), value: 99.95, icon: ShieldCheckIcon, bg: "cyan", formatted: "99.95%" },
  ];

  // Chart Data
  const trendChartData = {
    labels: trendLabels,
    datasets: [{
      label: t("volume_etb"),
      data: trendValues,
      borderColor: "#EF4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#EF4444",
      pointBorderColor: "white",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };
  const trendOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { callbacks: { label: (context) => `${t("volume")}: ${formatETB(context.parsed.y)}` } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatETB(value as number) } } },
  };

  const paymentChartData = {
    labels: [t("mobile"), t("internet"), t("agent"), t("bank")],
    datasets: [{
      data: [
        toNumber(paymentMethods?.mobile),
        toNumber(paymentMethods?.internet),
        toNumber(paymentMethods?.agent),
        toNumber(paymentMethods?.bank),
      ],
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF5"],
      borderWidth: 2,
      borderColor: "white",
    }],
  };
  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed}%` } },
    },
  };

  const barChartData = {
    labels: mainCards.map(c => c.title),
    datasets: [{
      label: t("overview"),
      data: mainCards.map(c => c.value),
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF5", "#EF4444"],
      borderRadius: 8,
    }],
  };
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw}` } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatNumber(value as number) } } },
  };

  return (
    <DashboardLayout title={t("admin_dashboard")} links={adminLinks}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
              {t("welcome_derash_admin")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t("platform_description")}</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t("live_data")}</span>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {mainCards.map((card) => (
            <div
              key={card.title}
              className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-${card.color}-50 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                {card.growth !== undefined && card.growth !== 0 && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
                    <ArrowTrendingUpIcon className={`w-3 h-3 ${card.growth >= 0 ? "text-green-500" : "text-red-500"}`} />
                    <span className={`text-xs font-semibold ${card.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {card.growth >= 0 ? "+" : ""}{card.growth.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">{card.formatted}</h2>
                {card.subtext && <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>}
                <div className="mt-3 h-1 w-10 bg-red-500 rounded-full opacity-70"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalMetrics.map((metric) => {
            const bgClass = `bg-${metric.bg}-50`;
            return (
              <div key={metric.title} className={`${bgClass} rounded-xl p-4 border border-gray-100`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <metric.icon className={`w-5 h-5 text-${metric.bg}-600`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{metric.title}</p>
                    <p className="text-base font-bold text-gray-900">{metric.formatted}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("transaction")} <span className="text-red-500">{t("trends")}</span></h2>
              <p className="text-gray-400 text-xs">{t("monthly_volume")}</p>
            </div>
            <div className="p-4">
              <div className="w-full h-80">
                <Line data={trendChartData} options={trendOptions} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("payment")} <span className="text-red-500">{t("methods")}</span></h2>
              <p className="text-gray-400 text-xs">{t("distribution_by_channel")}</p>
            </div>
            <div className="p-4">
              <div className="w-full h-80">
                <Doughnut data={paymentChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row – Bar Chart & Top Billers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("system")} <span className="text-red-500">{t("analytics")}</span></h2>
              <p className="text-gray-400 text-xs">{t("key_metrics_overview")}</p>
            </div>
            <div className="p-4">
              <div className="w-full h-80">
                <Bar data={barChartData} options={barOptions} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("top")} <span className="text-red-500">{t("billers")}</span></h2>
              <p className="text-gray-400 text-xs">{t("highest_transaction_volume")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-5 py-3 text-left">{t("biller")}</th>
                    <th className="px-5 py-3 text-right">{t("transactions")}</th>
                    <th className="px-5 py-3 text-right">{t("revenue")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topBillers.map((biller, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{biller.name}</td>
                      <td className="px-5 py-3 text-sm text-right text-gray-600">{formatNumber(biller.transactions)}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-gray-900">{formatETB(biller.revenue)}</td>
                    </tr>
                  ))}
                  {topBillers.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-500">
                      {t("no_data")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t("recent")} <span className="text-red-500">{t("transactions")}</span></h2>
              <p className="text-gray-400 text-xs">{t("latest_payment_activities")}</p>
            </div>
            <button className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors">{t("view_all")} →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                <tr>
                  <th className="px-5 py-3 text-left">{t("id")}</th>
                  <th className="px-5 py-3 text-left">{t("biller")}</th>
                  <th className="px-5 py-3 text-left">{t("agent")}</th>
                  <th className="px-5 py-3 text-right">{t("amount")}</th>
                  <th className="px-5 py-3 text-left">{t("date")}</th>
                  <th className="px-5 py-3 text-center">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm font-mono text-gray-600">{tx.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-900">{tx.biller}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{tx.agent}</td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-gray-900">{formatETB(tx.amount)}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{tx.date}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(tx.status)}`}>
                        {t(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">
                    {t("no_transactions")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5 text-green-600" /><span className="text-xs font-semibold text-green-700">{t("system_health")}</span></div>
            <p className="text-xl font-bold text-green-900 mt-1">99.95% {t("uptime")}</p>
            <p className="text-xs text-green-600 mt-1">{t("response_time")}: 245ms</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5 text-blue-600" /><span className="text-xs font-semibold text-blue-700">{t("digital_payment_goal")}</span></div>
            <p className="text-xl font-bold text-blue-900 mt-1">80% {t("population")}</p>
            <p className="text-xs text-blue-600 mt-1">{t("target")}: 5 {t("years")}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2"><CreditCardIcon className="w-5 h-5 text-purple-600" /><span className="text-xs font-semibold text-purple-700">{t("cashless_society")}</span></div>
            <p className="text-xl font-bold text-purple-900 mt-1">{t("in_progress")}</p>
            <p className="text-xs text-purple-600 mt-1">{t("minimizing_laundry")}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}