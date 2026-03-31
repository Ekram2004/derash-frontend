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
  Legend,
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

      // 🛡️ Safety defaults (prevents undefined issues)
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

  if (!stats) return <p>Loading...</p>;

  // ✅ Keep ALL values as numbers (important)
  const cardData = [
    {
      title: "Users",
      value: stats.totalUsers,
      icon: <UserGroupIcon className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Agents",
      value: stats.totalAgents,
      icon: <UsersIcon className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Billers",
      value: stats.totalBillers,
      icon: <BanknotesIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Revenue",
      value: stats.totalRevenue,
      icon: <CurrencyDollarIcon className="w-8 h-8 text-red-500" />,
    },
  ];

  // 📊 Chart Data (no string parsing anymore 🚀)
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
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cardData.map((c) => (
          <div
            key={c.title}
            className="bg-white shadow-lg rounded-lg p-6 flex items-center gap-4"
          >
            {c.icon}
            <div>
              <p className="text-gray-500">{c.title}</p>

              <h2 className="text-2xl font-bold">
                {c.title === "Revenue"
                  ? formatETB(c.value) // 🇪🇹 ETB formatting here
                  : c.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Overview Chart</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "bottom" },
            },
          }}
        />
      </div>
    </DashboardLayout>
  );
}
