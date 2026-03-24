import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
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

// ------------------ Types ------------------

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  total_amount: number;
  status: "INITIATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "REVERSED" | "TIMEOUT";
  createdAt: string;
  bill: {
    bill_reference: string;
    customer: {
      full_name: string;
    };
    biller: {
      name: string;
    };
  };
}

interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
}

// ------------------ Component ------------------

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------ Fetch Data ------------------

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/agent/dashboard");
        const data = await response.json();

        setStats(data.stats);
        setTransactions(data.recentTransactions);
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ------------------ Chart Data ------------------

  const chartData = transactions.map((t) => ({
    date: format(new Date(t.createdAt), "MM-dd"),
    revenue: t.total_amount,
  }));

  if (loading) {
    return (
      <DashboardLayout title="Agent Dashboard" links={agentLinks}>
        <div className="text-center py-10">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agent Dashboard" links={agentLinks}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          Agent Performance Overview
        </h1>

        {/* ---------------- KPI Cards ---------------- */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <KpiCard title="Total Transactions" value={stats.totalTransactions} />
            <KpiCard title="Successful" value={stats.successfulTransactions} />
            <KpiCard title="Pending" value={stats.pendingTransactions} />
            <KpiCard title="Failed" value={stats.failedTransactions} />
            <KpiCard title="Total Revenue (ETB)" value={stats.totalRevenue} />
          </div>
        )}

        {/* ---------------- Revenue Chart ---------------- */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">
            Revenue Trend
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ---------------- Recent Transactions ---------------- */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <h3 className="text-xl font-semibold p-4">
            Recent Transactions
          </h3>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Transaction ID</th>
                <th>Customer</th>
                <th>Biller</th>
                <th>Bill Ref</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{t.transactionId}</td>
                  <td>{t.bill.customer.full_name}</td>
                  <td>{t.bill.biller.name}</td>
                  <td>{t.bill.bill_reference}</td>
                  <td>{t.total_amount} ETB</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>{format(new Date(t.createdAt), "yyyy-MM-dd")}</td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No transactions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ------------------ Reusable Components ------------------

function KpiCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white shadow rounded-lg p-6 text-center">
      <h3 className="font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const color =
    status === "SUCCESSFUL"
      ? "bg-green-500"
      : status === "FAILED"
      ? "bg-red-500"
      : status === "PENDING"
      ? "bg-yellow-500"
      : "bg-gray-500";

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs text-white ${color}`}
    >
      {status}
    </span>
  );
}