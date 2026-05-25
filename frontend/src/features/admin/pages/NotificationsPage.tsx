// src/features/admin/pages/NotificationsPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { adminApi } from "../api/admin.api";
import { Bell, RefreshCcw, Clock, FileUp, CheckCheck } from "lucide-react";
import type { AdminNotification } from "../api/admin.api";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout title={t("notifications")} links={adminLinks}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
                  {t("notifications")}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("notifications_description")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                {unreadCount} {t("unread")}
              </div>
            )}
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="relative flex items-center gap-2 px-4 md:px-5 py-2 rounded-xl font-medium text-sm text-white overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-90 group-hover:opacity-100 transition"></span>
              <span className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
              <span className="relative flex items-center gap-2">
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? t("refreshing") : t("refresh")}
              </span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">{t("loading_notifications")}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">{t("no_notifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group p-5 flex items-start gap-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !notification.isRead ? "bg-red-50/30 dark:bg-red-900/10" : ""
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      !notification.isRead
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <FileUp size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h4
                          className={`text-sm ${
                            !notification.isRead ? "font-bold" : "font-semibold"
                          } text-gray-900 dark:text-white`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap">
                          <Clock size={12} />
                          {new Date(notification.createdAt).toLocaleTimeString([], {
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

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        ID: {notification.id.slice(0, 8)}
                      </span>
                      {notification.type === "BILL_UPLOADED" && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          {t("bill_uploaded")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}