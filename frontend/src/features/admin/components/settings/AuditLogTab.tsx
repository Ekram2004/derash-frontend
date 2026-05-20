// src/features/admin/components/settings/AuditLogTab.tsx

import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function AuditLogTab() {
  const [logs] = useState([
    { id: "1", action: "User Login", user: "admin@derash.gov.et", role: "ADMIN", timestamp: new Date().toISOString(), details: "Successful login" },
    { id: "2", action: "Settings Updated", user: "admin@derash.gov.et", role: "ADMIN", timestamp: new Date().toISOString(), details: "Platform settings modified" },
    { id: "3", action: "User Created", user: "admin@derash.gov.et", role: "ADMIN", timestamp: new Date().toISOString(), details: "New biller account created" },
  ]);

  const formatDate = (date: string) => new Date(date).toLocaleString("en-ET", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4"><DocumentTextIcon className="w-5 h-5 text-gray-600" /><h3 className="font-semibold text-gray-800">Audit Logs</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Timestamp</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Details</th></tr></thead>
            <tbody>{logs.map((log) => (<tr key={log.id} className="border-t hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-600">{formatDate(log.timestamp)}</td><td className="px-4 py-3 text-sm font-medium text-gray-800">{log.action}</td><td className="px-4 py-3 text-sm text-gray-600">{log.user}</td><td className="px-4 py-3 text-sm text-gray-500">{log.details}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}