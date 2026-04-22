// src/features/settings/components/AccountTab.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/features/auth/store/auth.store";
import api from "@/services/api";

interface AccountTabProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: string;
    lastLogin?: string;
    deviceInfo?: string;
    location?: string;
  } | null;
  onLogoutAllDevices?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onRefresh?: () => void;
}

export default function AccountTab({ 
  user, 
  onLogoutAllDevices, 
  onDeleteAccount,
  onRefresh 
}: AccountTabProps) {
  const { logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "agent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "biller":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // API: Logout from all devices
  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogoutAllDevices) {
        await onLogoutAllDevices();
      } else {
        await api.post("/auth/logout-all");
      }
      showNotification("Successfully logged out from all other devices", "success");
      
      // Refresh session list
      if (showSessions) {
        await loadActiveSessions();
      }
    } catch (error: any) {
      console.error("Error logging out from all devices:", error);
      showNotification(
        error.response?.data?.message || "Failed to logout from all devices",
        "error"
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  // API: Load active sessions
  const loadActiveSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await api.get("/auth/sessions");
      setActiveSessions(response.data.data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // API: Revoke specific session
  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      showNotification("Session revoked successfully", "success");
      await loadActiveSessions();
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to revoke session",
        "error"
      );
    }
  };

  // API: Delete account
  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      showNotification('Please type "DELETE" to confirm account deletion', "error");
      return;
    }

    setIsDeleting(true);
    try {
      if (onDeleteAccount) {
        await onDeleteAccount();
      } else {
        await api.delete("/user/account");
      }
      showNotification("Account deleted successfully", "success");
      
      setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      showNotification(
        error.response?.data?.message || "Failed to delete account",
        "error"
      );
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleSessions = async () => {
    if (!showSessions) {
      await loadActiveSessions();
    }
    setShowSessions(!showSessions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 md:space-y-8">
        
        {/* Account Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Account Security
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  Manage your account security and active sessions
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Profile Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {user?.name || "User Name"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || "Role"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {user?.id?.slice(0, 8) || "N/A"}...
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user?.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <DevicePhoneMobileIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Session Management
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Manage your active sessions and device access
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleSessions}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {showSessions ? "Hide Sessions" : "View Active Sessions"}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Security Notice */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                    Security Notice
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                    Logging out from all devices will end all active sessions except your current one.
                    You'll need to log in again on other devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Sessions List */}
            <AnimatePresence>
              {showSessions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 space-y-3"
                >
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Active Sessions
                  </h3>
                  {isLoadingSessions ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
                    </div>
                  ) : activeSessions.length > 0 ? (
                    <div className="space-y-3">
                      {activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {session.device || "Unknown Device"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {session.location || "Unknown Location"} • Last active: {formatDate(session.lastActive)}
                            </p>
                          </div>
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="px-3 py-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No other active sessions found
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logout All Devices Button */}
            <button
              onClick={handleLogoutAllDevices}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-xl transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Logout All Other Devices
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-red-700 dark:text-red-400">
                  Danger Zone
                </h2>
                <p className="text-xs md:text-sm text-red-600 dark:text-red-300">
                  Irreversible account actions - proceed with caution
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all duration-200 font-semibold text-sm group"
              >
                <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Delete Account
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                    ⚠️ Warning: This action cannot be undone!
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Deleting your account will permanently remove all your data, including:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Personal information and profile data</li>
                    <li>Transaction history and records</li>
                    <li>Access to all services and features</li>
                  </ul>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Type <span className="text-red-600">"DELETE"</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmText("");
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || confirmText !== "DELETE"}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-4 h-4" />
                        Permanently Delete Account
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}