// src/features/biller/components/settings/ApiTab.tsx

import { useState } from "react";
import { KeyIcon, GlobeAltIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function ApiTab() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("derash_live_7x8k9m2n4p6q");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const regenerateApiKey = async () => {
    setLoading(true);
    try {
      const response = await api.post("/biller/regenerate-api-key");
      if (response.data.status === "SUCCESS") { setApiKey(response.data.apiKey); setMessage({ show: true, type: "success", text: "API Key regenerated!" }); }
      else setMessage({ show: true, type: "error", text: response.data.message || "Regeneration failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) { setMessage({ show: true, type: "error", text: "Failed to regenerate API Key" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); }
    finally { setLoading(false); }
  };

  const saveWebhook = async () => {
    setLoading(true);
    try {
      const response = await api.post("/biller/webhook", { webhookUrl });
      if (response.data.status === "SUCCESS") setMessage({ show: true, type: "success", text: "Webhook URL saved!" });
      else setMessage({ show: true, type: "error", text: response.data.message || "Save failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) { setMessage({ show: true, type: "error", text: "Failed to save webhook URL" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {message.show && (<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}{message.text}</div>)}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-center gap-2 mb-4"><KeyIcon className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-800">API Credentials</h3></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">API Key</label><div className="flex gap-2"><input type={showApiKey ? "text" : "password"} value={apiKey} readOnly className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm" /><button onClick={() => setShowApiKey(!showApiKey)} className="px-3 py-2 bg-gray-100 rounded-lg">{showApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button><button onClick={regenerateApiKey} disabled={loading} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg"><ArrowPathIcon className="w-5 h-5" /></button></div><p className="text-xs text-gray-500 mt-2">Use this API key to integrate with Derash platform. Keep it secure!</p></div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4"><GlobeAltIcon className="w-5 h-5 text-gray-600" /><h3 className="font-semibold text-gray-800">Webhook Configuration</h3></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label><div className="flex gap-2"><input type="url" placeholder="https://api.yourdomain.com/webhook/derash" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" /><button onClick={saveWebhook} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded-lg">Save</button></div><p className="text-xs text-gray-500 mt-2">We'll send payment notifications and settlement updates to this URL</p></div>
      </div>
    </div>
  );
}