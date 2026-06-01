// src/features/admin/components/NotificationBell.tsx
import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuthStore();
  if (!user || user.role !== "SYSTEM_ADMIN") return null;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/admin/notifications");
      if (res.data.status === "SUCCESS") {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        return;
      }
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // poll every 30s
      return () => clearInterval(interval);
    
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <BellIcon className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b font-semibold text-gray-800">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? "bg-red-50/40 border-l-4 border-l-red-500" : ""}`}
                  onClick={async () => {
                    if (!notif.isRead) {
                      await markAsRead(notif.id);
                    }

                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-800">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {new Date(notif.createdAt).toLocaleString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}