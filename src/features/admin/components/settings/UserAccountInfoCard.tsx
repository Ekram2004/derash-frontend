// src/features/admin/components/settings/UserAccountInfoCard.tsx

import { useState } from "react";
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface UserAccountInfoCardProps {
  user: any;
}

function CalendarIconOutline({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function EnvelopeIconOutline({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function UserAccountInfoCard({ user }: UserAccountInfoCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-ET", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl"><UserCircleIcon className="w-5 h-5 text-blue-600" /></div>
          <div><h3 className="font-semibold text-gray-800">Administrator Account</h3><p className="text-xs text-gray-500">Your profile and account information</p></div>
        </div>
        <button className="text-blue-600 text-sm font-medium">{expanded ? "Collapse ▲" : "Expand ▼"}</button>
      </div>

      {expanded && (
        <div className="p-5">
          <div className="flex items-start gap-4 pb-4 mb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name || "Administrator"}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.email || "admin@derash.gov.et"}</p>
              <p className="text-xs text-gray-400 mt-1">User ID: {user?.id || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <EnvelopeIconOutline className="w-5 h-5 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-800">{user?.email || "admin@derash.gov.et"}</p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Role</p><p className="text-sm"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">ADMINISTRATOR</span></p></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CalendarIconOutline className="w-5 h-5 text-gray-400 mt-0.5" />
              <div><p className="text-xs text-gray-400">Member Since</p><p className="text-sm text-gray-800">{formatDate(user?.createdAt)}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}