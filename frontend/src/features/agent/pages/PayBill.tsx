import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { searchBills, processPayment } from "../api/agent.api";

import {
  Search,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Phone,
  CreditCard,
  DollarSign,
  Info,
  XCircle,
} from "lucide-react";

interface Bill {
  bill_id: string;
  agent_id: string;
  transactionId: string;
  idempotencyKey: string;
  biller_name: string;
  customerName?: string;
  customer_name?: string;
  customer?: { fullName?: string };
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

export default function PayBill() {
  const [view, setView] = useState<"search" | "pay" | "receipt">("search");
  const [billReference, setBillReference] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; billRef?: string } | null>(null);

  const handleSearch = async () => {
    if (!billReference.trim()) {
      setError("Please enter a Bill Reference.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setErrorDetails(null);
      
      const response = await searchBills({
        billReference: billReference.trim()
      });
      
      const billData = response.data || response;

      const stabilizedBillData = {
        ...billData,
        amount_due: billData.amount_due ?? billData.amountDue ?? null,
        total_to_pay: billData.total_to_pay ?? billData.totalToPay ?? null,
      };

      setSelectedBill(stabilizedBillData);
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
    phone: string,
    manualAmount: number
  ) => {
    if (!selectedBill) return;
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);

      const fallbackAmount = Number(selectedBill.total_to_pay) || Number(selectedBill.amount_due) || 0;
      const finalAmount = manualAmount > 0 ? Number(manualAmount) : fallbackAmount;
      
      if (finalAmount <= 0) throw new Error("Invalid payment amount.");
      
      const payerPhone = phone.trim() || "0000000000";
      
      const freshTxId = selectedBill.transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const freshIdempotencyKey = selectedBill.idempotencyKey || `IDEM-${selectedBill.bill_id}-${Date.now()}`;

      const payload = {
        billId: String(selectedBill.bill_id),
        agentId: String(selectedBill.agent_id),
        amount: Number(Number(finalAmount).toFixed(2)),
        transactionId: String(freshTxId),
        idempotencyKey: String(freshIdempotencyKey),
        payerPhone: payerPhone,
      };

      const result = await processPayment(payload as any);
      const receiptData = result?.receipt || result?.data?.receipt || result;
      
      if (receiptData) {
        setReceipt(receiptData);
        setView("receipt");
      } else {
        throw new Error("Payment succeeded but receipt details missing from response mapping.");
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Bad Request";
      
      setErrorDetails({
        title: "Payment Processing Failed",
        message: serverMessage,
      });
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
    setError(null);
    setErrorDetails(null);
  };

  const safeNumber = (value: number | null | undefined, fallback = 0) =>
    typeof value === "number" && !isNaN(value) ? value : fallback;

  const getCustomerName = (bill: Bill | null): string => {
    if (!bill) return "N/A";
    return bill.customerName || bill.customer_name || bill.customer?.fullName || "N/A";
  };

  return (
    <DashboardLayout title="Agent Terminal" links={agentLinks}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
            Agent Payment Terminal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Search, pay, and print receipts – all in one place.</p>
        </div>

        {/* VIEW 1: SEARCH + BILL SUMMARY */}
        {view === "search" && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 rounded-xl">
                  <Search className="w-6 h-6 text-red-600" />
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
                  className="bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              
              {/* Professional Error Card */}
              {errorDetails && (
                <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-fade-in-up">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-800">{errorDetails.title}</h3>
                      <p className="text-red-700 mt-1">{errorDetails.message}</p>
                      {errorDetails.billRef && (
                        <p className="text-red-600 text-sm mt-2 font-mono">Bill Reference: {errorDetails.billRef}</p>
                      )}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => {
                            setErrorDetails(null);
                            setError(null);
                            setBillReference("");
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Clear & Try Again
                        </button>
                        <button
                          onClick={() => {
                            setErrorDetails(null);
                            setError(null);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {error && !errorDetails && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>

            {/* Bill Summary Card */}
            {selectedBill && (
              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-xl animate-fade-in-up">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-xl">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Bill Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Customer Name:</span>
                      <span className="font-semibold">{getCustomerName(selectedBill)}</span>
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
                      <Info className="w-5 h-5" />
                      {selectedBill.warning}
                    </div>
                  )}
                  <button
                    onClick={goToPay}
                    disabled={selectedBill.is_blocked}
                    className="w-full mt-6 py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    {selectedBill.is_blocked ? "Payment Blocked" : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PAYMENT FORM */}
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
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-red-500 animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Payment Successful</h2>
              <p className="text-gray-500 text-sm mt-1">Receipt generated</p>
            </div>
            <div className="bg-gray-50 p-6 font-mono text-xs space-y-3 border-t border-gray-100">
              <div className="flex justify-between"><span>TRANSACTION REF:</span> <strong>{receipt.transaction_ref}</strong></div>
              <div className="flex justify-between"><span>CUSTOMER:</span> <strong>{selectedBill ? getCustomerName(selectedBill) : receipt.customer}</strong></div>
              <div className="flex justify-between"><span>AMOUNT PAID:</span> <strong className="text-red-600">{receipt.amount_paid}</strong></div>
              <div className="flex justify-between"><span>REM. BALANCE:</span> <strong>{receipt.remaining_balance ?? "0.00"}</strong></div>
              <div className="flex justify-between"><span>STATUS:</span> <strong>{receipt.status}</strong></div>
              <div className="flex justify-between"><span>DUE DATE:</span> <strong>{receipt.due_date}</strong></div>
              <hr />
              <p className="text-center">PAID ON: {receipt.paymentDate || new Date().toISOString().split("T")[0]}</p>
            </div>
            <button 
              onClick={resetPayment} 
              className="w-full bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white py-4 font-bold rounded-b-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> Done / New Payment
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ------------------ Fixed Payment Form (No Manual Payment Method Selection) ------------------

function PaymentForm({ bill, onConfirm, onBack, loading }: any) {
  const [phone, setPhone] = useState("");
  const [editableAmount, setEditableAmount] = useState(0);

  const maxAmount = (() => {
    const total = bill?.total_to_pay ?? bill?.amount_due ?? 0;
    return typeof total === "number" && !isNaN(total) ? total : 0;
  })();
  const allowsPartial = bill?.allows_partial === true;
  const isExpired = bill?.status === "EXPIRED";
  const latePenalty = typeof bill?.late_penalty === "number" ? bill.late_penalty : 0;
  const isBlockedByExpiry = isExpired && latePenalty <= 0;
  const currency = bill?.currency || "ETB";

  useEffect(() => {
    // Amount field gets its value right away (or with a tiny layout delay)
    const valTimer = setTimeout(() => {
      setEditableAmount(maxAmount);
    }, 100);

    return () => clearTimeout(valTimer);
  }, [bill, maxAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allowsPartial && (editableAmount <= 0 || editableAmount > maxAmount)) {
      alert(`Please enter a valid amount between 1 and ${maxAmount}.`);
      return;
    }
    onConfirm(phone, allowsPartial ? editableAmount : maxAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <CreditCard className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
        </div>
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-red-600 font-medium transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {isBlockedByExpiry && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>ERROR: This bill has expired and late payments are disabled.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
            <span>Amount to Pay ({currency})</span>
            {allowsPartial ? (
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full">Partial Allowed</span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full">Fixed Full Payment Only</span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={editableAmount || ""}
              onChange={(e) => setEditableAmount(Number(e.target.value))}
              min={1}
              max={maxAmount}
              readOnly={!allowsPartial}
              className={`w-full p-3 border rounded-xl outline-none transition font-semibold text-lg ${
                !allowsPartial 
                  ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              }`}
              required
              disabled={isBlockedByExpiry}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Total Bill Invoice Balance: {maxAmount} {currency}</p>
        </div>

        {/* These components render instantly, but hold off on displaying data values for 3 seconds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl">
          <ReadOnlyField label="Bill ID" value={bill?.bill_id || "N/A"} />
          <ReadOnlyField label="Agent ID" value={bill?.agent_id || "N/A"} />
          <ReadOnlyField label="Transaction ID" value={bill?.transactionId || "N/A"} />
          <ReadOnlyField label="Idempotency Key" value={bill?.idempotencyKey || "N/A"} />
          <ReadOnlyField label="Due Date" value={bill?.due_date || "N/A"} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payer Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
              disabled={isBlockedByExpiry}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="submit"
            disabled={loading || isBlockedByExpiry}
            className="flex-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {loading ? "Processing..." : isBlockedByExpiry ? "Payment Blocked" : "Confirm Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Fixed Dynamic ReadOnlyField component
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const [delayedValue, setDelayedValue] = useState("");

  useEffect(() => {
    // Reset delayed value if the bill data changes
    setDelayedValue("");

    // Start a 3-second countdown before populating the input value field
    const timer = setTimeout(() => {
      setDelayedValue(value);
    }, 3000);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
      <input
        type="text"
        value={delayedValue}
        readOnly
        placeholder="Syncing..."
        className={`w-full p-2 rounded-lg border bg-gray-100 text-gray-700 text-xs font-mono transition-all duration-1000 ${
          delayedValue ? "opacity-100" : "opacity-40"
        }`}
      />
    </div>
  );
}