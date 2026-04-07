import {
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";

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
  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Registered <span className="text-red-500">Billers</span>
          </h2>
          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Manage your organization’s billing partners and integration codes.
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 uppercase tracking-wide border border-gray-200">
          Total: {billers.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Biller Identity
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Service Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Partial Pay
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
            {billers.map((biller) => (
              <tr
                key={biller.id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Identity */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <BuildingOfficeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {biller.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {biller.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="px-6 py-5">
                  <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-medium">
                    {biller.code}
                  </code>
                </td>

                {/* Category */}
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-gray-600 ">
                    {biller.category}
                  </span>
                </td>

                {/* Partial Pay */}
                <td className="px-6 py-5 text-center">
            <span
                 className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap
                   ${
                    biller.allowsPartial
                     ? "bg-emerald-100 text-emerald-500"
                    : "bg-gray-100 text-gray-400"
                      }`}
                    >
              {biller.allowsPartial ? "allowed" : "not allowed"}
  </span>
</td>

                {/* Status */}
                <td className="px-6 py-5 text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      biller.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        biller.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {biller.isActive ? "Active" : "Inactive"}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-8 py-5">
                  <div className="flex justify-end items-center gap-3">
                    <button
                      onClick={() => onEdit(biller)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Biller"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => onToggleStatus(biller.id)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
                        biller.isActive
                          ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {biller.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => onDelete(biller.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Biller"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
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
    </div>
  );
}
