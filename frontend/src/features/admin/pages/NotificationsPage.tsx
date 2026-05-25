import React, { useEffect, useState } from "react";
import { adminApi } from "../api/admin.api";
import type { AdminNotification } from "../api/admin.api";

import {
  Bell,
  CheckCircle2,
  Clock,
  FileUp,
  RefreshCcw,
  MoreVertical,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications();
      // Sort by latest first
      setNotifications(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error fetching system notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Optional: Refresh every 2 minutes
    const interval = setInterval(fetchLogs, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to update notification status");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <Bell
              className="text-blue-600"
              fill="currentColor"
              fillOpacity={0.2}
            />
            System Activity Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitoring real-time bill uploads and agent activities.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all active:scale-95"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Feed
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            Loading system logs...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center text-gray-400 italic">
            No recent system activity recorded.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`group p-5 flex items-start gap-4 transition-all hover:bg-gray-50 ${!n.isRead ? "bg-blue-50/30" : ""}`}
              >
                <div
                  className={`p-2.5 rounded-xl ${!n.isRead ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                >
                  <FileUp size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4
                        className={`text-sm ${!n.isRead ? "font-bold" : "font-semibold"} text-gray-900`}
                      >
                        {n.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-blue-600 font-bold hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                      ID: {n.id.split("-")[0]}
                    </span>
                    {n.type === "BILL_UPLOADED" && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">
                        Success
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
  );
}
