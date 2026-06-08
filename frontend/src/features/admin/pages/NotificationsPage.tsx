// src/features/admin/pages/NotificationsPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { adminApi } from "../api/admin.api";
import { 
  Bell, 
  RefreshCcw, 
  Clock, 
  FileUp, 
  CheckCheck, 
  UserPlus, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Settings,
  Download,
  Eye
} from "lucide-react";
import type { AdminNotification } from "../api/admin.api";

// Helper to get icon based on notification type
const getNotificationIcon = (type: string, isRead: boolean) => {
  const baseClasses = `p-2.5 rounded-xl transition-all duration-200 ${
    !isRead
      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
  }`;

  const iconClasses = "w-5 h-5";

  switch (type) {
    case "BILL_UPLOADED":
      return <div className={baseClasses}><FileUp className={iconClasses} /></div>;
    case "USER_CREATED":
      return <div className={baseClasses}><UserPlus className={iconClasses} /></div>;
    case "PAYMENT_RECEIVED":
      return <div className={baseClasses}><CreditCard className={iconClasses} /></div>;
    case "SYSTEM_ALERT":
      return <div className={baseClasses}><AlertTriangle className={iconClasses} /></div>;
    case "BILLER_REGISTERED":
      return <div className={baseClasses}><Building2 className={iconClasses} /></div>;
    case "AGENT_REGISTERED":
      return <div className={baseClasses}><Users className={iconClasses} /></div>;
    default:
      return <div className={baseClasses}><Bell className={iconClasses} /></div>;
  }
};

// Helper to get status badge
const getStatusBadge = (type: string) => {
  switch (type) {
    case "BILL_UPLOADED":
      return { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: CheckCircle, label: "success" };
    case "PAYMENT_RECEIVED":
      return { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", icon: CreditCard, label: "payment" };
    case "SYSTEM_ALERT":
      return { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", icon: AlertTriangle, label: "alert" };
    case "USER_CREATED":
    case "BILLER_REGISTERED":
    case "AGENT_REGISTERED":
      return { color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", icon: UserPlus, label: "created" };
    default:
      return { color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400", icon: Bell, label: "info" };
  }
};

export default function NotificationsPage() {
  console.log("NotificationsPage is mounting");
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications();
      setNotifications(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to update notification status", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      await handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout title={t("notifications")} links={adminLinks}>
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
                  {t("notifications")}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                  {t("notifications_description")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  filter === "all"
                    ? "bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {t("all")}
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  filter === "unread"
                    ? "bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {t("unread")} {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  filter === "read"
                    ? "bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {t("read")}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1 px-2 py-1.5"
              >
                <CheckCheck size={14} /> {t("mark_all_read")}
              </button>
            )}

            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm text-white overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-90 group-hover:opacity-100 transition"></span>
              <span className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
              <span className="relative flex items-center gap-2">
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? t("refreshing") : t("refresh")}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("total")}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("unread")}</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{unreadCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("read")}</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{notifications.length - unreadCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("last_updated")}</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">{t("loading_notifications")}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {filter === "all" ? t("no_notifications") : filter === "unread" ? t("no_unread") : t("no_read")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredNotifications.map((notification) => {
                const statusBadge = getStatusBadge(notification.type);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={`group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !notification.isRead ? "bg-red-50/30 dark:bg-red-900/10" : ""
                    }`}
                  >
                    {/* Icon */}
                    {getNotificationIcon(notification.type, notification.isRead)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4
                            className={`text-sm sm:text-base ${
                              !notification.isRead ? "font-bold" : "font-semibold"
                            } text-gray-900 dark:text-white`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap">
                            <Clock size={12} />
                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <CheckCheck size={12} /> {t("mark_as_read")}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          ID: {notification.id.slice(0, 8)}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${statusBadge.color}`}>
                          <StatusIcon size={10} />
                          {t(notification.type?.toLowerCase() || "info")}
                        </span>
                        {!notification.isRead && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-red-600 dark:text-red-400 animate-pulse">
                            ● {t("new")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}