// src/features/biller/components/settings/SecurityTab.tsx

import { useState } from "react";
import { LockClosedIcon, ShieldCheckIcon, ComputerDesktopIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) { setMessage({ show: true, type: "error", text: "Current password is required" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); return; }
    if (passwordData.newPassword.length < 8) { setMessage({ show: true, type: "error", text: "New password must be at least 8 characters" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setMessage({ show: true, type: "error", text: "New passwords do not match" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); return; }
    if (passwordData.currentPassword === passwordData.newPassword) { setMessage({ show: true, type: "error", text: "New password must be different" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); return; }

    setLoading(true);
    try {
      const response = await api.post("/auth/change-password", { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      if (response.data.status === "SUCCESS") { setMessage({ show: true, type: "success", text: "Password changed successfully!" }); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
      else setMessage({ show: true, type: "error", text: response.data.message || "Password change failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error: any) { setMessage({ show: true, type: "error", text: error.response?.data?.message || "Failed to change password" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); }
    finally { setLoading(false); }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const response = await api.post("/auth/two-factor/toggle", { enabled: !twoFactorEnabled });
      if (response.data.status === "SUCCESS") { setTwoFactorEnabled(!twoFactorEnabled); setMessage({ show: true, type: "success", text: twoFactorEnabled ? "2FA disabled" : "2FA enabled" }); }
      else setMessage({ show: true, type: "error", text: response.data.message || "Failed to toggle 2FA" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) { setMessage({ show: true, type: "error", text: "Failed to update 2FA settings" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); }
  };

  return (
    <div className="space-y-6">
      {message.show && (<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}{message.text}</div>)}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
        <div className="flex items-center gap-2 mb-4"><LockClosedIcon className="w-5 h-5 text-red-600" /><h3 className="font-semibold text-gray-800">Change Password</h3></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><div className="relative"><input type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-4 py-2 border rounded-lg pr-10" placeholder="Enter your current password" /><button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><div className="relative"><input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2 border rounded-lg pr-10" placeholder="Enter new password (min 8 characters)" /><button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button></div><p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><div className="relative"><input type={showConfirmPassword ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2 border rounded-lg pr-10" placeholder="Confirm your new password" /><button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}</button></div></div>
          <div className="flex justify-end pt-2"><button onClick={handlePasswordChange} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{loading ? "Changing..." : "Change Password"}</button></div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><ShieldCheckIcon className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3></div><p className="text-sm text-gray-600">Add an extra layer of security to your account</p></div><button onClick={handleTwoFactorToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${twoFactorEnabled ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${twoFactorEnabled ? "translate-x-6" : "translate-x-1"}`} /></button></div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><ComputerDesktopIcon className="w-5 h-5 text-gray-600" /><h3 className="font-semibold text-gray-800">Active Sessions</h3></div><p className="text-sm text-gray-600">Manage your active login sessions</p></div><button className="text-red-500 text-sm hover:text-red-600 font-medium">View All Sessions</button></div></div>
    </div>
  );
}