import {
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import type { User } from "../api/admin.api";

interface Props {
  users: User[];
  currentUserId: string | null;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function UserTable({
  users,
  currentUserId,
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
            System <span className="text-red-500">Users</span>
          </h2>
          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Manage platform users, roles, and account access.
          </p>
        </div>

        <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 uppercase tracking-wide border border-gray-200">
          Total: {users.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                User Identity
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Role
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
            {users.map((user) => (
              <tr
                key={user.id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Identity */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition">
                      <UserCircleIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-semibold text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-5 text-sm text-gray-700">
                  {user.email}
                </td>

                {/* Role */}
                <td className="px-6 py-5">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-5 text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        user.status === "active"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    {user.status === "active" ? "Active" : "Inactive"}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-8 py-5">
                  <div className="flex justify-end items-center gap-3">
                    
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit User"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>

                    {/* Enable/Disable */}
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition ${
                        user.status === "active"
                          ? "border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {user.status === "active" ? "Disable" : "Enable"}
                    </button>

                    {/* Delete */}
                    {String(user.id) !== currentUserId && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <UserCircleIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">
                      No users found in the system.
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