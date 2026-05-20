// src/features/biller/components/settings/UserAccountInfoCard.tsx

import { useState } from "react";
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon, CalendarIcon, IdentificationIcon, BriefcaseIcon, PhoneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function UserAccountInfoCard({ user, userDetails }: { user: any; userDetails: any }) {
  const [expanded, setExpanded] = useState(false);
  const userData = userDetails || user;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-ET", { year: "numeric", month: "long", day: "numeric" });
    } catch { return "N/A"; }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      BILLER: "bg-blue-100 text-blue-700",
      AGENT: "bg-green-100 text-green-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl"><UserCircleIcon className="w-5 h-5 text-blue-600" /></div>
          <div><h3 className="font-semibold text-gray-800">Account Information</h3><p className="text-xs text-gray-500">View your profile details</p></div>
        </div>
        <button className="text-blue-600 text-sm font-medium">{expanded ? "Collapse ▲" : "Expand ▼"}</button>
      </div>

      {expanded && (
        <div className="p-5">
          <div className="flex items-start gap-4 pb-4 mb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {userData?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{userData?.name || "User"}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(userData?.role || "BILLER")}`}>{userData?.role || "BILLER"}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{userData?.email || "No email provided"}</p>
              <p className="text-xs text-gray-400 mt-1">User ID: {userData?.id || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><EnvelopeIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-800">{userData?.email || "N/A"}</p></div></div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><BriefcaseIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">Role</p><p className="text-sm font-medium text-gray-800">{userData?.role || "BILLER"}</p></div></div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><IdentificationIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">User ID</p><p className="text-sm font-mono text-gray-600">{userData?.id || "N/A"}</p></div></div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><CalendarIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">Member Since</p><p className="text-sm text-gray-800">{formatDate(userData?.createdAt)}</p></div></div>
            {userData?.phone && (<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><PhoneIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">Phone</p><p className="text-sm text-gray-800">{userData.phone}</p></div></div>)}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><ShieldCheckIcon className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-400">Status</p><p className="text-sm"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircleIcon className="w-3 h-3" /> Active</span></p></div></div>
          </div>
        </div>
      )}
    </div>
  );
}