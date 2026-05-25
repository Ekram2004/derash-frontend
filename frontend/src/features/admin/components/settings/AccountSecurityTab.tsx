// src/features/admin/components/settings/AccountSecurityTab.tsx
import { useState, useEffect, type SetStateAction } from "react";
import { KeyIcon, ComputerDesktopIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTranslation } from "react-i18next";
interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

// ========== PASSWORD INPUT WITH EYE ICON – dark mode ==========
function PasswordInput({ label, value, onChange, placeholder, required = true }: any) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountSecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState({ password: false, sessions: false });
  const [popup, setPopup] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const closePopup = () => setPopup(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading((prev) => ({ ...prev, sessions: true }));
    try {
      const res = await api.get("/user/sessions");
      if (res.data.status === "SUCCESS") setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading((prev) => ({ ...prev, sessions: false }));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPopup({ type: "error", text: "New passwords do not match" });
      setTimeout(closePopup, 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPopup({ type: "error", text: "Password must be at least 6 characters" });
      setTimeout(closePopup, 3000);
      return;
    }
    setLoading((prev) => ({ ...prev, password: true }));
    try {
      await api.post("/user/update-password", { currentPassword, newPassword });
      setPopup({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(closePopup, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update password";
      setPopup({ type: "error", text: msg });
      setTimeout(closePopup, 3000);
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/user/sessions/${sessionId}`);
      fetchSessions();
      setPopup({ type: "success", text: "Session revoked" });
      setTimeout(closePopup, 3000);
    } catch (err) {
      console.error("Failed to revoke session", err);
      setPopup({ type: "error", text: "Failed to revoke session" });
      setTimeout(closePopup, 3000);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm("This will log you out from all other devices. Continue?")) return;
    try {
      await api.delete("/user/sessions/purge-others");
      fetchSessions();
      setPopup({ type: "success", text: "All other sessions revoked" });
      setTimeout(closePopup, 3000);
    } catch (err) {
      console.error("Failed to revoke others", err);
      setPopup({ type: "error", text: "Failed to revoke sessions" });
      setTimeout(closePopup, 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* POPUP MODAL – dark mode supported */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-sm w-full mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
            popup.type === "success" 
              ? "bg-white dark:bg-gray-800 border-l-4 border-green-500" 
              : "bg-white dark:bg-gray-800 border-l-4 border-red-500"
          }`}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  popup.type === "success" 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  {popup.type === "success" ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${popup.type === "success" ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"}`}>
                    {popup.type === "success" ? "Success" : "Error"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{popup.text}</p>
                </div>
                <button onClick={closePopup} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`h-1 w-full ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} animate-progress`} style={{ animation: "shrink 3s linear forwards" }}></div>
          </div>
        </div>
      )}

      {/* Change Password – dark mode */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-100 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <KeyIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading.password}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading.password ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Active Sessions – dark mode */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <ComputerDesktopIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Active Sessions</h3>
          </div>
          <button
            onClick={revokeAllOtherSessions}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" /> Revoke all other sessions
          </button>
        </div>
        {loading.sessions ? (
          <p className="text-gray-500 dark:text-gray-400">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No active sessions found</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-mono text-sm text-gray-800 dark:text-gray-300">{session.userAgent || "Unknown device"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">IP: {session.ipAddress || "Unknown"} • Since {new Date(session.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  className="mt-2 sm:mt-0 text-red-500 dark:text-red-400 text-sm hover:underline"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keyframe animation for progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: shrink 3s linear forwards;
        }
      `}</style>
    </div>
  );
}