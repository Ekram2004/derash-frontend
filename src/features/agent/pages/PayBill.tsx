import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { searchBills, processPayment } from "../api/agent.api";

// ------------------ Types ------------------
interface Bill {
  bill_id: string;
  agent_id: string;
  transactionId: string;
  idempotencyKey: string;
  biller_name: string;
  customer_name?: string;
  amount_due: number | null;
  late_penalty: number;
  total_to_pay: number | null;
  due_date: string;
  status: string;
  currency: string;
  warning: string | null;
  is_blocked: boolean;
  allows_partial: boolean;
}

interface Receipt {
  transaction_ref: string;
  customer: string;
  amount_paid: string;
  remaining_balance: string;
  status: string;
  due_date: string;
  paymentDate: string;
}

const HARDCODED_AGENT_CODE = "CBE-1001";

export default function PayBill() {
  const [view, setView] = useState<"search" | "pay" | "receipt">("search");
  const [billReference, setBillReference] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!billReference.trim()) {
      setError("Please enter a Bill Reference.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await searchBills({
        billReference: billReference.trim(),
        agentCode: HARDCODED_AGENT_CODE,
      });
      const billData = response.data || response;
      setSelectedBill(billData);
      setView("search");
    } catch (err: any) {
      const message = err.response?.data?.message || "No unpaid bill found.";
      setError(message);
      setSelectedBill(null);
    } finally {
      setLoading(false);
    }
  };

  const goToPay = () => setView("pay");

  const handleConfirmPayment = async (
    paymentMethod: string,
    phone: string,
    manualAmount: number
  ) => {
    if (!selectedBill) return;
    try {
      setLoading(true);
      setError("");
      const finalAmount =
        manualAmount > 0
          ? Number(manualAmount)
          : Number(selectedBill.total_to_pay) || Number(selectedBill.amount_due) || 0;
      if (finalAmount <= 0) throw new Error("Invalid payment amount.");
      const payload = {
        bill_id: selectedBill.bill_id,
        agent_id: selectedBill.agent_id,
        amount: finalAmount,
        transactionId: selectedBill.transactionId,
        idempotencyKey: selectedBill.idempotencyKey,
        payment_method: paymentMethod,
        payer_phone: phone.trim(),
      };
      const result = await processPayment(payload);
      const receiptData = result?.receipt || result?.data?.receipt;
      if (receiptData) {
        setReceipt(receiptData);
        setView("receipt");
      } else {
        throw new Error("Payment succeeded but receipt missing.");
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      if (serverMessage.includes("Unique constraint")) {
        alert("Transaction ID expired. Please search for the bill again to refresh.");
        setView("search");
        setSelectedBill(null);
      } else {
        alert(`Payment failed: ${serverMessage}`);
      }
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    setView("search");
    setSelectedBill(null);
    setReceipt(null);
    setBillReference("");
    setError("");
  };

  // Helper for numeric fallback
  const safeNumber = (value: number | null | undefined, fallback = 0) =>
    typeof value === "number" && !isNaN(value) ? value : fallback;

  return (
    <DashboardLayout title="Agent Terminal" links={agentLinks}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
            Agent Payment Terminal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Search, pay, and print receipts – all in one place.</p>
        </div>

        {/* VIEW 1: SEARCH + BILL SUMMARY */}
        {view === "search" && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Search Bill</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                  placeholder="Enter Bill Reference..."
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Bill Summary Card */}
            {selectedBill && (
              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-red-500 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Bill Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Customer Name:</span>
                      <span className="font-semibold">{selectedBill.customer_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Biller:</span>
                      <span className="font-semibold">{selectedBill.biller_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-semibold text-blue-600">{selectedBill.status}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Due Date:</span>
                      <span className="font-semibold">{selectedBill.due_date}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Amount Due:</span>
                      <span className="font-semibold">
                        {safeNumber(selectedBill.amount_due)} {selectedBill.currency || "ETB"}
                      </span>
                    </div>
                    {selectedBill.late_penalty > 0 && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-red-500">Late Penalty:</span>
                        <span className="font-semibold text-red-500">
                          {selectedBill.late_penalty} {selectedBill.currency || "ETB"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total to Pay:</span>
                    <span className="text-2xl font-black text-red-600">
                      {safeNumber(selectedBill.total_to_pay) || safeNumber(selectedBill.amount_due)} {selectedBill.currency || "ETB"}
                    </span>
                  </div>
                  {selectedBill.warning && (
                    <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                      selectedBill.is_blocked ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {selectedBill.warning}
                    </div>
                  )}
                  <button
                    onClick={goToPay}
                    disabled={selectedBill.is_blocked}
                    className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all duration-300 ${
                      selectedBill.is_blocked
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:scale-[1.02]"
                    }`}
                  >
                    {selectedBill.is_blocked ? "Payment Blocked" : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PAYMENT FORM (full features, no animations) */}
        {view === "pay" && selectedBill && (
          <PaymentForm
            bill={selectedBill}
            onConfirm={handleConfirmPayment}
            onBack={() => setView("search")}
            loading={loading}
          />
        )}

        {/* VIEW 3: RECEIPT */}
        {view === "receipt" && receipt && (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-red-500">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Payment Successful</h2>
              <p className="text-gray-500 text-sm mt-1">Receipt generated</p>
            </div>
            <div className="bg-gray-50 p-6 font-mono text-xs space-y-3 border-t border-gray-100">
              <div className="flex justify-between"><span>TRANSACTION REF:</span> <strong>{receipt.transaction_ref}</strong></div>
              <div className="flex justify-between"><span>CUSTOMER:</span> <strong>{receipt.customer}</strong></div>
              <div className="flex justify-between"><span>AMOUNT PAID:</span> <strong className="text-red-600">{receipt.amount_paid}</strong></div>
              <div className="flex justify-between"><span>REM. BALANCE:</span> <strong>{receipt.remaining_balance || "0.00"}</strong></div>
              <div className="flex justify-between"><span>STATUS:</span> <strong>{receipt.status}</strong></div>
              <div className="flex justify-between"><span>DUE DATE:</span> <strong>{receipt.due_date}</strong></div>
              <hr />
              <p className="text-center">PAID ON: {receipt.paymentDate}</p>
            </div>
            <button onClick={resetPayment} className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 font-bold hover:shadow-lg transition-all duration-300">
              Done / New Payment
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ------------------ Payment Form Component (safe, no external icons) ------------------
function PaymentForm({ bill, onConfirm, onBack, loading }: any) {
  const [paymentMethod, setPaymentMethod] = useState("CBE");
  const [phone, setPhone] = useState("");
  const [editableAmount, setEditableAmount] = useState(() => {
    const amount = bill?.total_to_pay ?? bill?.amount_due ?? 0;
    return typeof amount === "number" && !isNaN(amount) ? amount : 0;
  });
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 500);
    return () => clearTimeout(timer);
  }, [bill]);

  const maxAmount = (() => {
    const total = bill?.total_to_pay ?? bill?.amount_due ?? 0;
    return typeof total === "number" && !isNaN(total) ? total : 0;
  })();
  const allowsPartial = bill?.allows_partial === true;
  const isTelebirr = paymentMethod === "TELEBIRR";
  const isPhoneMissing = isTelebirr && !phone.trim();
  const isExpired = bill?.status === "EXPIRED";
  const latePenalty = typeof bill?.late_penalty === "number" ? bill.late_penalty : 0;
  const isBlockedByExpiry = isExpired && latePenalty <= 0;
  const currency = bill?.currency || "ETB";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert("Please enter a phone number.");
      return;
    }
    if (editableAmount <= 0 || editableAmount > maxAmount) {
      alert(`Please enter a valid amount between 1 and ${maxAmount}.`);
      return;
    }
    onConfirm(paymentMethod, phone, editableAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
          {isSyncing && (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse font-bold">
              SYNCING...
            </span>
          )}
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-red-600 font-medium">
          ← Back
        </button>
      </div>

      {isBlockedByExpiry && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-sm">
          ⚠️ ERROR: This bill has expired and the biller does not allow late payments. The customer must visit the biller's office face-to-face to settle this.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Editable amount (partial) */}
        {allowsPartial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay <span className="text-xs text-red-500">(Partial allowed)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">ETB</span>
              </div>
              <input
                type="number"
                value={editableAmount}
                onChange={(e) => setEditableAmount(Number(e.target.value))}
                min={1}
                max={maxAmount}
                className="w-full pl-12 pr-3 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                required
                disabled={isSyncing || isBlockedByExpiry}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max: {maxAmount} {currency}</p>
          </div>
        )}

        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl">
          <ReadOnlyField label="Bill ID" value={bill?.bill_id || "N/A"} />
          <ReadOnlyField label="Agent ID" value={bill?.agent_id || "N/A"} />
          <ReadOnlyField label="Transaction ID" value={bill?.transactionId || "N/A"} />
          <ReadOnlyField label="Idempotency Key" value={bill?.idempotencyKey || "N/A"} />
          <ReadOnlyField label="Due Date" value={bill?.due_date || "N/A"} />
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={isBlockedByExpiry}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            required
          >
            <option value="CBE">CBE (Commercial Bank of Ethiopia)</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="CASH">Cash</option>
          </select>
        </div>

        {/* Phone number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number {isTelebirr && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            required
            disabled={isBlockedByExpiry}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">
            Back
          </button>
          <button
            type="submit"
            disabled={loading || isSyncing || isPhoneMissing || isBlockedByExpiry}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isBlockedByExpiry
              ? "Payment Blocked"
              : isPhoneMissing
              ? "Phone Required"
              : "Confirm Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper component for read-only fields
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full p-2 rounded-lg border bg-gray-100 text-gray-700 text-xs font-mono"
      />
    </div>
  );
}