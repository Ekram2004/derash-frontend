import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { getAgentReport } from "../api/agent.api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ReportData {
  totalTransactions: number;
  totalAmount: number;
  totalCommission: number;
  statusBreakdown: {
    SUCCESSFUL: number;
    FAILED: number;
    PENDING: number;
    REVERSED: number;
    TIMEOUT: number;
  };
  chartData: {
    date: string;
    amount: number;
  }[];
}

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getAgentReport({ fromDate, toDate });
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const exportCSV = () => {
    if (!report) return;

    const rows = [
      ["Total Transactions", report.totalTransactions],
      ["Total Amount", report.totalAmount],
      ["Total Commission", report.totalCommission],
      [],
      ["Date", "Amount"],
      ...report.chartData.map((row) => [row.date, row.amount]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "agent_report.csv";
    link.click();
  };

  return (
    <DashboardLayout title="Reports" links={agentLinks}>
      <div className="space-y-8">
        {/* ---------------- Filters ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">Report Filters</h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <button
              onClick={fetchReport}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>

            <button
              onClick={exportCSV}
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* ---------------- Summary Cards ---------------- */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h3 className="font-semibold mb-2">Total Transactions</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {report.totalTransactions}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h3 className="font-semibold mb-2">Total Amount</h3>
                <p className="text-3xl font-bold text-green-600">
                  {report.totalAmount} ETB
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h3 className="font-semibold mb-2">Total Commission</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {report.totalCommission} ETB
                </p>
              </div>
            </div>

            {/* ---------------- Table ---------------- */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">Transaction Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b">Date</th>
                      <th className="py-2 px-4 border-b">Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.chartData.map((row) => (
                      <tr key={row.date} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{row.date}</td>
                        <td className="py-2 px-4 border-b">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---------------- Chart ---------------- */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">
                Revenue Trend
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report.chartData}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ---------------- Status Breakdown ---------------- */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">
                Status Breakdown
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {Object.entries(report.statusBreakdown).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <p className="font-semibold">{key}</p>
                      <p className="text-lg">{value}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}