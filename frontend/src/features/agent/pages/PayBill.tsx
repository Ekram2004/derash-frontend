// src/features/agent/pages/PayBill.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

// ------------------ Types ------------------
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

const HARDCODED_AGENT_CODE = "CBE-1001";

// Helper to map frontend payment method to backend enum
const mapPaymentMethod = (method: string): string => {
  switch (method) {
    case "CBE":
      return "BANK_TRANSFER";
    case "TELEBIRR":
      return "MOBILE_APP";
    case "CASH":
      return "CASH";
    default:
      return "BANK_TRANSFER";
  }
};

export default function PayBill() {
  const { t } = useTranslation();
  const [view, setView] = useState<"search" | "pay" | "receipt">("search");
  const [billReference, setBillReference] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; billRef?: string } | null>(null);

  const handleSearch = async () => {
    if (!billReference.trim()) {
      setError(t("please_enter_bill_ref"));
      setErrorDetails(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      const response = await searchBills({
        billReference: billReference.trim(),
        agentCode: HARDCODED_AGENT_CODE,
      });
      const billData = response.data || response;
      setSelectedBill(billData);
      setView("search");
    } catch (err: any) {
      const message = err.response?.data?.message || t("no_unpaid_bill_found");
      setSelectedBill(null);
      
      if (message.toLowerCase().includes("already fully paid")) {
        setErrorDetails({
          title: t("bill_already_paid_title"),
          message: t("bill_already_paid_message"),
          billRef: billReference.trim(),
        });
      } else if (message.toLowerCase().includes("no unpaid bill found")) {
        setErrorDetails({
          title: t("bill_not_found_title"),
          message: t("bill_not_found_message", { ref: billReference.trim() }),
          billRef: billReference.trim(),
        });
      } else {
        setErrorDetails({
          title: t("search_failed_title"),
          message: message,
          billRef: billReference.trim(),
        });
      }
      setError(message);
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
      setError(null);
      setErrorDetails(null);
      const finalAmount =
        manualAmount > 0
          ? Number(manualAmount)
          : Number(selectedBill.total_to_pay) || Number(selectedBill.amount_due) || 0;
      if (finalAmount <= 0) throw new Error(t("invalid_payment_amount"));
      
      const backendPaymentMethod = mapPaymentMethod(paymentMethod);
      const payerPhone = phone.trim() || "0000000000";
      
      const payload = {
        billId: selectedBill.bill_id,
        agentId: selectedBill.agent_id,
        amount: finalAmount,
        transactionId: selectedBill.transactionId,
        idempotencyKey: selectedBill.idempotencyKey,
        paymentMethod: backendPaymentMethod,
        payerPhone: payerPhone,
      };
      const result = await processPayment(payload);
      const receiptData = result?.receipt || result?.data?.receipt;
      if (receiptData) {
        setReceipt(receiptData);
        setView("receipt");
      } else {
        throw new Error(t("receipt_missing"));
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      if (serverMessage.includes("Unique constraint")) {
        alert(t("transaction_id_expired"));
        setView("search");
        setSelectedBill(null);
      } else {
        setErrorDetails({
          title: t("payment_failed_title"),
          message: serverMessage,
        });
        setError(serverMessage);
      }
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
    if (!bill) return t("na");
    return bill.customerName || bill.customer_name || bill.customer?.fullName || t("na");
  };

  return (
    <DashboardLayout title={t("agent_terminal")} links={agentLinks}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
            {t("agent_payment_terminal")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("terminal_description")}
          </p>
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
                <h2 className="text-xl font-bold text-gray-800">{t("search_bill")}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                  placeholder={t("enter_bill_reference")}
                  value={billReference}
                  onChange={(e) => setBillReference(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {loading ? t("searching") : t("search")}
                </button>
              </div>

              {/* Professional Error Card */}
              {errorDetails && (
                <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-fade-in-up">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-800">
                        {errorDetails.title}
                      </h3>
                      <p className="text-red-700 mt-1">
                        {errorDetails.message}
                      </p>
                      {errorDetails.billRef && (
                        <p className="text-red-600 text-sm mt-2 font-mono">
                          {t("bill_reference_label")}: {errorDetails.billRef}
                        </p>
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
                          <RefreshCw className="w-4 h-4" /> {t("clear_and_try_again")}
                        </button>
                        <button
                          onClick={() => {
                            setErrorDetails(null);
                            setError(null);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> {t("dismiss")}
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
                    <h3 className="text-xl font-bold text-gray-800">
                      {t("bill_summary")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{t("customer_name")}:</span>
                      <span className="font-semibold">
                        {getCustomerName(selectedBill)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{t("biller")}:</span>
                      <span className="font-semibold">
                        {selectedBill.biller_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{t("status")}:</span>
                      <span className="font-semibold text-blue-600">
                        {selectedBill.status}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{t("due_date")}:</span>
                      <span className="font-semibold">
                        {selectedBill.due_date}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{t("amount_due")}:</span>
                      <span className="font-semibold">
                        {safeNumber(selectedBill.amount_due)}{" "}
                        {selectedBill.currency || "ETB"}
                      </span>
                    </div>
                    {selectedBill.late_penalty > 0 && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-red-500">{t("late_penalty")}:</span>
                        <span className="font-semibold text-red-500">
                          {selectedBill.late_penalty}{" "}
                          {selectedBill.currency || "ETB"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      {t("total_to_pay")}:
                    </span>
                    <span className="text-2xl font-black text-red-600">
                      {safeNumber(selectedBill.total_to_pay) ||
                        safeNumber(selectedBill.amount_due)}{" "}
                      {selectedBill.currency || "ETB"}
                    </span>
                  </div>
                  {selectedBill.warning && (
                    <div
                      className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
                        selectedBill.is_blocked
                          ? "bg-red-50 text-red-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      <Info className="w-5 h-5" />
                      {selectedBill.warning}
                    </div>
                  )}
                  <button
                    onClick={goToPay}
                    disabled={
                      selectedBill.is_blocked || selectedBill.status === "PAID"
                    }
                    className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 
    ${
      selectedBill.status === "PAID"
        ? "bg-green-600 cursor-default"
        : "bg-gradient-to-r from-red-600 via-gray-700 to-red-900 hover:shadow-lg hover:scale-[1.02]"
    } 
    disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedBill.status === "PAID" ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t("bill_fully_settled")}
                      </>
                    ) : selectedBill.is_blocked ? (
                      <>
                        <XCircle className="w-5 h-5" />
                        {t("payment_blocked")}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        {t("proceed_to_payment")}
                      </>
                    )}
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
              <h2 className="text-2xl font-bold text-gray-800">
                {t("payment_successful")}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{t("receipt_generated")}</p>
            </div>
            <div className="bg-gray-50 p-6 font-mono text-xs space-y-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>{t("transaction_ref")}:</span>{" "}
                <strong>{receipt.transaction_ref}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("customer")}:</span>{" "}
                <strong>
                  {selectedBill
                    ? getCustomerName(selectedBill)
                    : receipt.customer}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{t("amount_paid")}:</span>{" "}
                <strong className="text-red-600">{receipt.amount_paid}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("remaining_balance")}:</span>{" "}
                <strong>{receipt.remaining_balance || "0.00"}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("status")}:</span> <strong>{receipt.status}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("due_date")}:</span> <strong>{receipt.due_date}</strong>
              </div>
              <hr />
              <p className="text-center">{t("paid_on")} {receipt.paymentDate}</p>
            </div>
            <button
              onClick={resetPayment}
              className="w-full bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white py-4 font-bold rounded-b-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> {t("done_new_payment")}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ------------------ Enhanced Payment Form (slow staggered auto‑fill) ------------------
function PaymentForm({ bill, onConfirm, onBack, loading }: any) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState("CBE");
  const [phone, setPhone] = useState("");
  const [editableAmount, setEditableAmount] = useState(() => {
    const amount = bill?.total_to_pay ?? bill?.amount_due ?? 0;
    return typeof amount === "number" && !isNaN(amount) ? amount : 0;
  });
  const [isSyncing, setIsSyncing] = useState(true);
  const [fieldsVisible, setFieldsVisible] = useState({
    bill_id: false,
    agent_id: false,
    transactionId: false,
    idempotencyKey: false,
    due_date: false,
  });

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      setIsSyncing(false);
      const fieldNames = ["bill_id", "agent_id", "transactionId", "idempotencyKey", "due_date"];
      fieldNames.forEach((field, idx) => {
        setTimeout(() => {
          setFieldsVisible(prev => ({ ...prev, [field]: true }));
        }, idx * 150);
      });
    }, 800);
    return () => clearTimeout(syncTimer);
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
    if (maxAmount <= 0) {
      alert(t("bill_already_settled"));
      return;
    }
    if (isTelebirr && !phone.trim()) {
      alert(t("phone_required_telebirr"));
      return;
    }
    if (editableAmount <= 0 || editableAmount > maxAmount) {
      alert(t("valid_amount_required", { max: maxAmount }));
      return;
    }
    onConfirm(paymentMethod, phone, editableAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <CreditCard className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t("payment_details")}</h2>
          {isSyncing && (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse font-bold flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {t("syncing")}
            </span>
          )}
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-red-600 font-medium transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
      </div>

      {isBlockedByExpiry && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{t("expired_blocked_message")}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {allowsPartial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("amount_to_pay")} <span className="text-xs text-red-500">{t("partial_allowed")}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={editableAmount}
                onChange={(e) => setEditableAmount(Number(e.target.value))}
                min={1}
                max={maxAmount}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                required
                disabled={isSyncing || isBlockedByExpiry}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("max_amount", { max: maxAmount, currency })}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl">
          <SlowReadOnlyField label={t("bill_id")} value={bill?.bill_id || t("na")} isVisible={fieldsVisible.bill_id} />
          <SlowReadOnlyField label={t("agent_id")} value={bill?.agent_id || t("na")} isVisible={fieldsVisible.agent_id} />
          <SlowReadOnlyField label={t("transaction_id")} value={bill?.transactionId || t("na")} isVisible={fieldsVisible.transactionId} />
          <SlowReadOnlyField label={t("idempotency_key")} value={bill?.idempotencyKey || t("na")} isVisible={fieldsVisible.idempotencyKey} />
          <SlowReadOnlyField label={t("due_date")} value={bill?.due_date || t("na")} isVisible={fieldsVisible.due_date} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("phone_number")} {isTelebirr && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              className={`w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition ${
                isPhoneMissing ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
              required={isTelebirr}
              disabled={isBlockedByExpiry}
            />
          </div>
          {isPhoneMissing && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {t("phone_required_telebirr")}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {t("back")}
          </button>
          <button
            type="submit"
            disabled={loading || isSyncing || isPhoneMissing || isBlockedByExpiry}
            className="flex-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {loading
              ? t("processing")
              : isBlockedByExpiry
              ? t("payment_blocked")
              : isPhoneMissing
              ? t("phone_required")
              : t("confirm_payment")}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper component for read-only fields with staggered fade-in
function SlowReadOnlyField({ label, value, isVisible }: { label: string; value: string; isVisible: boolean }) {
  return (
    <div className={`transition-all duration-500 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
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

