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
interface Biller {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
}



export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [billers, setBillers] = useState<Biller[]>([]); 
  const [agents, setAgents] = useState<Agent[]>([]);   
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "SYSTEM_ADMIN",
  });

  
useEffect(() => {
  const loadData = async () => {
    try {
      const usersData = await adminApi.getUsers();
      setUsers(usersData);
const billersData = await adminApi.getBillers(); 
setBillers(billersData);

const agentsData = await adminApi.getAgents(); 
setAgents(agentsData);
      const response = await adminApi.getCurrentUser();
      console.log("My User Data:", response);

      if (response && response.id) {
        setCurrentUserId(String(response.id));
      } else if (response && response.user && response.user.id) {
        setCurrentUserId(String(response.user.id));
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  };
  loadData();
}, []);

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
      agent_id: user.agentId,
      biller_id: user.billerId,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        fullName: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password) payload.password = form.password;
      if (form.role === "AGENT_USER") payload.agentId = form.agent_id;
      if (form.role === "BILLER_USER") payload.billerId = form.biller_id;

      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload);
      } else {
        await adminApi.createUser(payload);
      }

      const freshUsersList = await adminApi.getUsers();
      setUsers(freshUsersList);
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
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status.");
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete user");
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
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3 font-medium">{user.fullName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs text-white rounded-full ${
                      user.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </button>

                  {String(user.id) !== currentUserId && (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  )}

                  <button
                    className="text-gray-600 hover:underline"
                    onClick={() => toggleStatus(user.id)}
                  >
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
            placeholder={
              editingUser
                ? "Password (leave blank to keep current)"
                : "Password"
            }
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
            <select
              className="border p-2 rounded bg-blue-50"
              value={form.agent_id}
              onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          {form.role === "BILLER_USER" && (
            <select
              className="border p-2 rounded bg-yellow-50"
              value={form.biller_id}
              onChange={(e) => setForm({ ...form, biller_id: e.target.value })}
            >
              <option value="">Select Biller</option>
              {billers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <button
            disabled={!isFormValid}
            onClick={handleSave}
            className={`p-2 text-white rounded transition ${
              isFormValid
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {editingUser ? "Update User" : "Create User"}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
