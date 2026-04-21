// src/features/admin/components/AgentTable.tsx

import { PencilIcon, TrashIcon, CpuChipIcon } from "@heroicons/react/24/solid";

interface Agent {
  id: string;
  name: string;
  code: string;
  api_key?: string;
  isEnabled: boolean;
}

interface Props {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AgentTable({
  agents,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Registered <span className="text-red-500">Agents</span>
          </h2>
          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Manage system agents, API integrations, and authentication keys.
          </p>
        </div>

        <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 uppercase tracking-wide border border-gray-200">
          Total: {agents.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Agent Identity
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                API Key
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Management
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Identity */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <CpuChipIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {agent.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="px-6 py-5">
                  <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-medium">
                    {agent.code}
                  </code>
                </td>

                {/* API Key */}
                <td className="px-6 py-5">
                  <span className="text-xs text-gray-500 font-mono">
                    {agent.api_key ? agent.api_key.slice(0, 12) + "..." : "-"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-5 text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      agent.isEnabled
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        agent.isEnabled ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {agent.isEnabled ? "Active" : "Inactive"}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-8 py-5">
                  <div className="flex justify-end items-center gap-3">
                    
                      <button
                               onClick={() => onEdit(agent)}
                            className="flex items-center gap-1 px-2 py-1.5
                             text-xs font-bold rounded-lg border border-blue-200 
                               text-blue-600 hover:bg-blue-50 transition"
                           title="Edit Biller" >
                             <PencilIcon className="w-4 h-4" />
                               Edit
                             </button>
                    <button
                      onClick={() => onToggleStatus(agent.id)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
                        agent.isEnabled
                          ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {agent.isEnabled ? "Disable" : "Enable"}
                    </button>

                    <button
                     onClick={() => onDelete(agent.id)}
                     className="px-4 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5"
                     title="Delete Biller"
                   >
                     <TrashIcon className="w-4 h-4" />
                     Delete
                   </button>

                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <CpuChipIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">
                      No agents found in the database.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}