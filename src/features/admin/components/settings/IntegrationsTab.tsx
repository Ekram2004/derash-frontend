// src/features/admin/components/settings/IntegrationsTab.tsx

import { useState } from "react";
import { PuzzlePieceIcon } from "@heroicons/react/24/outline";

export default function IntegrationsTab() {
  const [integrations] = useState([
    { id: "1", name: "CBE-Birr", status: "connected", lastSync: new Date().toISOString() },
    { id: "2", name: "Dashen Bank", status: "connected", lastSync: new Date().toISOString() },
    { id: "3", name: "Telebirr", status: "pending" },
    { id: "4", name: "Awash Bank", status: "disconnected" },
  ]);

  const getStatusBadge = (status: string) => {
    const styles = { connected: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", disconnected: "bg-red-100 text-red-700" };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4"><PuzzlePieceIcon className="w-5 h-5 text-indigo-600" /><h3 className="font-semibold text-gray-800">Bank & Payment Integrations</h3></div>
        <p className="text-sm text-gray-500 mb-4">Manage connections to banks and payment service providers</p>
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-gray-100 gap-3">
              <div><p className="font-medium text-gray-800">{integration.name}</p>{integration.lastSync && <p className="text-xs text-gray-400">Last sync: {new Date(integration.lastSync).toLocaleString()}</p>}</div>
              <div className="flex items-center gap-3">{getStatusBadge(integration.status)}<button className={`px-3 py-1 text-sm rounded-lg transition ${integration.status === "connected" ? "text-red-600 hover:bg-red-50" : integration.status === "pending" ? "text-yellow-600 hover:bg-yellow-50" : "text-blue-600 hover:bg-blue-50"}`}>{integration.status === "connected" ? "Configure" : integration.status === "pending" ? "Retry" : "Setup"}</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}