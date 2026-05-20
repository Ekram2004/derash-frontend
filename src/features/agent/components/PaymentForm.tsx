import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

interface Bill {
  bill_id: string;
  agent_id: string;
  transactionId: string;
  idempotencyKey: string;
  total_to_pay: number | null;
  amount_due: number | null;
  due_date: string;
  allows_partial: boolean;
  status?: string;
  late_penalty?: number;
  currency?: string;
}

interface PaymentFormProps {
  bill: Bill;
  onConfirm: (method: string, phone: string, amount: number) => void;
  onBack: () => void;
  loading: boolean;
}

export default function PaymentForm({ bill, onConfirm, onBack, loading }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("CBE");
  const [phone, setPhone] = useState("");
  const [editableAmount, setEditableAmount] = useState<number>(bill.total_to_pay ?? bill.amount_due ?? 0);
  const [isProcessing, setIsProcessing] = useState(true);

  const maxAmount = bill.total_to_pay !== null ? bill.total_to_pay : bill.amount_due || 0;

  // Simulate data sync (remove in production if not needed)
  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 500);
    return () => clearTimeout(timer);
  }, [bill]);

  // Telebirr check (you can adjust logic based on agent code, not bill)
  const isTelebirr = paymentMethod === "TELEBIRR";
  const isPhoneMissing = isTelebirr && !phone.trim();

  // Expiry blocking (if bill status is EXPIRED and no late penalty)
  const isBlockedByExpiry = bill.status === "EXPIRED" && Number(bill.late_penalty) <= 0;

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <CreditCardIcon className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
          {isProcessing && (
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
          ⚠️ ERROR: This bill has expired and the biller does not allow late payments.
          The customer must visit the biller's office face-to-face to settle this.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Editable amount (only if partial allowed) */}
        {bill.allows_partial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay <span className="text-xs text-red-500">(Partial allowed)</span>
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={editableAmount}
                onChange={(e) => setEditableAmount(Number(e.target.value))}
                min={1}
                max={maxAmount}
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                required
                disabled={isProcessing || isBlockedByExpiry}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max: {maxAmount} {bill.currency || "ETB"}</p>
          </div>
        )}

        {/* Read‑only fields (auto‑generated from search) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl">
          <ReadOnlyField label="Bill ID" value={bill.bill_id} />
          <ReadOnlyField label="Agent ID" value={bill.agent_id} />
          <ReadOnlyField label="Transaction ID" value={bill.transactionId} />
          <ReadOnlyField label="Idempotency Key" value={bill.idempotencyKey} />
          <ReadOnlyField label="Due Date" value={bill.due_date} />
        </div>

        {/* Payment Method */}
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

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number {isTelebirr && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              required
              disabled={isBlockedByExpiry}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || isProcessing || isPhoneMissing || isBlockedByExpiry}
            className="relative overflow-hidden group flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
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
    </motion.div>
  );
}

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