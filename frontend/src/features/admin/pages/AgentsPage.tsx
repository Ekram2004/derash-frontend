// src/features/admin/pages/AgentsPage.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import NotificationModal from "@/shared/components/NotificationModal";
import AgentTable from "../components/AgentTable";
import { adminApi } from "../api/admin.api";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Agent {
  id: string;
  name: string;
  code: string;
  api_key?: string;
  isEnabled: boolean;
}

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  details?: string;
}

export default function AgentsPage() {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: "",
    type: "success",
    title: "",
    details: "",
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    api_key: "",
    isEnabled: true,
  });

  // Load agents
  const loadData = async () => {
    try {
      const data = await adminApi.getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to load agents", error);
      setNotification({
        isOpen: true,
        message: t("failed_load_agents"),
        type: "error",
        title: t("loading_error"),
        details: t("please_refresh"),
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter agents
  const filtered = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && a.isEnabled) ||
      (statusFilter === "inactive" && !a.isEnabled);

    return matchesSearch && matchesStatus;
  });

  // Validation function
  const validateForm = (): boolean => {
    if (!form.name || !form.name.trim()) {
      setNotification({
        isOpen: true,
        message: t("agent_name_required"),
        type: "error",
        title: t("validation_error"),
        details: t("enter_valid_agent_name"),
      });
      return false;
    }

    if (!form.code || !form.code.trim()) {
      setNotification({
        isOpen: true,
        message: t("agent_code_required"),
        type: "error",
        title: t("validation_error"),
        details: t("enter_unique_agent_code"),
      });
      return false;
    }

    if (!editingAgent && (!form.api_key || !form.api_key.trim())) {
      setNotification({
        isOpen: true,
        message: t("api_key_required"),
        type: "error",
        title: t("validation_error"),
        details: t("generate_api_key"),
      });
      return false;
    }

    return true;
  };

  // Open Add
  const openAddModal = () => {
    setEditingAgent(null);
    setForm({
      name: "",
      code: "",
      api_key: "",
      isEnabled: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name,
      code: agent.code,
      api_key: agent.api_key || "",
      isEnabled: agent.isEnabled,
    });
    setIsModalOpen(true);
  };

  // Save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingAgent) {
        await adminApi.updateAgent(editingAgent.id, form);
        setNotification({
          isOpen: true,
          message: t("agent_updated"),
          type: "success",
          title: t("update_successful"),
        });
      } else {
        await adminApi.createAgent(form);
        setNotification({
          isOpen: true,
          message: t("agent_created"),
          type: "success",
          title: t("creation_successful"),
        });
      }

      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving agent:", error);
      
      if (error.response?.status === 400) {
        setNotification({
          isOpen: true,
          message: error.response?.data?.message || t("invalid_data"),
          type: "error",
          title: t("validation_failed"),
          details: t("check_fields"),
        });
      } else if (error.response?.status === 409) {
        setNotification({
          isOpen: true,
          message: t("duplicate_agent"),
          type: "error",
          title: t("duplicate_entry"),
          details: t("use_unique_credentials"),
        });
      } else if (error.response?.status === 403) {
        setNotification({
          isOpen: true,
          message: t("permission_denied"),
          type: "error",
          title: t("access_denied"),
          details: t("admin_only_agents"),
        });
      } else if (!navigator.onLine) {
        setNotification({
          isOpen: true,
          message: t("no_internet"),
          type: "error",
          title: t("network_error"),
          details: t("check_connection"),
        });
      } else {
        setNotification({
          isOpen: true,
          message: error.response?.data?.message || t("operation_failed"),
          type: "error",
          title: t("operation_failed"),
          details: t("contact_support"),
        });
      }
    }
  };

  // Toggle status
  const toggleStatus = async (id: string) => {
    try {
      const agent = agents.find((a) => a.id === id);
      if (!agent) return;

      await adminApi.updateAgent(id, {
        ...agent,
        isEnabled: !agent.isEnabled,
      });

      await loadData();
      setNotification({
        isOpen: true,
        message: agent.isEnabled ? t("agent_deactivated") : t("agent_activated"),
        type: "success",
        title: t("status_updated"),
      });
    } catch (error: any) {
      console.error(error);
      setNotification({
        isOpen: true,
        message: t("status_update_failed"),
        type: "error",
        title: t("update_failed"),
        details: error.response?.data?.message || t("try_again_later"),
      });
    }
  };

  // Delete
  const deleteAgent = async (id: string) => {
    if (window.confirm(t("confirm_delete_agent"))) {
      try {
        await adminApi.deleteAgent(id);
        await loadData();
        setNotification({
          isOpen: true,
          message: t("agent_deleted"),
          type: "success",
          title: t("deletion_successful"),
        });
      } catch (error: any) {
        console.error(error);
        setNotification({
          isOpen: true,
          message: t("delete_failed"),
          type: "error",
          title: t("deletion_failed"),
          details: error.response?.data?.message || t("try_again_later"),
        });
      }
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  return (
    <DashboardLayout title={t("manage_agents")} links={adminLinks}>
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            {t("agents_management")}
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            {t("agents_description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white overflow-hidden group active:scale-95 transition-all w-full sm:w-auto justify-center"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
              <span className="hidden sm:inline">{t("add_new_agent")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </span>
          </button>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder={t("search_placeholder_agents")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 py-2.5 md:py-3.5 pl-9 md:pl-12 pr-3 md:pr-4 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/20 shadow-sm transition-all font-medium text-sm text-gray-600 placeholder:text-gray-300"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
        >
          <FunnelIcon className="w-4 h-4 md:w-5 md:h-5" />
          {t("filters")}
          {statusFilter && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {(statusFilter || search) && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2"
          >
            {t("clear_all")}
          </button>
        )}
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl md:rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                {t("status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">{t("all_status")}</option>
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setStatusFilter("")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t("reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT TABLE */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AgentTable
          agents={filtered}
          onEdit={openEditModal}
          onDelete={deleteAgent}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* MODAL - Fully Responsive */}
      <Modal
        isOpen={isModalOpen}
        title={editingAgent ? t("agent_configuration") : t("new_agent_registration")}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-1 sm:p-2">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {editingAgent ? t("edit_agent_details") : t("register_agent")}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {t("fill_agent_details")}
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  {t("agent_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("agent_name_placeholder")}
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  {t("agent_code")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("agent_code_placeholder")}
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                {t("api_key")} {!editingAgent && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                placeholder={t("api_key_placeholder")}
                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-mono text-sm text-gray-700 transition"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                required={!editingAgent}
              />
              <p className="text-xs text-gray-400 ml-1">
                {t("api_key_hint")}
              </p>
            </div>

            {/* Toggle Switch */}
            <div
              className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/50 transition cursor-pointer"
              onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })}
            >
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {t("agent_activation")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("agent_activation_description")}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-xs text-gray-500">
                  {form.isEnabled ? t("active") : t("inactive")}
                </span>
                <input
                  type="checkbox"
                  checked={form.isEnabled}
                  onChange={(e) =>
                    setForm({ ...form, isEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded-md border-none bg-white text-red-500 focus:ring-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            <button
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl md:rounded-2xl transition font-bold text-sm order-2 sm:order-1"
              onClick={() => setIsModalOpen(false)}
            >
              {t("discard")}
            </button>

            <button
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-red-200 transition font-bold text-sm order-1 sm:order-2"
              onClick={handleSave}
            >
              {editingAgent ? t("apply_changes") : t("confirm_registration")}
            </button>
          </div>
        </div>
      </Modal>

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        title={notification.title}
        details={notification.details}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        duration={notification.type === "error" ? 5000 : 3000}
        onRetry={
          notification.type === "error" && 
          notification.title !== t("validation_error") && 
          notification.title !== t("validation_failed")
            ? handleSave 
            : undefined
        }
      />
    </DashboardLayout>
  );
}