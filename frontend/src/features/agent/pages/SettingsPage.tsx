// src/features/agent/pages/SettingsPage.tsx
import { useState, useEffect, useCallback, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { agentLinks } from "../agentLinks";
import api from "@/services/api";
import ThemeToggle from "../../admin/components/shared/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

// ========== ENHANCED ACCOUNT INFO CARD (Agent) – dark mode ==========
function AccountInfoCard({ user, agentDetails }: { user: any; agentDetails: any }) {
  const { t } = useTranslation();

  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("not_available");
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative mb-6">
        <div className="absolute -top-3 left-0 w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
          {t("agent_account")}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("account_info_description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Full Name */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("full_name")}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
              {user.fullName || user.name || user.full_name || t("not_provided")}
            </p>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <EnvelopeIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("email_address")}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{user.email || t("not_provided")}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheckIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("role")}</p>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              {user.role === "AGENT_USER" ? t("agent_user") : user.role || t("agent_user")}
            </span>
          </div>
        </div>

        {/* Agent Name */}
        {agentDetails?.name && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BuildingOfficeIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("agent_name")}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{agentDetails.name}</p>
            </div>
          </div>
        )}

        {/* Agent Code */}
        {agentDetails?.code && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("agent_code")}</p>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{agentDetails.code}</p>
            </div>
          </div>
        )}

        {/* Account Created */}
        {user.createdAt && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("account_created")}</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("status")}</p>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">{t("active")}</span>
          </div>
        </div>
      </div>

      {/* User ID Footer */}
      {user.id && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{t("user_id")}:</span>
            <code className="font-mono text-[10px] bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">{user.id.slice(0, 12)}...</code>
          </div>
        </div>
      )}
    </div>
  );
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
          className="w-full px-4 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white outline-none transition"
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

// ========== CHANGE PASSWORD COMPONENT with POPUP NOTIFICATION – dark mode ==========
function ChangePasswordTab() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const closePopup = () => setPopup(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPopup({ type: "error", text: t("passwords_do_not_match") });
      setTimeout(closePopup, 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPopup({ type: "error", text: t("password_min_length_msg") });
      setTimeout(closePopup, 3000);
      return;
    }
    setLoading(true);
    try {
      await api.post("/user/update-password", { currentPassword, newPassword });
      setPopup({ type: "success", text: t("password_updated") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(closePopup, 3000);
    } catch (err: any) {
      setPopup({ type: "error", text: err.response?.data?.message || t("password_update_failed") });
      setTimeout(closePopup, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* POPUP MODAL – already dark-friendly */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-sm w-full mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
            popup.type === "success" ? "bg-white dark:bg-gray-800 border-l-4 border-green-500" : "bg-white dark:bg-gray-800 border-l-4 border-red-500"
          }`}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  popup.type === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
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
                    {popup.type === "success" ? t("success") : t("error")}
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

      {/* FORM */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-100 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <LockClosedIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{t("change_password")}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <PasswordInput
            label={t("current_password")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <PasswordInput
            label={t("new_password")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <PasswordInput
            label={t("confirm_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-600 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-600 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">{loading ? t("updating") : t("update_password")}</span>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: shrink 3s linear forwards;
        }
      `}</style>
    </>
  );
}

// ========== PREFERENCES COMPONENT (Theme + Language) – dark mode ==========
function PreferencesTab() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({ theme: "light", language: "en" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/user/settings");
      if (res.data.status === "SUCCESS") {
        const data = res.data.data;
        setSettings({ theme: data.theme || "light", language: data.language || "en" });
        setTheme(data.theme || "light");
        if (data.language && data.language !== i18n.language) i18n.changeLanguage(data.language);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setLoading(true);
    try {
      await api.patch("/user/settings", { ...settings, [key]: value });
      setSettings({ ...settings, [key]: value });
      if (key === "theme") setTheme(value);
      if (key === "language") i18n.changeLanguage(value);
      setMessage(t("settings_updated"));
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("Failed to update setting", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">{message}</div>}
      {/* Theme */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              {settings.theme === "dark" ? (
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t("theme")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("theme_description")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => updateSetting("theme", "light")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              settings.theme === "light" 
                ? "bg-red-600 text-white dark:bg-red-500" 
                : "bg-white text-gray-700 border dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}>{t("light")}</button>
            <button onClick={() => updateSetting("theme", "dark")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              settings.theme === "dark" 
                ? "bg-red-600 text-white dark:bg-red-500" 
                : "bg-white text-gray-700 border dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}>{t("dark")}</button>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t("language")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("language_description")}</p>
            </div>
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting("language", e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="om">Oromo</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN SETTINGS PAGE (with cache) – dark mode ==========
export default function AgentSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"account" | "preferences">("account");
  const authUser = useAuthStore((state) => state.user);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.status === "SUCCESS") {
        const userData = response.data.data;
        const actualUser = userData.user || userData;
        setUserDetails(actualUser);
        localStorage.setItem("agent_user_cache", JSON.stringify(actualUser));
        localStorage.setItem("agent_user_cache_time", String(Date.now()));

        const agentId = actualUser.agentId || actualUser.agent_id;
        if (agentId) {
          try {
            const agentRes = await api.get(`/agents/${agentId}`);
            if (agentRes.data.status === "SUCCESS") {
              setAgentDetails(agentRes.data.data);
              localStorage.setItem("agent_details_cache", JSON.stringify(agentRes.data.data));
            }
          } catch (err) {
            console.error("Failed to fetch agent details", err);
          }
        }
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      const cachedUser = localStorage.getItem("agent_user_cache");
      const cachedAgent = localStorage.getItem("agent_details_cache");
      if (cachedUser) {
        setUserDetails(JSON.parse(cachedUser));
        if (cachedAgent) setAgentDetails(JSON.parse(cachedAgent));
      } else {
        setUserDetails(authUser);
      }
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchUserDetails();
    const interval = setInterval(fetchUserDetails, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchUserDetails]);

  const tabs = [
    { id: "account" as const, label: t("account_security"), icon: LockClosedIcon },
    { id: "preferences" as const, label: t("preferences"), icon: Cog6ToothIcon },
  ];

  if (loading && !userDetails) {
    return (
      <DashboardLayout title={t("settings")} links={agentLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-3">{t("loading_settings")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("settings")} links={agentLinks}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
              {t("settings")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("settings_description")}</p>
          </div>
          <ThemeToggle />
        </div>

        <AccountInfoCard user={userDetails} agentDetails={agentDetails} />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="lg:hidden p-4 border-b bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as "account" | "preferences")}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              {tabs.map((tab) => (<option key={tab.id} value={tab.id}>{tab.label}</option>))}
            </select>
          </div>

          <div className="hidden lg:flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "account" ? <ChangePasswordTab /> : <PreferencesTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}