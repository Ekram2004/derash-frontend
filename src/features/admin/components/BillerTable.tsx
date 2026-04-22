import {
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

export interface Biller {
  id: string;
  name: string;
  code: string;
  category: string;
  allowsPartial: boolean;
  isActive: boolean;
}

interface Props {
  billers: Biller[];
  onEdit: (biller: Biller) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function BillerTable({
  billers,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  // Mobile card view state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="w-full bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Registered <span className="text-red-500">Billers</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            Manage your organization's billing partners and integration codes.
          </p>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-semibold text-gray-600 uppercase tracking-wide border border-gray-200 self-start sm:self-center">
          Total: {billers.length}
        </div>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Biller Identity
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Service Code
              </th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Partial Pay
              </th>
              <th className="px-4 lg:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 lg:px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Management
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {billers.map((biller) => (
              <tr
                key={biller.id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 lg:px-8 py-5">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <BuildingOfficeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm lg:text-base">
                        {biller.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {biller.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 lg:px-6 py-5">
                  <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-medium">
                    {biller.code}
                  </code>
                </td>

                <td className="px-4 lg:px-6 py-5">
                  <span className="text-sm font-medium text-gray-600">
                    {biller.category}
                  </span>
                </td>

                <td className="px-4 lg:px-6 py-5 text-center">
                  <span
                    className={`px-2 lg:px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap
                      ${
                        biller.allowsPartial
                          ? "bg-emerald-100 text-emerald-500"
                          : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {biller.allowsPartial ? "allowed" : "not allowed"}
                  </span>
                </td>

                <td className="px-4 lg:px-6 py-5 text-center">
                  <div
                    className={`inline-flex items-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold ${
                      biller.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                        biller.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {biller.isActive ? "Active" : "Inactive"}
                  </div>
                </td>

                <td className="px-6 lg:px-8 py-5">
                  <div className="flex justify-end items-center gap-2 lg:gap-3">
                    <button
                      onClick={() => onEdit(biller)}
                      className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Biller"
                    >
                      <PencilIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => onToggleStatus(biller.id)}
                      className={`px-2 lg:px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
                        biller.isActive
                          ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {biller.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => onDelete(biller.id)}
                      className="px-2 lg:px-4 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 lg:gap-1.5"
                      title="Delete Biller"
                    >
                      <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {billers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <BuildingOfficeIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">
                      No billers found in the database.
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
        {billers.map((biller) => (
          <div key={biller.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{biller.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Code: {biller.code}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpandedCard(expandedCard === biller.id ? null : biller.id)}
                className="p-2 text-gray-400"
              >
                {expandedCard === biller.id ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCard === biller.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Category</span>
                  <span className="text-sm font-medium text-gray-700">
                    {biller.category}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Partial Payment</span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      biller.allowsPartial
                        ? "bg-emerald-100 text-emerald-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {biller.allowsPartial ? "Allowed" : "Not Allowed"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Status</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      biller.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        biller.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {biller.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(biller)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                  >
                    <PencilIcon className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onToggleStatus(biller.id)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition ${
                      biller.isActive
                        ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {biller.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => onDelete(biller.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {billers.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">
                No billers found in the database.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}