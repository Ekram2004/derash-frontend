// src/features/admin/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import NotificationModal from "@/shared/components/NotificationModal";
import UserTable from "../components/UserTable";
import { adminApi } from "../api/admin.api";
import type { User } from "../api/admin.api";

import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  UserGroupIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
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

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  details?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: "",
    type: "success",
    title: "",
    details: "",
  });

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
    setLoading(true);
    setError(null);
    try {
      const [usersData, agentsData, billersData, current] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAgents(),
        adminApi.getBillers(),
        adminApi.getCurrentUser().catch(() => null),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setBillers(Array.isArray(billersData) ? billersData : []);

      if (current?.id) setCurrentUserId(String(current.id));
      else if (current?.user?.id) setCurrentUserId(String(current.user.id));
    } catch (err: any) {
      console.error("Failed to load data", err);
      setError(err.message || "Failed to load users data. Please refresh.");
      setNotification({
        isOpen: true,
        message: "Failed to load users data",
        type: "error",
        title: "Loading Error",
        details: err.response?.data?.message || "Please refresh the page and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const validateForm = (): boolean => {
    if (!form.name?.trim()) {
      setNotification({ isOpen: true, message: "Full name is required", type: "error", title: "Validation Error", details: "Please enter the user's full name" });
      return false;
    }
    if (!form.email?.trim()) {
      setNotification({ isOpen: true, message: "Email address is required", type: "error", title: "Validation Error", details: "Please enter a valid email address" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setNotification({ isOpen: true, message: "Invalid email format", type: "error", title: "Validation Error", details: "Please enter a valid email address (e.g., user@example.com)" });
      return false;
    }
    if (!editingUser && (!form.password?.trim())) {
      setNotification({ isOpen: true, message: "Password is required", type: "error", title: "Validation Error", details: "Please enter a password for the new user" });
      return false;
    }
    if (form.password && form.password.length < 6) {
      setNotification({ isOpen: true, message: "Password is too short", type: "error", title: "Validation Error", details: "Password must be at least 6 characters long" });
      return false;
    }
    if (form.role === "AGENT_USER" && !form.agent_id) {
      setNotification({ isOpen: true, message: "Agent assignment required", type: "error", title: "Validation Error", details: "Please select an agent for this user" });
      return false;
    }
    if (form.role === "BILLER_USER" && !form.biller_id) {
      setNotification({ isOpen: true, message: "Biller assignment required", type: "error", title: "Validation Error", details: "Please select a biller for this user" });
      return false;
    }
    return true;
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "SYSTEM_ADMIN" });
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
    if (!validateForm()) return;
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
        setNotification({ isOpen: true, message: "User updated successfully!", type: "success", title: "Update Successful" });
      } else {
        await adminApi.createUser(payload);
        setNotification({ isOpen: true, message: "User created successfully!", type: "success", title: "Creation Successful" });
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      let msg = error.response?.data?.message || "Operation failed. Please try again.";
      if (error.response?.status === 400) msg = error.response?.data?.message || "Invalid data provided";
      else if (error.response?.status === 409) msg = `User with email "${form.email}" already exists.`;
      else if (error.response?.status === 403) msg = "You don't have permission to perform this action";
      else if (error.response?.status === 404) msg = "Selected agent or biller not found";
      else if (!navigator.onLine) msg = "No internet connection";
      setNotification({ isOpen: true, message: msg, type: "error", title: "Operation Failed", details: "Please check and try again." });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await adminApi.toggleStatus(id);
      await loadData();
      setNotification({ isOpen: true, message: "User status updated successfully.", type: "success", title: "Status Updated" });
    } catch (error: any) {
      setNotification({ isOpen: true, message: "Failed to update user status", type: "error", title: "Update Failed", details: error.response?.data?.message || "Please try again later" });
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await adminApi.deleteUser(id);
        await loadData();
        setNotification({ isOpen: true, message: "User deleted successfully.", type: "success", title: "Deletion Successful" });
      } catch (error: any) {
        setNotification({ isOpen: true, message: "Failed to delete user", type: "error", title: "Deletion Failed", details: error.response?.data?.message || "Please try again later" });
      }
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Users Directory" links={adminLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Users Directory" links={adminLinks}>
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={loadData} className="mt-2 text-red-600 underline">Try again</button>
        </div>
      </DashboardLayout>
    );
  }

  // Success: render full UI
  return (
    <DashboardLayout title="Users Directory" links={adminLinks}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            Manage platform users, permissions, and system access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all w-full sm:w-auto justify-center">
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add</span>
            </span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">Total Users</p><p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{users.length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center"><UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-red-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">Active</p><p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{users.filter(u => u.status === "active").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center"><ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">Disabled</p><p className="text-xl md:text-2xl font-bold text-rose-600 mt-1">{users.filter(u => u.status === "disabled").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 rounded-lg md:rounded-xl flex items-center justify-center"><UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-rose-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">Admins</p><p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{users.filter(u => u.role === "SYSTEM_ADMIN").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center"><ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-500" /></div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input type="text" placeholder="Search by name, email or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 pl-9 md:pl-12 pr-3 md:pr-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 placeholder:text-gray-300" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
          <FunnelIcon className="w-4 h-4 md:w-5 md:h-5" /> Filters {(roleFilter || statusFilter) && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        {(roleFilter || statusFilter || search) && <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2">Clear all</button>}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl md:rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Role</label><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"><option value="">All Roles</option><option value="SYSTEM_ADMIN">System Admin</option><option value="AGENT_USER">Agent User</option><option value="BILLER_USER">Biller User</option></select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"><option value="">All Status</option><option value="active">Active</option><option value="disabled">Disabled</option></select></div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UserTable users={filtered} currentUserId={currentUserId} onEdit={openEditModal} onDelete={deleteUser} onToggleStatus={toggleStatus} />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} title={editingUser ? "User Configuration" : "New User Registration"} onClose={() => setIsModalOpen(false)}>
        <div className="p-1 sm:p-2">
          <div className="mb-6 md:mb-8"><h2 className="text-xl md:text-2xl font-bold text-gray-900">{editingUser ? "Edit User Details" : "Register User"}</h2><p className="text-sm text-gray-400 mt-1">Fill in user credentials and assign roles below.</p></div>
          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name <span className="text-red-500">*</span></label><div className="relative"><UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label><div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" placeholder="user@example.com" className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password {!editingUser && <span className="text-red-500">*</span>}</label><div className="relative"><KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="password" placeholder={editingUser ? "Leave blank to keep current" : "Enter password"} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} /></div>{!editingUser && <p className="text-xs text-gray-400 ml-1">Minimum 6 characters with letters and numbers</p>}</div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">User Role <span className="text-red-500">*</span></label><div className="relative"><ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, agent_id: "", biller_id: "" })} required><option value="SYSTEM_ADMIN">System Administrator</option><option value="AGENT_USER">Agent User</option><option value="BILLER_USER">Biller User</option></select></div></div>
            {form.role === "AGENT_USER" && (<div className="space-y-1.5 animate-in fade-in duration-300"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Agent <span className="text-red-500">*</span></label><div className="relative"><CpuChipIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-blue-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} required><option value="">Select Agent</option>{agents.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select></div><p className="text-xs text-gray-400 ml-1">Agent users can manage agent-specific operations</p></div>)}
            {form.role === "BILLER_USER" && (<div className="space-y-1.5 animate-in fade-in duration-300"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Biller <span className="text-red-500">*</span></label><div className="relative"><BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-yellow-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.biller_id} onChange={(e) => setForm({ ...form, biller_id: e.target.value })} required><option value="">Select Biller</option>{billers.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}</select></div><p className="text-xs text-gray-400 ml-1">Biller users can manage billing operations</p></div>)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl md:rounded-2xl transition font-bold text-sm order-2 sm:order-1" onClick={() => setIsModalOpen(false)}>Discard</button>
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-red-200 transition font-bold text-sm order-1 sm:order-2" onClick={handleSave}>{editingUser ? "Apply Changes" : "Confirm Registration"}</button>
          </div>
        </div>
      </Modal>

      <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} title={notification.title} details={notification.details} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} duration={notification.type === "error" ? 5000 : 3000} onRetry={notification.type === "error" && notification.title !== "Validation Error" && notification.title !== "Validation Failed" ? handleSave : undefined} />
    </DashboardLayout>
  );
}