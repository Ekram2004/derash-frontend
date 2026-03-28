import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { getAgentTransactions } from "../api/agent.api";
import { format } from "date-fns";

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  total_amount: number;
  agent_share: number;
  status:
    | "INITIATED"
    | "PENDING"
    | "SUCCESSFUL"
    | "FAILED"
    | "REVERSED"
    | "TIMEOUT";
  paymentMethod: string;
  createdAt: string;
  bill: {
    bill_reference: string;
    customer: {
      full_name: string;
    };
  };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [billReference, setBillReference] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [status, setStatus] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const data = await getAgentTransactions({
        fromDate,
        toDate,
        transactionId,
        billReference,
        customerName,
        status,
      });

      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESSFUL":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REVERSED":
        return "bg-purple-500";
      case "TIMEOUT":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <DashboardLayout title="Transactions" links={agentLinks}>
      <div className="space-y-8">

        {/* ---------------- Filters Section ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">Filter Transactions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Bill Reference"
              value={billReference}
              onChange={(e) => setBillReference(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Status</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="REVERSED">Reversed</option>
              <option value="TIMEOUT">Timeout</option>
            </select>
          </div>

          <button
            onClick={fetchTransactions}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {/* ---------------- Transactions Table ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">
            Transaction History
          </h2>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Transaction ID</th>
                <th>Customer</th>
                <th>Bill Ref</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Agent Share</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{tx.transactionId}</td>
                  <td>{tx.bill.customer.full_name}</td>
                  <td>{tx.bill.bill_reference}</td>
                  <td>{tx.amount} ETB</td>
                  <td>{tx.total_amount} ETB</td>
                  <td className="text-green-600 font-medium">
                    {tx.agent_share} ETB
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td>{tx.paymentMethod}</td>
                  <td>
                    {format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm")}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-4 text-gray-500"
                  >
                    No transactions found.
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