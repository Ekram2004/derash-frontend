// src/features/admin/components/settings/UserAccountInfoCard.tsx
import { useTranslation } from "react-i18next";
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

interface User {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  status?: string;
}

interface UserAccountInfoCardProps {
  user: User | null;
}

export default function UserAccountInfoCard({ user }: UserAccountInfoCardProps) {
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.name || t("administrator");
  const userRole = user.role || "SYSTEM_ADMIN";
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: t("system_administrator") };
      case "AGENT_USER":
        return { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: t("agent_user") };
      case "BILLER_USER":
        return { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: t("biller_user") };
      default:
        return { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: role };
    }
  };

  const roleBadge = getRoleBadge(userRole);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return t("not_available");
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header with gradient border */}
      <div className="relative mb-6">
        <div className="absolute -top-3 left-0 w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
          {t("administrator_account")}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("account_info_description")}</p>
      </div>

      {/* Main Account Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Full Name */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t("full_name")}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
              {displayName}
            </p>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <EnvelopeIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t("email_address")}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
              {user.email || t("not_provided")}
            </p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheckIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {t("role")}
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Account Created (if available) */}
        {user.createdAt && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t("account_created")}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        )}

        {/* Last Login (if available) */}
        {user.lastLogin && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ComputerDesktopIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t("last_login")}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatDate(user.lastLogin)}
              </p>
            </div>
          </div>
        )}

        {/* Status (if available) */}
        {user.status && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-800 transition-all duration-200 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t("status")}
              </p>
              <span className={`text-sm font-semibold ${user.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {user.status === "active" ? t("active") : t("inactive")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User ID Footer */}
      {user.id && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{t("user_id")}:</span>
            <code className="font-mono text-[10px] bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
              {user.id.slice(0, 12)}...
            </code>
          </div>
        </div>
      )}
    </div>
  );
}