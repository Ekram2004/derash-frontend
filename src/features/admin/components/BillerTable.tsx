import { PencilIcon, TrashIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

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

export default function BillerTable({ billers, onEdit, onDelete, onToggleStatus }: Props) {
  return (
    <div className="bg-white shadow rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th>Code</th>
            <th>Category</th>
            <th>Partial</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {billers.map((biller) => (
            <tr key={biller.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{biller.name}</td>
              <td>{biller.code}</td>
              <td>{biller.category}</td>
              <td>{biller.allowsPartial ? "Yes" : "No"}</td>
              <td>
                <span
                  className={`px-1 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1 justify-center ${
                    biller.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {biller.isActive ? (
                    <CheckCircleIcon className="w-3 h-3" />
                  ) : (
                    <XCircleIcon className="w-3 h-3" />
                  )}
                  {biller.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="flex gap-2">
                <button
                  className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                  onClick={() => onEdit(biller)}
                >
                  <PencilIcon className="w-4 h-4" /> Edit
                </button>
                <button
                  className="text-red-600 hover:underline flex items-center gap-1 text-xs"
                  onClick={() => onDelete(biller.id)}
                >
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
                <button
                  className="text-gray-600 hover:underline text-xs"
                  onClick={() => onToggleStatus(biller.id)}
                >
                  {biller.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}