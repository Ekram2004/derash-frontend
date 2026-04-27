// src/features/admin/components/settings/ChangePasswordModal.tsx

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";
import api from "@/services/api";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({
    show: false,
    type: "success",
    text: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (!passwordData.currentPassword) {
      setMessage({ show: true, type: "error", text: "Current password is required" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ show: true, type: "error", text: "New password must be at least 8 characters" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ show: true, type: "error", text: "New passwords do not match" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ show: true, type: "error", text: "New password must be different" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.data.status === "SUCCESS") {
        setMessage({ show: true, type: "success", text: "Password changed successfully!" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage({ show: true, type: "error", text: response.data.message || "Password change failed" });
      }
    } catch (error: any) {
      setMessage({ show: true, type: "error", text: error.response?.data?.message || "Failed to change password" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
    }
  };

  return (
    <Modal onClose={onClose} title="Change Your Password">
      {message.show && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
              placeholder="Enter your current password"
            />
            <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
              placeholder="Enter new password (min 8 characters)"
            />
            <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
              placeholder="Confirm your new password"
            />
            <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </Modal>
  );
}