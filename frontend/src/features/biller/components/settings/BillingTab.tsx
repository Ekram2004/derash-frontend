// src/features/biller/components/settings/BillingTab.tsx

import { useState } from "react";
import { CreditCardIcon, BuildingOfficeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function BillingTab() {
  const [billing, setBilling] = useState({
    commissionRate: "2.5", settlementPeriod: "daily", minimumPayout: "1000",
    bankName: "Commercial Bank of Ethiopia", accountNumber: "1000123456789", accountName: "Ethio Water Services",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/biller/billing-settings", billing);
      if (response.data.status === "SUCCESS") setMessage({ show: true, type: "success", text: "Billing settings saved!" });
      else setMessage({ show: true, type: "error", text: response.data.message || "Save failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) {
      setMessage({ show: true, type: "error", text: "Failed to save billing settings" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {message.show && (<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}{message.text}</div>)}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
        <div className="flex items-center gap-2 mb-4"><CreditCardIcon className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-800">Commission & Settlement</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate</label><div className="flex items-center gap-2"><input type="number" step="0.1" value={billing.commissionRate} onChange={(e) => setBilling({ ...billing, commissionRate: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" /><span className="text-gray-600">%</span></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Settlement Period</label><select value={billing.settlementPeriod} onChange={(e) => setBilling({ ...billing, settlementPeriod: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout</label><div className="flex items-center gap-2"><span className="text-gray-600">ETB</span><input type="number" value={billing.minimumPayout} onChange={(e) => setBilling({ ...billing, minimumPayout: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" /></div></div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-4"><BuildingOfficeIcon className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Bank Account Information</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label><input type="text" value={billing.bankName} onChange={(e) => setBilling({ ...billing, bankName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label><input type="text" value={billing.accountNumber} onChange={(e) => setBilling({ ...billing, accountNumber: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label><input type="text" value={billing.accountName} onChange={(e) => setBilling({ ...billing, accountName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{loading ? "Saving..." : "Save Billing Settings"}</button></div>
    </div>
  );
}