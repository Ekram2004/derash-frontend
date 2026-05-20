// src/features/admin/components/settings/SystemTab.tsx

import { useState } from "react";
import { ServerIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function SystemTab() {
  const [config, setConfig] = useState({
    sessionTimeout: 30, maxLoginAttempts: 5, passwordMinLength: 8,
    requireSpecialChar: true, requireNumber: true, twoFactorRequired: false,
    auditLogRetention: 90,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/admin/system-config", config);
      if (response.data.status === "SUCCESS") setMessage({ show: true, type: "success", text: "System settings saved!" });
      else setMessage({ show: true, type: "error", text: response.data.message || "Save failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) {
      setMessage({ show: true, type: "error", text: "Failed to save settings" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {message.show && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
          {message.text}
        </div>
      )}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4"><ServerIcon className="w-5 h-5 text-gray-600" /><h3 className="font-semibold text-gray-800">System Security Configuration</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label><input type="number" value={config.sessionTimeout} onChange={(e) => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label><input type="number" value={config.maxLoginAttempts} onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Password Length</label><input type="number" value={config.passwordMinLength} onChange={(e) => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Audit Log Retention (days)</label><input type="number" value={config.auditLogRetention} onChange={(e) => setConfig({ ...config, auditLogRetention: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div className="flex items-center justify-between"><span className="text-sm">Require Special Character (!@#$%)</span><button onClick={() => setConfig({ ...config, requireSpecialChar: !config.requireSpecialChar })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.requireSpecialChar ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.requireSpecialChar ? "translate-x-6" : "translate-x-1"}`} /></button></div>
          <div className="flex items-center justify-between"><span className="text-sm">Require Number (0-9)</span><button onClick={() => setConfig({ ...config, requireNumber: !config.requireNumber })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.requireNumber ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.requireNumber ? "translate-x-6" : "translate-x-1"}`} /></button></div>
          <div className="flex items-center justify-between"><span className="text-sm">Require 2FA for Admins</span><button onClick={() => setConfig({ ...config, twoFactorRequired: !config.twoFactorRequired })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.twoFactorRequired ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.twoFactorRequired ? "translate-x-6" : "translate-x-1"}`} /></button></div>
        </div>
        <div className="flex justify-end mt-6"><button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50">{loading ? "Saving..." : "Save System Settings"}</button></div>
      </div>
    </div>
  );
}