import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import SuccessModal from "@/shared/components/SuccessModal";
import UserTable from "../components/UserTable";
import { adminApi } from "../api/admin.api";
import type { User } from "../api/admin.api";

import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface FormState {
  name: string;
  email: string;
  password: string;
  role: string;
  agent_id?: string;
  biller_id?: string;
}

interface Agent {
  id: string;
  name: string;
}

interface Biller {
  id: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "SYSTEM_ADMIN",
  });

  // Load Data
  const loadData = async () => {
    try {
      const usersData = await adminApi.getUsers();
      const agentsData = await adminApi.getAgents();
      const billersData = await adminApi.getBillers();
      const current = await adminApi.getCurrentUser();

      setUsers(usersData);
      setAgents(agentsData);
      setBillers(billersData);

      if (current?.id) setCurrentUserId(String(current.id));
      else if (current?.user?.id)
        setCurrentUserId(String(current.user.id));
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter
  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Open Add
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

  // Open Edit
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

  // Save
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
        setSuccessMessage("User updated successfully!");
      } else {
        await adminApi.createUser(payload);
        setSuccessMessage("User created successfully!");
      }

      await loadData();
      setIsModalOpen(false);
      setSuccessOpen(true);
    } catch (error: any) {
      setSuccessMessage(
        error.response?.data?.message || "Operation failed."
      );
      setSuccessOpen(true);
    }
  };

  // Toggle
  const toggleStatus = async (id: string) => {
    try {
      await adminApi.toggleStatus(id);
      await loadData();
      setSuccessMessage("Status updated successfully.");
      setSuccessOpen(true);
    } catch {
      setSuccessMessage("Failed to update status.");
      setSuccessOpen(true);
    }
  };

  // Delete
  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(id);
        await loadData();
        setSuccessMessage("User deleted successfully.");
        setSuccessOpen(true);
      } catch {
        setSuccessMessage("Deletion failed.");
        setSuccessOpen(true);
      }
    }
  };

  return (
    <DashboardLayout title="Users Directory" links={adminLinks}>
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Users{" "}
            <span className="text-transparent bg-clip-text
             bg-gradient-to-r from-red-600 to-rose-400">
              Directory
            </span>
          </h1>

          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Manage platform users, permissions, and system access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 font-bold text-sm"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 shadow-sm transition-all font-medium text-gray-600 placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UserTable
          users={filtered}
          currentUserId={currentUserId}
          onEdit={openEditModal}
          onDelete={deleteUser}
          onToggleStatus={toggleStatus}
        />
      </div>

      <Modal
  isOpen={isModalOpen}
  title={editingUser ? "User Configuration" : "New User Registration"}
  onClose={() => setIsModalOpen(false)}
>
  <div className="p-2">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900">
        {editingUser ? "Edit User Details" : "Register User"}
      </h2>
      <p className="text-gray-400 text-sm mt-1">
        Fill in user credentials and assign roles below.
      </p>
    </div>

    <div className="space-y-5">
      
      {/* GRID (same as Agent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <input
          type="text"
          placeholder="Full Name"
          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
      </div>

      {/* PASSWORD */}
      <input
        type="password"
        placeholder={
          editingUser
            ? "Password (leave blank to keep current)"
            : "Password"
        }
        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      {/* ROLE */}
      <select
        className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
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

      {/* AGENT SELECT */}
      {form.role === "AGENT_USER" && (
        <select
          className="w-full bg-blue-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
          value={form.agent_id}
          onChange={(e) =>
            setForm({ ...form, agent_id: e.target.value })
          }
        >
          <option value="">Select Agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {/* BILLER SELECT */}
      {form.role === "BILLER_USER" && (
        <select
          className="w-full bg-yellow-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
          value={form.biller_id}
          onChange={(e) =>
            setForm({ ...form, biller_id: e.target.value })
          }
        >
          <option value="">Select Biller</option>
          {billers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}
    </div>

    {/* ACTION BUTTONS (same as Agent) */}
    <div className="flex gap-3 mt-10">
      <button
        className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm"
        onClick={() => setIsModalOpen(false)}
      >
        Discard
      </button>

      <button
        className="flex-[2] px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-2xl shadow-lg font-bold text-sm"
        onClick={handleSave}
      >
        {editingUser ? "Apply Changes" : "Confirm Registration"}
      </button>
    </div>
  </div>
</Modal>

      {/* SUCCESS */}
      <SuccessModal
        isOpen={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </DashboardLayout>
  );
}