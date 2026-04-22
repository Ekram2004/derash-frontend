// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
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
  const [billers, setBillers] = useState<Biller[]>([]);
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
  });

  const loadData = async () => {
    try {
      const data = await adminApi.getBillers();
      setBillers(data);
    } catch (error) {
      console.error("Failed to load billers", error);
      setNotification({
        isOpen: true,
        message: "Failed to load billers data",
        type: "error",
        title: "Loading Error",
        details: "Please refresh the page and try again",
      });
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

  // Validation function
  const validateForm = (): boolean => {
    if (!form.name || !form.name.trim()) {
      setNotification({
        isOpen: true,
        message: "Biller name is required",
        type: "error",
        title: "Validation Error",
        details: "Please enter the biller's legal name",
      });
      return false;
    }

    if (!form.code || !form.code.trim()) {
      setNotification({
        isOpen: true,
        message: "Service code is required",
        type: "error",
        title: "Validation Error",
        details: "Please enter a unique service code for this biller",
      });
      return false;
    }

    if (!form.category) {
      setNotification({
        isOpen: true,
        message: "Category is required",
        type: "error",
        title: "Validation Error",
        details: "Please select a category for this biller",
      });
      return false;
    }

    return true;
  };

  const openAddModal = () => {
    setEditingBiller(null);
    setForm({ name: "", code: "", category: "", allowsPartial: false });
    setIsModalOpen(true);
  };

  const openEditModal = (biller: Biller) => {
    setEditingBiller(biller);
    setForm({
      name: biller.name,
      code: biller.code,
      category: biller.category,
      allowsPartial: biller.allowsPartial,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      if (editingBiller) {
        await adminApi.updateBiller(editingBiller.id, form);
        setNotification({
          isOpen: true,
          message: "Biller updated successfully!",
          type: "success",
          title: "Update Successful",
        });
      } else {
        await adminApi.createBiller(form);
        setNotification({
          isOpen: true,
          message: "Biller created successfully!",
          type: "success",
          title: "Creation Successful",
        });
      }
      
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving biller:", error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        setNotification({
          isOpen: true,
          message: error.response?.data?.message || "Invalid data provided",
          type: "error",
          title: "Validation Failed",
          details: "Please check all fields and try again",
        });
      } else if (error.response?.status === 409) {
        setNotification({
          isOpen: true,
          message: "Biller code already exists",
          type: "error",
          title: "Duplicate Entry",
          details: "Please use a unique service code for this biller",
        });
      } else if (error.response?.status === 403) {
        setNotification({
          isOpen: true,
          message: "You don't have permission to perform this action",
          type: "error",
          title: "Access Denied",
          details: "Only administrators can manage billers",
        });
      } else if (!navigator.onLine) {
        setNotification({
          isOpen: true,
          message: "No internet connection",
          type: "error",
          title: "Network Error",
          details: "Please check your internet connection and try again",
        });
      } else {
        setNotification({
          isOpen: true,
          message: error.response?.data?.message || "Operation failed. Please try again.",
          type: "error",
          title: "Operation Failed",
          details: "An unexpected error occurred. Please contact support if the issue persists.",
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
        message: `Biller ${!biller.isActive ? "activated" : "deactivated"} successfully.`,
        type: "success",
        title: "Status Updated",
      });
    } catch (error: any) {
      console.error("Error toggling status:", error);
      setNotification({
        isOpen: true,
        message: "Failed to update biller status",
        type: "error",
        title: "Update Failed",
        details: error.response?.data?.message || "Please try again later",
      });
    }
  };

  const deleteBiller = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this billing entity? This action cannot be undone.")) {
      try {
        await adminApi.deleteBiller(id);
        await loadData();
        setNotification({
          isOpen: true,
          message: "Biller removed from system successfully.",
          type: "success",
          title: "Deletion Successful",
        });
      } catch (error: any) {
        console.error("Error deleting biller:", error);
        setNotification({
          isOpen: true,
          message: "Failed to delete biller",
          type: "error",
          title: "Deletion Failed",
          details: error.response?.data?.message || "Please try again later",
        });
      }
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  return (
    <DashboardLayout title="manage biller" links={adminLinks}>
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-900 bg-clip-text text-transparent">
            Billers Management
          </h1>
          <p className="text-sm text-gray-400 mt-1 md:mt-2 font-medium leading-relaxed">
            Monitor and manage integrated service providers. Toggle partial
            payment permissions and categorize entities for the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 
            md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-white 
            overflow-hidden group active:scale-95 transition-all w-full sm:w-auto
             justify-center"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 opacity-90 group-hover:opacity-100 transition"></span>
            <span className="absolute -inset-1 bg-gradient-to-r from-red-600 via-gray-700 to-red-900 blur-xl opacity-40 group-hover:opacity-70 transition"></span>
            <span className="relative flex items-center gap-2">
              <PlusIcon className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
              <span className="hidden sm:inline">Add New Biller</span>
              <span className="sm:hidden">Add</span>
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
            placeholder="Search by name, code or category..."
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
          Filters
          {(categoryFilter || statusFilter) && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {(categoryFilter || statusFilter || search) && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl md:rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">All Categories</option>
                <option value="UTILITY">Utility Services</option>
                <option value="EDUCATION">Educational Institution</option>
                <option value="GOVERNMENT">Government Agency</option>
                <option value="OTHER">Other Services</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <BillerTable
          billers={filtered}
          onEdit={openEditModal}
          onDelete={deleteBiller}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* Creation/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingBiller ? "Entity Configuration" : "New Registration"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-1 sm:p-2">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {editingBiller ? "Edit Biller Details" : "Register Biller"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Fill in the technical and descriptive details below.
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ethiopian Electric Utility"
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Service Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. EEU-01"
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Classification <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-2.5 md:py-3 px-3 md:px-4 font-semibold text-sm text-gray-700 transition"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="UTILITY">Utility Services</option>
                <option value="EDUCATION">Educational Institution</option>
                <option value="GOVERNMENT">Government Agency</option>
                <option value="OTHER">Other Services</option>
              </select>
            </div>

            <div
              className="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/50 transition cursor-pointer"
              onClick={() => setForm({ ...form, allowsPartial: !form.allowsPartial })}
            >
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Partial Payment Protocol
                </p>
                <p className="text-xs text-gray-400">
                  Allow users to settle fractions of their total balance.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {form.allowsPartial ? "Enabled" : "Disabled"}
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
              Discard
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-red-200 transition font-bold text-sm order-1 sm:order-2"
              onClick={handleSave}
            >
              {editingBiller ? "Apply Changes" : "Confirm Registration"}
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
          notification.title !== "Validation Error" && 
          notification.title !== "Validation Failed"
            ? handleSave 
            : undefined
        }
      />
    </DashboardLayout>
  );
}