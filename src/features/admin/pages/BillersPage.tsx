// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import SuccessModal from "@/shared/components/SuccessModal";
import BillerTable, { type Biller } from "../components/BillerTable";
import { adminApi } from "../api/admin.api";

export default function BillersPage() {
  const [billers, setBillers] = useState<Biller[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiller, setEditingBiller] = useState<Biller | null>(null);

   const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
   
  

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    allowsPartial: false,
    isActive: true
    
  });

  const loadData = async () => {
    try {
      const data = await adminApi.getBillers();
      setBillers(data);
    } catch (error) {
      console.error("Failed to load billers", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = billers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBiller(null);
    setForm({
      name: "",
      code: "",
      category: "",
      allowsPartial: false,
      isActive:true
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
    try {
      if (editingBiller) {
        await adminApi.updateBiller(editingBiller.id, form);
      } else {
        await adminApi.createBiller(form);
      }

      const freshData = await adminApi.getBillers();
      setBillers(freshData);
      setIsModalOpen(false);
      setSuccessMessage("Biller saved successfully!");
     setSuccessOpen(true);
    } catch (error: any) {
      console.error("Error saving biller:", error);
      setSuccessMessage(error.response?.data?.message || "Failed to save biller.");
      setSuccessOpen(true);
    }
  };

  const toggleStatus = async (id: string) => {
  try {
    const billerToToggle = billers.find((b) => b.id === id);
    if (!billerToToggle) return;

    await adminApi.updateBiller(id, {
      isActive: !billerToToggle.isActive,
    });

    await loadData();

    setSuccessMessage("Biller status updated successfully!");
    setSuccessOpen(true);
  } catch (error: any) {
    console.error("Error toggling status:", error);
    setSuccessMessage(
      error.response?.data?.message || "Failed to update status"
    );
    setSuccessOpen(true);
  }
};
  const deleteBiller = async (id: string) => {
    if (window.confirm("Delete this Biller organization?")) {
      try {
        await adminApi.deleteBiller(id);

        const freshBillersList = await adminApi.getBillers();
        setBillers(freshBillersList);
        setSuccessMessage("Biller deleted successfully!");
        setSuccessOpen(true);
      } catch (error: any) {
        console.error("Error deleting biller:", error);
        setSuccessMessage(error.response?.data?.message || "Failed to delete biller.");
        setSuccessOpen(true);
      }
    }
  };

  return (
    <DashboardLayout title="Manage Billers" links={adminLinks}>
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 space-y-5">
        
        {/* Title + Description */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Billers <span className="text-red-500">Management</span>
          </h1>

          <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Centralized biller management system for creating, updating, and organizing billers.
            Monitor status, categorize services, and maintain structured control over billing entities
            to ensure smooth operations.
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Search */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search billers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 px-4 py-2 rounded-lg outline-none transition"
            />
          </div>

          {/* Button */}
          <div className="flex justify-end">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition font-medium"
              onClick={openAddModal}
            >
              + Add Biller
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-4">
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
  title={editingBiller ? "Edit Biller" : "Add Biller"}
  onClose={() => setIsModalOpen(false)}
>
  <div className="space-y-6">

    {/* Header */}
    <div className="border-b pb-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {editingBiller ? "Update Biller Details" : "Create New Biller"}
      </h2>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
        {editingBiller
          ? "Modify the selected biller information and save changes."
          : "Enter the required details to register a new biller in the system."}
      </p>
    </div>

    {/* Form Card */}
    <div className="bg-gray-50 border rounded-xl p-5 space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Biller Name
          </label>
          <input
            type="text"
            placeholder="Enter biller name"
            className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2.5 rounded-lg outline-none transition shadow-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Code */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Code
          </label>
          <input
            type="text"
            placeholder="e.g. EEU"
            className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2.5 rounded-lg outline-none transition shadow-sm"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>

        {/* Category */}
<div className="flex flex-col gap-1 md:col-span-2">
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    Category
  </label>

  <select
    className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2.5 rounded-lg outline-none transition shadow-sm"
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
  >
    <option value="" disabled>
      Select category
    </option>
    <option value="UTILITY">utility</option>
  <option value="EDUCATION">education</option>
  <option value="GOVERNMENT">government</option>
  <option value="OTHER">other</option>
  </select>
</div>
        {/* Checkbox Section */}
        <div className="md:col-span-2 flex items-center justify-between bg-white border rounded-lg px-4 py-3 shadow-sm">

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.allowsPartial}
              onChange={(e) =>
                setForm({ ...form, allowsPartial: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600"
            />

            <div>
              <p className="text-sm font-medium text-gray-800">
                Allow Partial Payments
              </p>
              <p className="text-xs text-gray-500">
                Enable users to pay bills partially
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-3 pt-4 border-t">

      <button
        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>

      <button
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition font-semibold"
        onClick={handleSave}
      >
        {editingBiller ? "Update Biller" : "Save Biller"}
      </button>

    </div>

  </div>
</Modal>
{/* ✅ Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />


      

    </DashboardLayout>
  );
}