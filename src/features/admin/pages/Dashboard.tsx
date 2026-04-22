// src/features/admin/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminApi } from "../api/admin.api";
import type { Stats } from "../api/admin.api";
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
} from "chart.js";
import {
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
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

// 🇪🇹 ETB Formatter
const formatETB = (amount: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
  }).format(amount);

// Format number with K, M suffixes for better display
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Extended Stats Interface
interface ExtendedStats extends Stats {
  totalBranches: number;
  financialInstitutions: number;
  mobileWallets: number;
  serviceProviders: number;
  monthlyGrowth: {
    users: number;
    transactions: number;
    revenue: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
    date: string;
    biller: string;
    agent: string;
  }>;
  transactionTrends: {
    labels: string[];
    values: number[];
  };
  paymentMethods: {
    mobile: number;
    internet: number;
    agent: number;
    bank: number;
  };
  topBillers: Array<{
    name: string;
    transactions: number;
    revenue: number;
  }>;
  systemHealth: {
    uptime: number;
    responseTime: number;
    activeAgents: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getStats();
        
        // Extended data with mock/demo data for additional features
        // In production, these would come from the backend
        setStats({
          totalUsers: data.totalUsers || 370000,
          totalAgents: data.totalAgents || 4800,
          totalBillers: data.totalBillers || 65,
          totalTransactions: data.totalTransactions || 650000,
          totalRevenue: data.totalRevenue || 60000000000,
          totalBranches: 4800,
          financialInstitutions: 16,
          mobileWallets: 10,
          serviceProviders: 65,
          monthlyGrowth: {
            users: 15.5,
            transactions: 23.8,
            revenue: 18.2,
          },
          recentTransactions: [
            { id: "TXN001", amount: 1500, status: "success", date: "2024-01-15", biller: "Ethio Telecom", agent: "Commercial Bank" },
            { id: "TXN002", amount: 2500, status: "success", date: "2024-01-15", biller: "EEU", agent: "Dashen Bank" },
            { id: "TXN003", amount: 500, status: "pending", date: "2024-01-14", biller: "Water Bureau", agent: "Awash Bank" },
            { id: "TXN004", amount: 3200, status: "success", date: "2024-01-14", biller: "Ethio Telecom", agent: "CBE" },
            { id: "TXN005", amount: 1800, status: "failed", date: "2024-01-13", biller: "EEU", agent: "Abyssinia Bank" },
          ],
          transactionTrends: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [42000, 45500, 48900, 52300, 56700, 61200, 65800, 71200, 76800, 82300, 87900, 94200],
          },
          paymentMethods: {
            mobile: 45,
            internet: 20,
            agent: 25,
            bank: 10,
          },
          topBillers: [
            { name: "Ethio Telecom", transactions: 245000, revenue: 2450000000 },
            { name: "EEU", transactions: 189000, revenue: 1890000000 },
            { name: "Water Bureau", transactions: 98000, revenue: 980000000 },
            { name: "Tax Authority", transactions: 76000, revenue: 760000000 },
            { name: "Education Bureau", transactions: 42000, revenue: 420000000 },
          ],
          systemHealth: {
            uptime: 99.95,
            responseTime: 245,
            activeAgents: 4120,
          },
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Set fallback data
        setStats({
          totalUsers: 3700,
          totalAgents: 4800,
          totalBillers: 65,
          totalTransactions: 6500,
          totalRevenue: 6000,
          totalBranches: 4800,
          financialInstitutions: 16,
          mobileWallets: 10,
          serviceProviders: 65,
          monthlyGrowth: { users: 0, transactions: 0, revenue: 0 },
          recentTransactions: [],
          transactionTrends: { labels: [], values: [] },
          paymentMethods: { mobile: 0, internet: 0, agent: 0, bank: 0 },
          topBillers: [],
          systemHealth: { uptime: 0, responseTime: 0, activeAgents: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout title="Dashboard Overview" links={adminLinks}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main Stats Cards
  const mainCardData = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      formattedValue: formatNumber(stats.totalUsers),
      icon: <UserGroupIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
      bg: "bg-blue-50",
      growth: stats.monthlyGrowth.users,
    },
    {
      title: "Agents/Branches",
      value: stats.totalAgents,
      formattedValue: formatNumber(stats.totalAgents),
      icon: <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-green-500" />,
      bg: "bg-green-50",
      subtext: `${stats.totalBranches} branches`,
    },
    {
      title: "Billers",
      value: stats.totalBillers,
      formattedValue: formatNumber(stats.totalBillers),
      icon: <BuildingOfficeIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />,
      bg: "bg-yellow-50",
      subtext: `${stats.serviceProviders} service providers`,
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      formattedValue: formatNumber(stats.totalTransactions),
      icon: <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />,
      bg: "bg-purple-50",
      growth: stats.monthlyGrowth.transactions,
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      formattedValue: formatETB(stats.totalRevenue),
      icon: <CurrencyDollarIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />,
      bg: "bg-red-50",
      growth: stats.monthlyGrowth.revenue,
    },
  ];

  // Additional Metrics Cards
  const additionalMetrics = [
    {
      title: "Financial Institutions",
      value: stats.financialInstitutions,
      icon: <CreditCardIcon className="w-5 h-5 text-indigo-500" />,
      bg: "bg-indigo-50",
    },
    {
      title: "Mobile & Wallets",
      value: stats.mobileWallets,
      icon: <DevicePhoneMobileIcon className="w-5 h-5 text-pink-500" />,
      bg: "bg-pink-50",
    },
    {
      title: "Active Agents",
      value: stats.systemHealth.activeAgents,
      formattedValue: `${formatNumber(stats.systemHealth.activeAgents)} (${Math.round((stats.systemHealth.activeAgents / stats.totalAgents) * 100)}%)`,
      icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50",
    },
    {
      title: "System Uptime",
      value: stats.systemHealth.uptime,
      formattedValue: `${stats.systemHealth.uptime}%`,
      icon: <ShieldCheckIcon className="w-5 h-5 text-cyan-500" />,
      bg: "bg-cyan-50",
    },
  ];

  // Transaction Trend Chart Data
  const trendChartData = {
    labels: stats.transactionTrends.labels,
    datasets: [
      {
        label: "Monthly Transactions",
        data: stats.transactionTrends.values,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Transactions: ${formatNumber(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          }
        }
      }
    }
  };

  // Payment Methods Doughnut Chart
  const paymentChartData = {
    labels: ["Mobile", "Internet Banking", "Agent", "Bank"],
    datasets: [
      {
        data: [
          stats.paymentMethods.mobile,
          stats.paymentMethods.internet,
          stats.paymentMethods.agent,
          stats.paymentMethods.bank,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "white",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}% (${percentage}%)`;
          }
        }
      }
    },
  };

  // Bar Chart Data
  const barChartData = {
    labels: mainCardData.map((c) => c.title),
    datasets: [
      {
        label: "Overview",
        data: mainCardData.map((c) => c.value),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"],
        borderRadius: 8,
        barPercentage: 0.7,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (mainCardData[context.dataIndex]?.title === "Total Revenue") {
              return `${label}: ${formatETB(value)}`;
            }
            return `${label}: ${formatNumber(value)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          }
        },
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" links={adminLinks}>
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500
                  bg-clip-text text-transparent">
            Welcome to Derash Admin 
          </h1>

          <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            National Bill Aggregation Platform - Monitor users, agents, billers, transactions, and revenue with real-time insights.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          
        </div>
      </div>

      {/* MAIN STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
        {mainCardData.map((c, index) => (
          <div
            key={c.title}
            className={`group rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${c.bg} ${c.bg.replace('bg-', 'hover:bg-')}/80`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                {c.icon}
              </div>
              {c.growth !== undefined && (
                <div className="flex items-center gap-1 bg-white/50 rounded-full px-2 py-1">
                  <ArrowTrendingUpIcon className={`w-3 h-3 ${c.growth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs font-semibold ${c.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {c.growth >= 0 ? '+' : ''}{c.growth}%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 md:mt-4 lg:mt-5">
              <p className="text-gray-500 text-xs md:text-sm font-semibold tracking-wide uppercase">
                {c.title}
              </p>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1 md:mt-2 tracking-tight">
                {c.formattedValue}
              </h2>

              {c.subtext && (
                <p className="text-xs text-gray-400 mt-1">{c.subtext}</p>
              )}

              <div className="mt-2 md:mt-3 h-1 w-8 md:w-10 bg-red-500 rounded-full opacity-70"></div>
            </div>
          </div>
        ))}
      </div>

      {/* ADDITIONAL METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {additionalMetrics.map((metric) => (
          <div key={metric.title} className={`${metric.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white rounded-lg shadow-sm">
                {metric.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{metric.title}</p>
                <p className="text-sm md:text-base font-bold text-gray-900">
                  {metric.formattedValue || formatNumber(metric.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1 - Transaction Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Transaction Trend Line Chart */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Transaction <span className="text-red-500">Trends 2024</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Monthly transaction volume growth</p>
          </div>
          <div className="p-3 md:p-4">
            <div className="w-full h-[250px] md:h-[300px]">
              <Line data={trendChartData} options={trendOptions} />
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Payment <span className="text-red-500">Methods</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Distribution by channel</p>
          </div>
          <div className="p-3 md:p-4">
            <div className="w-full h-[250px] md:h-[300px]">
              <Doughnut data={paymentChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 - System Overview & Top Billers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* System Overview Bar Chart */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              System <span className="text-red-500">Analytics</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Key metrics overview</p>
          </div>
          <div className="p-3 md:p-4">
            <div className="w-full h-[250px] md:h-[300px]">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Top Billers Table */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Top <span className="text-red-500">Billers</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Highest transaction volume</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600">Biller</th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-600">Transactions</th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topBillers.map((biller, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-3 text-sm font-medium text-gray-900">{biller.name}</td>
                    <td className="px-4 md:px-6 py-3 text-sm text-right text-gray-600">{formatNumber(biller.transactions)}</td>
                    <td className="px-4 md:px-6 py-3 text-sm text-right font-semibold text-gray-900">{formatETB(biller.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                Recent <span className="text-red-500">Transactions</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Latest payment activities</p>
            </div>
            <button className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
              View All →
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600">Transaction ID</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600">Biller</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600">Agent</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-600">Amount</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-4 md:px-6 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 text-sm font-mono text-gray-600">{tx.id}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-gray-900">{tx.biller}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-gray-600">{tx.agent}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-right font-semibold text-gray-900">{formatETB(tx.amount)}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-4 md:px-6 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYSTEM HEALTH INDICATORS */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">System Health</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-green-900 mt-1">{stats.systemHealth.uptime}% Uptime</p>
          <p className="text-xs text-green-600 mt-1">Response: {stats.systemHealth.responseTime}ms</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Digital Payment Goal</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-blue-900 mt-1">80% Population</p>
          <p className="text-xs text-blue-600 mt-1">Target: 5 fiscal years</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Cashless Society</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-purple-900 mt-1">In Progress</p>
          <p className="text-xs text-purple-600 mt-1">Minimizing money laundry</p>
        </div>
      </div>
    </DashboardLayout>
  );
}