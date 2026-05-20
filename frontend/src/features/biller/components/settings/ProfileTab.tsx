// src/features/biller/components/settings/ProfileTab.tsx

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function ProfileTab({ user, onUpdate }: { user: any; onUpdate?: () => void }) {
  const [profile, setProfile] = useState({
    businessName: user?.businessName || "Ethio Water Services",
    businessType: user?.businessType || "Water Utility",
    taxId: user?.taxId || "123456789",
    address: user?.address || "Bole Road, Addis Ababa",
    city: user?.city || "Addis Ababa",
    phone: user?.phone || "+251911234567",
    email: user?.email || "contact@ethiowater.com",
    website: user?.website || "www.ethiowater.com",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/biller/profile", profile);
      if (response.data.status === "SUCCESS") {
        setMessage({ show: true, type: "success", text: "Business profile updated successfully!" });
        if (onUpdate) onUpdate();
      } else setMessage({ show: true, type: "error", text: response.data.message || "Update failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) {
      setMessage({ show: true, type: "error", text: "Failed to update profile" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {message.show && (<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}{message.text}</div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label><input type="text" value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label><select value={profile.businessType} onChange={(e) => setProfile({ ...profile, businessType: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"><option>Water Utility</option><option>Electricity Utility</option><option>Telecom Provider</option><option>Government Agency</option><option>Private Company</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / TIN</label><input type="text" value={profile.taxId} onChange={(e) => setProfile({ ...profile, taxId: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="url" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
      </div>
      <div className="flex justify-end pt-4"><button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{loading ? "Saving..." : "Save Business Profile"}</button></div>
    </div>
  );
}