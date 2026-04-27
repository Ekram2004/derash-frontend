// src/features/admin/components/settings/GeneralTab.tsx

import { useState, useEffect } from "react";
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function GeneralTab() {
  const [config, setConfig] = useState({
    platformName: "Derash Bill Aggregation Platform",
    platformUrl: "https://www.derash.gov.et",
    supportEmail: "support@derash.gov.et",
    supportPhone: "0944-33-68-07",
    maintenanceMode: false,
    logLevel: "INFO",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get("/admin/system-config");
      if (response.data.status === "SUCCESS") setConfig(response.data.data);
    } catch (error) { console.error("Failed to fetch config:", error); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/admin/system-config", config);
      if (response.data.status === "SUCCESS") setMessage({ show: true, type: "success", text: "Platform settings saved!" });
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
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-4"><Cog6ToothIcon className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Platform Settings</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label><input type="text" value={config.platformName} onChange={(e) => setConfig({ ...config, platformName: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Platform URL</label><input type="url" value={config.platformUrl} onChange={(e) => setConfig({ ...config, platformUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label><input type="email" value={config.supportEmail} onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label><input type="tel" value={config.supportPhone} onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label><select value={config.logLevel} onChange={(e) => setConfig({ ...config, logLevel: e.target.value as any })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"><option value="INFO">INFO</option><option value="DEBUG">DEBUG</option><option value="WARN">WARN</option><option value="ERROR">ERROR</option></select></div>
          <div className="flex items-center justify-between"><div><label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label><p className="text-xs text-gray-500">Blocks all user access except admins</p></div><button onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.maintenanceMode ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} /></button></div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50">{loading ? "Saving..." : "Save Platform Settings"}</button></div>
    </div>
  );
}