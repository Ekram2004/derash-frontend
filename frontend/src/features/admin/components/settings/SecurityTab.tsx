// src/features/admin/components/settings/SecurityTab.tsx

import { useState } from "react";
import { KeyIcon, ShieldCheckIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import ChangePasswordModal from "./ChangePasswordModal";

export default function SecurityTab() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>(["192.168.1.1", "10.0.0.1"]);
  const [newIp, setNewIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const addIpToWhitelist = () => {
    if (!newIp || ipWhitelist.includes(newIp)) return;
    setIpWhitelist([...ipWhitelist, newIp]);
    setNewIp("");
    setMessage({ show: true, type: "success", text: "IP added to whitelist" });
    setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter(i => i !== ip));
    setMessage({ show: true, type: "success", text: "IP removed from whitelist" });
    setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
  };

  return (
    <div className="space-y-6">
      {message.show && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Change Password */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-white rounded-lg"><KeyIcon className="w-5 h-5 text-red-600" /></div><div><h3 className="font-semibold text-gray-800">Change Your Password</h3><p className="text-sm text-gray-500">Update your administrator account password</p></div></div>
          <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Change My Password</button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 mb-1"><ShieldCheckIcon className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Two-Factor Authentication (2FA)</h3></div><p className="text-sm text-gray-600">Add an extra layer of security to your admin account</p></div>
          <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${twoFactorEnabled ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${twoFactorEnabled ? "translate-x-6" : "translate-x-1"}`} /></button>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">IP Whitelist</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-4"><input type="text" placeholder="Enter IP address" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" /><button onClick={addIpToWhitelist} className="px-4 py-2 bg-red-500 text-white rounded-lg">Add IP</button></div>
        <div className="space-y-2">{ipWhitelist.map((ip, i) => (<div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border"><span className="font-mono text-sm">{ip}</span><button onClick={() => removeIpFromWhitelist(ip)} className="text-red-500"><TrashIcon className="w-4 h-4" /></button></div>))}</div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSuccess={() => { localStorage.clear(); window.location.href = "/login"; }} />}
    </div>
  );
}