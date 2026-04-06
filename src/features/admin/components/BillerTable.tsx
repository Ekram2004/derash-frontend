import {
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
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
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      
      {/* Table Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Billers List
        </h2>
        <p className="text-sm text-gray-500">
          Manage all registered billers and their status
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-center">Partial</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {billers.map((biller) => (
              <tr
                key={biller.id}
                className="hover:bg-gray-50 transition"
              >
                {/* Name */}
                <td className="px-6 py-4 font-medium text-gray-900">
                  {biller.name}
                </td>

                {/* Code */}
                <td className="px-6 py-4 text-gray-600">
                  {biller.code}
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-gray-600">
                  {biller.category}
                </td>

                {/* Partial */}
                <td className="px-6 py-4 text-center">
                  {biller.allowsPartial ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      No
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      biller.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {biller.isActive ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <XCircleIcon className="w-4 h-4" />
                    )}
                    {biller.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-end items-center gap-2">
                    
                    <button
                      onClick={() => onEdit(biller)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(biller.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>

                    <button
                      onClick={() => onToggleStatus(biller.id)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      {biller.isActive ? "Disable" : "Enable"}
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {billers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-gray-500"
                >
                  No billers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}