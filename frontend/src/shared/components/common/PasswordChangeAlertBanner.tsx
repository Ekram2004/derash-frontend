// derash-frontend/src/shared/components/common/PasswordChangeAlertBanner.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import api from "@/services/api";

interface PasswordChangeAlertBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName?: string;
  userRole?: string;
}

export default function PasswordChangeAlertBanner({
  isOpen,
  onClose,
  onSuccess,
  userName,
  userRole,
}: PasswordChangeAlertBannerProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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

  // Reset modal state when banner closes
  useEffect(() => {
    if (!isOpen) {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ show: false, type: "success", text: "" });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      setMessage({ show: true, type: "error", text: "Current password is required" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ show: true, type: "error", text: "Password must be at least 8 characters" });
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ show: true, type: "error", text: "Passwords do not match" });
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
      const errorMsg = error.response?.data?.message || "Failed to change password";
      setMessage({ show: true, type: "error", text: errorMsg });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000);
    }
  };

  const getRoleBadge = () => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      BILLER: "bg-blue-100 text-blue-700",
      AGENT: "bg-green-100 text-green-700",
    };
    const role = userRole || "ADMIN";
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[role] || styles.ADMIN}`}>
        {role}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Small Alert Banner at top */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white text-sm">
                  <span className="font-semibold">{userName || "User"}</span>, please change your password
                </p>
                {getRoleBadge()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3 py-1 bg-white text-amber-600 rounded-md text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1"
                >
                  <KeyIcon className="w-3.5 h-3.5" />
                  Change
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Small Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[200] overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
            
            {/* Small Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Simple Header */}
                <div className="bg-red-500 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="w-4 h-4 text-white" />
                    <h3 className="text-white font-semibold text-sm">Change Password</h3>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Compact Body */}
                <div className="p-4">
                  {/* User info - small */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-gray-500">{userRole || "User"}</p>
                    <p className="text-sm font-medium text-gray-800">{userName || "User"}</p>
                  </div>

                  {/* Message */}
                  {message.show && (
                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-3 text-xs ${
                      message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      {message.type === "success" ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                      {message.text}
                    </div>
                  )}

                  {/* Form - Compact */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 pr-7"
                          placeholder="Enter current password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPassword ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 pr-7"
                          placeholder="Min 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showNewPassword ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 pr-7"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compact Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}