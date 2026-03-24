import { useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { searchBills, processPayment } from "../api/agent.api";

interface Bill {
  id: string;
  bill_reference: string;
  amount_due: number;
  remaining_bal: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  customer: {
    full_name: string;
  };
  biller: {
    name: string;
    code: string;
  };
}

export default function PayBill() {
  const [billReference, setBillReference] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [billerCode, setBillerCode] = useState("");

  const [results, setResults] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ---------------- SEARCH ----------------

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchBills({
        billReference,
        customerName,
        billerCode,
      });

      setResults(data);
      setSelectedBill(null);
      setMessage("");
    } catch (error) {
      setMessage("Failed to search bills.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PAYMENT ----------------

  const handlePayment = async () => {
    if (!selectedBill) return;

    if (paymentAmount <= 0) {
      setMessage("Payment amount must be greater than zero.");
      return;
    }

    if (paymentAmount > selectedBill.remaining_bal) {
      setMessage("Payment exceeds remaining balance.");
      return;
    }

    try {
      setLoading(true);

      await processPayment({
        billId: selectedBill.id,
        amount: paymentAmount,
        paymentMethod,
      });

      setMessage("Payment processed successfully.");
      setSelectedBill(null);
      setResults([]);
    } catch (error) {
      setMessage("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Pay Bill" links={agentLinks}>
      <div className="space-y-8">

        {/* ---------------- Search Section ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6">
            Search Bill
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              type="text"
              placeholder="Biller Code"
              value={billerCode}
              onChange={(e) => setBillerCode(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* ---------------- Results ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Search Results
          </h2>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Reference</th>
                <th>Customer</th>
                <th>Biller</th>
                <th>Remaining</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {results.map((bill) => (
                <tr key={bill.id} className="border-t">
                  <td className="p-3">{bill.bill_reference}</td>
                  <td>{bill.customer.full_name}</td>
                  <td>{bill.biller.name}</td>
                  <td>{bill.remaining_bal} ETB</td>
                  <td>{bill.status}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setPaymentAmount(bill.remaining_bal);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}

              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------- Payment Section ---------------- */}
        {selectedBill && (
          <div className="bg-white p-6 rounded-xl shadow space-y-6">
            <h2 className="text-xl font-semibold">
              Process Payment
            </h2>

            <div>
              <p><strong>Customer:</strong> {selectedBill.customer.full_name}</p>
              <p><strong>Remaining:</strong> {selectedBill.remaining_bal} ETB</p>
            </div>

            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(Number(e.target.value))
                  }
                  className="border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_APP">Mobile App</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <button
                onClick={handlePayment}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>

            {message && (
              <div className="text-blue-600 font-medium">
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}