import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { adminApi } from "../api/admin.api";
import type { ReportData,User,Biller,Agent } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import * as XLSX from "xlsx";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const load = async () => {
      const [r, u, b, a] = await Promise.all([
        adminApi.getReports(),
        adminApi.getUsers(),
        adminApi.getBillers(),
        adminApi.getAgents(),
      ]);
      setReports(r);
      setUsers(u);
      setBillers(b);
      setAgents(a);
    };
    load();
  }, []);

  // Pie chart: Revenue distribution
  const pieData = {
    labels: reports.map((r) => r.name),
    datasets: [
      {
        label: "Revenue",
        data: reports.map((r) => r.totalRevenue),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  // Bar chart: Transactions
  const barData = {
    labels: reports.map((r) => r.name),
    datasets: [
      {
        label: "Transactions",
        data: reports.map((r) => r.totalTransactions),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  // Export table data to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "reports.xlsx");
  };

  return (
    <DashboardLayout title="Reports" links={adminLinks}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Admin Analytics Dashboard</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          onClick={exportToExcel}
        >
          Export Reports
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="font-bold mb-4">Revenue Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="font-bold mb-4">Transactions Comparison</h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="font-bold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="font-bold mb-2">Total Billers</h3>
          <p className="text-3xl font-bold text-green-600">{billers.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h3 className="font-bold mb-2">Total Agents</h3>
          <p className="text-3xl font-bold text-yellow-500">{agents.length}</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <h3 className="font-bold mb-4">Detailed Report Table</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th>Total Transactions</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.name} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{r.name}</td>
                <td>{r.totalTransactions}</td>
                <td>${r.totalRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}