import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminApi } from "../api/admin.api";
import type { User } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";

interface FormState {
  name: string;
  email: string;
  password: string;
  role: string;
  agent_id?: string;
  biller_id?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "SYSTEM_ADMIN",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "SYSTEM_ADMIN",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.fullName, 
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        fullName: form.name, 
        email: form.email,
        role: form.role,
        billerId: form.biller_id,
        agentId: form.agent_id,

      };

      if (form.password) {
        payload.password = form.password;
      }

      if (form.role === "AGENT_USER") {
        payload.agentId = form.agent_id;
      }

      if (form.role === "BILLER_USER") {
        payload.billerId = form.biller_id;
      }

      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload);
      } else {
        await adminApi.createUser(payload);
      }
      const freshUsersList = await adminApi.getUsers();
      setUsers(freshUsersList);

      // await loadUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      
      await adminApi.toggleStatus(id);

      const updatedUsers = await adminApi.getUsers();
      setUsers(updatedUsers);
      alert("User status updated successfully!"); 
    } catch (error: any) {
      console.error("Error toggling status:", error);
      alert(error.response?.data?.message || "Failed to update user status."); 
    }
  };



  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  const isValidEmail = (email: string) => /^[\w.-]+@[\w.-]+\.\w+$/.test(email);

  const isFormValid =
    form.name &&
    form.email &&
    isValidEmail(form.email) &&
    (!editingUser ? form.password : true) &&
    (form.role !== "AGENT_USER" || form.agent_id) &&
    (form.role !== "BILLER_USER" || form.biller_id);

  return (
    <DashboardLayout title="Manage Users" links={adminLinks}>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border p-2 rounded-lg w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={openAddModal}
        >
          Add User
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>

                <td>
                  <span
                    className={`px-2 py-1 text-xs text-white rounded-full ${
                      user.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="flex gap-2">
                  <button onClick={() => openEditModal(user)}>Edit</button>
                  <button onClick={() => deleteUser(user.id)}>Delete</button>
                  <button onClick={() => toggleStatus(user.id)}>
                    {user.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingUser ? "Edit User" : "Add User"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <input
            placeholder="Name"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="border p-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
                agent_id: "",
                biller_id: "",
              })
            }
          >
            <option value="SYSTEM_ADMIN">Admin</option>
            <option value="AGENT_USER">Agent</option>
            <option value="BILLER_USER">Biller</option>
          </select>

          {form.role === "AGENT_USER" && (
            <input
              placeholder="Agent ID"
              className="border p-2 rounded"
              value={form.agent_id || ""}
              onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
            />
          )}

          {form.role === "BILLER_USER" && (
            <input
              placeholder="Biller ID"
              className="border p-2 rounded"
              value={form.biller_id || ""}
              onChange={(e) => setForm({ ...form, biller_id: e.target.value })}
            />
          )}

          <button
            disabled={!isFormValid}
            onClick={handleSave}
            className={`p-2 text-white rounded ${
              isFormValid ? "bg-red-600" : "bg-gray-400"
            }`}
          >
            Save
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
