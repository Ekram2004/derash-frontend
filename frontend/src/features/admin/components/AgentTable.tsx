// src/features/admin/components/AgentTable.tsx

import { PencilIcon, TrashIcon, CpuChipIcon, ChevronDownIcon, ChevronUpIcon, KeyIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {t("registered")} <span className="text-red-500">{t("agents")}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            {t("agent_table_description")}
          </p>
        </div>

        <div className="bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-semibold text-gray-600 uppercase tracking-wide border border-gray-200 self-start sm:self-center">
          {t("total")}: {agents.length}
        </div>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("agent_identity")}
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("code")}
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("api_key")}
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="px-6 lg:px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("management")}
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
                <td className="px-6 lg:px-8 py-5">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <CpuChipIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900 text-sm lg:text-base">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t("id")}: {agent.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="px-4 lg:px-6 py-5">
                  <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-medium">
                    {agent.code}
                  </code>
                </td>

                {/* API Key */}
                <td className="px-4 lg:px-6 py-5">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-mono">
                      {agent.api_key ? agent.api_key.slice(0, 12) + "..." : "—"}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 lg:px-6 py-5 text-center">
                  <div
                    className={`inline-flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold ${
                      agent.isEnabled
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                        agent.isEnabled ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {agent.isEnabled ? t("active") : t("inactive")}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 lg:px-8 py-5">
                  <div className="flex justify-end items-center gap-2 lg:gap-3">
                    <button
                      onClick={() => onEdit(agent)}
                      className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                      title={t("edit_agent")}
                    >
                      <PencilIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">{t("edit")}</span>
                    </button>

                    <button
                      onClick={() => onToggleStatus(agent.id)}
                      className={`px-2 lg:px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
                        agent.isEnabled
                          ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {agent.isEnabled ? t("disable") : t("enable")}
                    </button>

                    <button
                      onClick={() => onDelete(agent.id)}
                      className="px-2 lg:px-4 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 lg:gap-1.5"
                      title={t("delete_agent")}
                    >
                      <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">{t("delete")}</span>
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
                      {t("no_agents_found")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible on Mobile only) */}
      <div className="block md:hidden divide-y divide-gray-100">
        {agents.map((agent) => (
          <div key={agent.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <CpuChipIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {t("code")}: {agent.code}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpandedCard(expandedCard === agent.id ? null : agent.id)}
                className="p-2 text-gray-400"
              >
                {expandedCard === agent.id ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCard === agent.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t("agent_id")}</span>
                  <span className="text-xs font-mono text-gray-600">
                    {agent.id.slice(0, 12)}...
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t("api_key")}</span>
                  <div className="flex items-center gap-1">
                    <KeyIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-mono text-gray-600">
                      {agent.api_key ? agent.api_key.slice(0, 12) + "..." : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t("status")}</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      agent.isEnabled
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        agent.isEnabled ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {agent.isEnabled ? t("active") : t("inactive")}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(agent)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                  >
                    <PencilIcon className="w-3 h-3" />
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => onToggleStatus(agent.id)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition ${
                      agent.isEnabled
                        ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {agent.isEnabled ? t("disable") : t("enable")}
                  </button>
                  <button
                    onClick={() => onDelete(agent.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                  >
                    <TrashIcon className="w-3 h-3" />
                    {t("delete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {agents.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <CpuChipIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">
                {t("no_agents_found")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}