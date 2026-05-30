// src/features/admin/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(err.message || t("failed_load_data"));
      setNotification({
        isOpen: true,
        message: t("failed_load_users"),
        type: "error",
        title: t("loading_error"),
        details: err.response?.data?.message || t("please_refresh"),
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
      setNotification({ isOpen: true, message: t("full_name_required"), type: "error", title: t("validation_error"), details: t("enter_full_name") });
      return false;
    }
    if (!form.email?.trim()) {
      setNotification({ isOpen: true, message: t("email_required"), type: "error", title: t("validation_error"), details: t("enter_valid_email") });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setNotification({ isOpen: true, message: t("invalid_email_format"), type: "error", title: t("validation_error"), details: t("valid_email_example") });
      return false;
    }
    if (!editingUser && (!form.password?.trim())) {
      setNotification({ isOpen: true, message: t("password_required"), type: "error", title: t("validation_error"), details: t("enter_password") });
      return false;
    }
    if (form.password && form.password.length < 6) {
      setNotification({ isOpen: true, message: t("password_too_short"), type: "error", title: t("validation_error"), details: t("password_min_length") });
      return false;
    }
    if (form.role === "AGENT_USER" && !form.agent_id) {
      setNotification({ isOpen: true, message: t("agent_assignment_required"), type: "error", title: t("validation_error"), details: t("select_agent") });
      return false;
    }
    if (form.role === "BILLER_USER" && !form.biller_id) {
      setNotification({ isOpen: true, message: t("biller_assignment_required"), type: "error", title: t("validation_error"), details: t("select_biller") });
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
        setNotification({ isOpen: true, message: t("user_updated"), type: "success", title: t("update_successful") });
      } else {
        await adminApi.createUser(payload);
        setNotification({ isOpen: true, message: t("user_created"), type: "success", title: t("creation_successful") });
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      let msg = error.response?.data?.message || t("operation_failed");
      if (error.response?.status === 400) msg = error.response?.data?.message || t("invalid_data");
      else if (error.response?.status === 409) msg = `${t("email_exists")} "${form.email}".`;
      else if (error.response?.status === 403) msg = t("permission_denied");
      else if (error.response?.status === 404) msg = t("agent_biller_not_found");
      else if (!navigator.onLine) msg = t("no_internet");
      setNotification({ isOpen: true, message: msg, type: "error", title: t("operation_failed_title"), details: t("check_try_again") });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await adminApi.toggleStatus(id);
      await loadData();
      setNotification({ isOpen: true, message: t("status_updated_message"), type: "success", title: t("status_updated") });
    } catch (error: any) {
      setNotification({ isOpen: true, message: t("status_update_failed"), type: "error", title: t("update_failed"), details: error.response?.data?.message || t("try_again_later") });
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm(t("confirm_delete_user"))) {
      try {
        await adminApi.deleteUser(id);
        await loadData();
        setNotification({ isOpen: true, message: t("user_deleted"), type: "success", title: t("deletion_successful") });
      } catch (error: any) {
        setNotification({ isOpen: true, message: t("delete_failed"), type: "error", title: t("deletion_failed"), details: error.response?.data?.message || t("try_again_later") });
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
      <DashboardLayout title={t("users_directory")} links={adminLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">{t("loading_users")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title={t("users_directory")} links={adminLinks}>
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={loadData} className="mt-2 text-red-600 underline">{t("try_again")}</button>
        </div>
      </DashboardLayout>
    );
  }

  // Success: render full UI
  return (
    <DashboardLayout title={t("users_directory")} links={adminLinks}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            {t("users_management")}
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            {t("users_description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all w-full sm:w-auto justify-center">
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
              <span className="hidden sm:inline">{t("add_new_user")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">{t("total_users")}</p><p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{users.length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-lg md:rounded-xl flex items-center justify-center"><UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-red-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">{t("active")}</p><p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{users.filter(u => u.status === "active").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center"><ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">{t("disabled")}</p><p className="text-xl md:text-2xl font-bold text-rose-600 mt-1">{users.filter(u => u.status === "disabled").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 rounded-lg md:rounded-xl flex items-center justify-center"><UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-rose-500" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400 font-medium">{t("admins")}</p><p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{users.filter(u => u.role === "SYSTEM_ADMIN").length}</p></div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center"><ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-500" /></div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input type="text" placeholder={t("search_placeholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 pl-9 md:pl-12 pr-3 md:pr-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 placeholder:text-gray-300" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
          <FunnelIcon className="w-4 h-4 md:w-5 md:h-5" /> {t("filters")} {(roleFilter || statusFilter) && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        {(roleFilter || statusFilter || search) && <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2">{t("clear_all")}</button>}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl md:rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">{t("role")}</label><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"><option value="">{t("all_roles")}</option><option value="SYSTEM_ADMIN">{t("system_admin")}</option><option value="AGENT_USER">{t("agent_user")}</option><option value="BILLER_USER">{t("biller_user")}</option></select></div>
            <div><label className="text-xs font-semibold text-gray-600 mb-1 block">{t("status")}</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"><option value="">{t("all_status")}</option><option value="active">{t("active")}</option><option value="disabled">{t("disabled")}</option></select></div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UserTable users={filtered} currentUserId={currentUserId} onEdit={openEditModal} onDelete={deleteUser} onToggleStatus={toggleStatus} />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} title={editingUser ? t("user_configuration") : t("new_user_registration")} onClose={() => setIsModalOpen(false)}>
        <div className="p-1 sm:p-2">
          <div className="mb-6 md:mb-8"><h2 className="text-xl md:text-2xl font-bold text-gray-900">{editingUser ? t("edit_user_details") : t("register_user")}</h2><p className="text-sm text-gray-400 mt-1">{t("fill_user_credentials")}</p></div>
          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("full_name")} <span className="text-red-500">*</span></label><div className="relative"><UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder={t("full_name_placeholder")} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("email_address")} <span className="text-red-500">*</span></label><div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" placeholder={t("email_placeholder")} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("password")} {!editingUser && <span className="text-red-500">*</span>}</label><div className="relative"><KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="password" placeholder={editingUser ? t("leave_blank_keep") : t("enter_password")} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} /></div>{!editingUser && <p className="text-xs text-gray-400 ml-1">{t("password_hint")}</p>}</div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("user_role")} <span className="text-red-500">*</span></label><div className="relative"><ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, agent_id: "", biller_id: "" })} required><option value="SYSTEM_ADMIN">{t("system_administrator")}</option><option value="AGENT_USER">{t("agent_user")}</option><option value="BILLER_USER">{t("biller_user")}</option></select></div></div>
            {form.role === "AGENT_USER" && (<div className="space-y-1.5 animate-in fade-in duration-300"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("assign_agent")} <span className="text-red-500">*</span></label><div className="relative"><CpuChipIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-blue-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} required><option value="">{t("select_agent")}</option>{agents.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}</select></div><p className="text-xs text-gray-400 ml-1">{t("agent_user_description")}</p></div>)}
            {form.role === "BILLER_USER" && (<div className="space-y-1.5 animate-in fade-in duration-300"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("assign_biller")} <span className="text-red-500">*</span></label><div className="relative"><BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full bg-yellow-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 pl-9 md:pl-10 pr-3 md:pr-4 font-semibold text-sm text-gray-700 transition appearance-none" value={form.biller_id} onChange={(e) => setForm({ ...form, biller_id: e.target.value })} required><option value="">{t("select_biller")}</option>{billers.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}</select></div><p className="text-xs text-gray-400 ml-1">{t("biller_user_description")}</p></div>)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl md:rounded-2xl transition font-bold text-sm order-2 sm:order-1" onClick={() => setIsModalOpen(false)}>{t("discard")}</button>
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-red-200 transition font-bold text-sm order-1 sm:order-2" onClick={handleSave}>{editingUser ? t("apply_changes") : t("confirm_registration")}</button>
          </div>
        </div>
      </Modal>

      <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} title={notification.title} details={notification.details} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} duration={notification.type === "error" ? 5000 : 3000} onRetry={notification.type === "error" && notification.title !== t("validation_error") && notification.title !== t("validation_failed") ? handleSave : undefined} />
    </DashboardLayout>
  );
}