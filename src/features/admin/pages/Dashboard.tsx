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

  if (!stats) return <p className="text-center text-gray-500">Loading...</p>;

  const cardData = [
    {
      title: "Users",
      value: stats.totalUsers,
      icon: <UserGroupIcon className="w-8 h-8 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Agents",
      value: stats.totalAgents,
      icon: <UsersIcon className="w-8 h-8 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Billers",
      value: stats.totalBillers,
      icon: <BanknotesIcon className="w-8 h-8 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />,
      bg: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: stats.totalRevenue,
      icon: <CurrencyDollarIcon className="w-8 h-8 text-red-500" />,
      bg: "bg-red-50",
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
      },
    ],
  };

  return (
    <DashboardLayout title="Dashboard Overview" links={adminLinks}>
      {/* Header */}
      <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
        Dashboard <span className="text-red-500">Overview</span>
      </h1>

       <p className="mt-2 text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed 
       font-medium">
        Monitor users, transactions, and revenue at a glance with real-time insights,
         performance metrics, and a clear overview of your system activity.
       </p>

  
</div>
      
      {/* Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
  {cardData.map((c) => (
    <div
      key={c.title}
      className={`group rounded-2xl p-6 border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${c.bg}`}
    >
      {/* Icon */}
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
          {c.icon}
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">
          {c.title}
        </p>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">
          {c.title === "Revenue"
            ? formatETB(c.value)
            : c.value}
        </h2>

        {/* subtle underline accent */}
        <div className="mt-3 h-1 w-10 bg-red-500 rounded-full opacity-70"></div>
      </div>
    </div>
     ))}
     </div>
      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-3xl md:text-4xl text-gray-800">
            Overview <span className="text-red-500">Chart</span>
          </h3>
        </div>

        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "bottom" },
              title: { display: false },
            },
          }}
        />
      </div>
    </DashboardLayout>
  );
}
