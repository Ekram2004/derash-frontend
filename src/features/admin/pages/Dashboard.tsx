// src/features/admin/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminApi } from "../api/admin.api";
import type { Stats } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await adminApi.getStats();

      setStats({
        totalUsers: data.totalUsers || 0,
        totalAgents: data.totalAgents || 0,
        totalBillers: data.totalBillers || 0,
        totalTransactions: data.totalTransactions || 0,
        totalRevenue: data.totalRevenue || 0,
      });
    };

    load();
  }, []);

  if (!stats) {
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

  const cardData = [
    {
      title: "Users",
      value: stats.totalUsers,
      formattedValue: formatNumber(stats.totalUsers),
      icon: <UserGroupIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-50/80",
    },
    {
      title: "Agents",
      value: stats.totalAgents,
      formattedValue: formatNumber(stats.totalAgents),
      icon: <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-green-500" />,
      bg: "bg-green-50",
      hoverBg: "hover:bg-green-50/80",
    },
    {
      title: "Billers",
      value: stats.totalBillers,
      formattedValue: formatNumber(stats.totalBillers),
      icon: <BanknotesIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />,
      bg: "bg-yellow-50",
      hoverBg: "hover:bg-yellow-50/80",
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      formattedValue: formatNumber(stats.totalTransactions),
      icon: <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />,
      bg: "bg-purple-50",
      hoverBg: "hover:bg-purple-50/80",
    },
    {
      title: "Revenue",
      value: stats.totalRevenue,
      formattedValue: formatETB(stats.totalRevenue),
      icon: <CurrencyDollarIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />,
      bg: "bg-red-50",
      hoverBg: "hover:bg-red-50/80",
    },
  ];

  const chartData = {
    labels: cardData.map((c) => c.title),
    datasets: [
      {
        label: "Overview",
        data: cardData.map((c) => c.value),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#EF4444",
        ],
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: "bottom" as const,
        labels: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          boxWidth: window.innerWidth < 768 ? 8 : 12,
          padding: window.innerWidth < 768 ? 8 : 16,
        },
      },
      title: { display: false },
      tooltip: {
        bodyFont: {
          size: window.innerWidth < 768 ? 11 : 12,
        },
        titleFont: {
          size: window.innerWidth < 768 ? 12 : 13,
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (cardData[context.dataIndex].title === "Revenue") {
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
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          callback: function(value: any) {
            if (typeof value === 'number') {
              return formatNumber(value);
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0,
        },
      },
    },
  };

  return (
    <DashboardLayout title="Admin Dashboard" links={adminLinks}>
      
      {/* HEADER - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="max-w-2xl">
          <h1 className="text-base md:text-lg lg:text-xl font-bold
                 bg-gradient-to-r from-red-500 via-gray-900 to-red-500
                  bg-clip-text text-transparent">
            Welcome{" "}
            <span className="text-base md:text-lg lg:text-xl font-bold
                 bg-gradient-to-r from-red-500 via-gray-700 to-red-500
                  bg-clip-text text-transparent">
              Back
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            Monitor users, agents, billers, transactions, and revenue with real-time insights.
          </p>
        </div>
      </div>

      {/* CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6 mb-8 md:mb-10">
        {cardData.map((c, index) => (
          <div
            key={c.title}
            className={`group rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${c.bg} ${c.hoverBg}`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                {c.icon}
              </div>
            </div>

            <div className="mt-3 md:mt-4 lg:mt-5">
              <p className="text-gray-500 text-xs md:text-sm font-semibold tracking-wide uppercase">
                {c.title}
              </p>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1 md:mt-2 tracking-tight">
                {c.formattedValue}
              </h2>

              <div className="mt-2 md:mt-3 h-1 w-8 md:w-10 bg-red-500 rounded-full opacity-70"></div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART CARD - Responsive */}
      <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Chart Header - Responsive */}
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 border-b border-gray-100">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
            System <span className="text-red-500">Analytics</span>
          </h2>
          <p className="text-gray-400 mt-1 md:mt-2 font-medium text-sm md:text-base">
            Visual overview of system metrics and performance distribution.
          </p>
        </div>

        {/* Chart Body - Responsive */}
        <div className="p-3 md:p-4 lg:p-6">
          <div className="w-full h-auto min-h-[300px] md:min-h-[350px] lg:min-h-[400px]">
            <Bar
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}