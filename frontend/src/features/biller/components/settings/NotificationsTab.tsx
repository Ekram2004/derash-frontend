// src/features/biller/components/settings/NotificationsTab.tsx

import { useState } from "react";
import { EnvelopeIcon, DevicePhoneMobileIcon, CheckCircleIcon, CreditCardIcon, BellIcon, GlobeAltIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState({ email: true, sms: true, payments: true, settlements: true, expiry: true, dailyDigest: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; type: "success" | "error"; text: string }>({ show: false, type: "success", text: "" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/biller/notification-preferences", notifications);
      if (response.data.status === "SUCCESS") setMessage({ show: true, type: "success", text: "Notification preferences saved!" });
      else setMessage({ show: true, type: "error", text: response.data.message || "Save failed" });
      setTimeout(() => setMessage({ show: false, type: "success", text: "" }), 3000);
    } catch (error) { setMessage({ show: true, type: "error", text: "Failed to save preferences" }); setTimeout(() => setMessage({ show: false, type: "error", text: "" }), 3000); }
    finally { setLoading(false); }
  };

  const NotificationItem = ({ id, label, description, icon: Icon, enabled }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3"><div className="p-2 bg-gray-50 rounded-lg"><Icon className="w-5 h-5 text-gray-500" /></div><div><p className="font-medium text-gray-800">{label}</p><p className="text-sm text-gray-500">{description}</p></div></div>
      <button onClick={() => setNotifications({ ...notifications, [id]: !enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"}`} /></button>
    </div>
  );

  return (
    <div className="space-y-6">
      {message.show && (<div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}{message.text}</div>)}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <NotificationItem id="email" label="Email Notifications" description="Receive notifications via email" icon={EnvelopeIcon} enabled={notifications.email} />
        <NotificationItem id="sms" label="SMS Notifications" description="Receive notifications via SMS" icon={DevicePhoneMobileIcon} enabled={notifications.sms} />
        <NotificationItem id="payments" label="Payment Received" description="Get notified when a customer makes a payment" icon={CheckCircleIcon} enabled={notifications.payments} />
        <NotificationItem id="settlements" label="Settlement Completed" description="Get notified when settlements are processed" icon={CreditCardIcon} enabled={notifications.settlements} />
        <NotificationItem id="expiry" label="Bill Expiry Reminder" description="Get reminders when bills are about to expire" icon={BellIcon} enabled={notifications.expiry} />
        <NotificationItem id="dailyDigest" label="Daily Digest" description="Receive a daily summary of all activities" icon={GlobeAltIcon} enabled={notifications.dailyDigest} />
      </div>
      <div className="flex justify-end"><button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{loading ? "Saving..." : "Save Preferences"}</button></div>
    </div>
  );
}