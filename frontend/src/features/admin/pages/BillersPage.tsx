// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "@/shared/components/Modal";
import NotificationModal from "@/shared/components/NotificationModal";
import BillerTable, { type Biller } from "../components/BillerTable";
import { adminApi } from "../api/admin.api";
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  details?: string;
}

export default function BillersPage() {
  const { t } = useTranslation();
  const [billers, setBillers] = useState<Biller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiller, setEditingBiller] = useState<Biller | null>(null);
  
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
    category: "",
    allowsPartial: false,
    isActive: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBillers();
      const billersArray = Array.isArray(data) ? data : [];
      setBillers(billersArray);
    } catch (error) {
      console.error("Failed to load billers", error);
      setBillers([]);
      setNotification({
        isOpen: true,
        message: t("failed_load_billers"),
        type: "error",
        title: t("loading_error"),
        details: t("please_refresh"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = billers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !categoryFilter || b.category === categoryFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && b.isActive) ||
      (statusFilter === "inactive" && !b.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const validateForm = (): boolean => {
    if (!form.name || !form.name.trim()) {
      setNotification({
        isOpen: true,
        message: t("name_required"),
        type: "error",
        title: t("validation_error"),
        details: t("enter_legal_name"),
      });
      return false;
    }

    if (!form.code || !form.code.trim()) {
      setNotification({
        isOpen: true,
        message: t("code_required"),
        type: "error",
        title: t("validation_error"),
        details: t("enter_unique_code"),
      });
      return false;
    }

    if (!form.category) {
      setNotification({
        isOpen: true,
        message: t("category_required"),
        type: "error",
        title: t("validation_error"),
        details: t("select_category"),
      });
      return false;
    }

    return true;
  };

  const openAddModal = () => {
    setEditingBiller(null);
    setForm({
      name: "",
      code: "",
      category: "",
      allowsPartial: false,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (biller: Biller) => {
    setEditingBiller(biller);
    setForm({
      name: biller.name,
      code: biller.code,
      category: biller.category,
      allowsPartial: biller.allowsPartial,
      isActive: biller.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingBiller) {
        await adminApi.updateBiller(editingBiller.id, form);
        setNotification({
          isOpen: true,
          message: t("biller_updated"),
          type: "success",
          title: t("update_successful"),
        });
      } else {
        await adminApi.createBiller(form);
        setNotification({
          isOpen: true,
          message: t("biller_created"),
          type: "success",
          title: t("creation_successful"),
        });
      }
      
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving biller:", error);
      
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
          message: t("duplicate_code"),
          type: "error",
          title: t("duplicate_entry"),
          details: t("use_unique_code"),
        });
      } else if (error.response?.status === 403) {
        setNotification({
          isOpen: true,
          message: t("permission_denied"),
          type: "error",
          title: t("access_denied"),
          details: t("admin_only"),
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

  const toggleStatus = async (id: string) => {
    try {
      const biller = billers.find((b) => b.id === id);
      if (!biller) return;
      
      await adminApi.updateBiller(id, { isActive: !biller.isActive });
      await loadData();
      
      setNotification({
        isOpen: true,
        message: t(biller.isActive ? "biller_deactivated" : "biller_activated"),
        type: "success",
        title: t("status_updated"),
      });
    } catch (error: any) {
      console.error("Error toggling status:", error);
      setNotification({
        isOpen: true,
        message: t("status_update_failed"),
        type: "error",
        title: t("update_failed"),
        details: error.response?.data?.message || t("try_again_later"),
      });
    }
  };

  const deleteBiller = async (id: string) => {
    if (window.confirm(t("confirm_delete"))) {
      try {
        await adminApi.deleteBiller(id);
        await loadData();
        setNotification({
          isOpen: true,
          message: t("biller_deleted"),
          type: "success",
          title: t("deletion_successful"),
        });
      } catch (error: any) {
        console.error("Error deleting biller:", error);
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
    setCategoryFilter("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <DashboardLayout title={t("manage_billers")} links={adminLinks}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-3">{t("loading_billers")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("manage_billers")} links={adminLinks}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            {t("billers_management")}
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            {t("billers_description")}
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
              <span className="hidden sm:inline">{t("add_new_biller")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <MagnifyingGlassIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder={t("search_placeholder")}
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
          {(categoryFilter || statusFilter) && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {(categoryFilter || statusFilter || search) && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2"
          >
            {t("clear_all")}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl md:rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                {t("category")}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">{t("all_categories")}</option>
                <option value="UTILITY">{t("utility")}</option>
                <option value="EDUCATION">{t("education")}</option>
                <option value="GOVERNMENT">{t("government")}</option>
                <option value="OTHER">{t("other")}</option>
              </select>
            </div>

            <div>
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
          </div>
        </div>
      )}

      {/* Biller Table */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <BillerTable
          billers={filtered}
          onEdit={openEditModal}
          onDelete={deleteBiller}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingBiller ? t("entity_configuration") : t("new_registration")}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-1 sm:p-2">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {editingBiller ? t("edit_biller_details") : t("register_biller")}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {t("fill_details")}
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  {t("legal_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("legal_name_placeholder")}
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  {t("service_code")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("service_code_placeholder")}
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                {t("classification")} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="" disabled>{t("select_category")}</option>
                <option value="UTILITY">{t("utility")}</option>
                <option value="EDUCATION">{t("education")}</option>
                <option value="GOVERNMENT">{t("government")}</option>
                <option value="OTHER">{t("other")}</option>
              </select>
            </div>

            <div
              className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/50 transition cursor-pointer"
              onClick={() => setForm({ ...form, allowsPartial: !form.allowsPartial })}
            >
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {t("partial_payment_protocol")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("partial_payment_description")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {form.allowsPartial ? t("enabled") : t("disabled")}
                </span>
                <input
                  type="checkbox"
                  checked={form.allowsPartial}
                  onChange={(e) => setForm({ ...form, allowsPartial: e.target.checked })}
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
              {editingBiller ? t("apply_changes") : t("confirm_registration")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification Modal */}
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