// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import SuccessModal from "@/shared/components/SuccessModal";
import BillerTable, { type Biller } from "../components/BillerTable";
import { adminApi } from "../api/admin.api";
import { MagnifyingGlassIcon, PlusIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

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
    try {
      if (editingBiller) {
        await adminApi.updateBiller(editingBiller.id, form);
      } else {
        await adminApi.createBiller(form);
      }
      await loadData();
      setIsModalOpen(false);
      setSuccessMessage(editingBiller ? "Biller updated successfully!" : "Biller created successfully!");
      setSuccessOpen(true);
    } catch (error: any) {
      setSuccessMessage(error.response?.data?.message || "Operation failed.");
      setSuccessOpen(true);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const biller = billers.find((b) => b.id === id);
      if (!biller) return;
      await adminApi.updateBiller(id, { isActive: !biller.isActive });
      await loadData();
      setSuccessMessage("Status synchronized successfully.");
      setSuccessOpen(true);
    } catch (error: any) {
      setSuccessMessage("Failed to update status.");
      setSuccessOpen(true);
    }
  };

  const deleteBiller = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this billing entity?")) {
      try {
        await adminApi.deleteBiller(id);
        await loadData();
        setSuccessMessage("Biller removed from system.");
        setSuccessOpen(true);
      } catch (error: any) {
        setSuccessMessage("Deletion failed.");
        setSuccessOpen(true);
      }
    }
  };

  return (
    <DashboardLayout title="manage biller" links={adminLinks}>
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
        
            
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Billers <span className="text-transparent bg-clip-text 
            bg-gradient-to-r from-red-600 to-rose-400">Directory</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Monitor and manage integrated service providers. Toggle partial
             payment permissions and categorize entities for the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 font-bold text-sm"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            Add New Biller
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 
          -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500
           transition-colors" />
          <input
            type="text"
            placeholder="Filter by name, code or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 shadow-sm transition-all font-medium text-gray-600 placeholder:text-gray-300"
          />
        </div>
        
      </div>

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
        title={editingBiller ? "Entity Configuration" : "New  Registration"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBiller ? "Edit Biller Details" : "Register Biller"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Fill in the technical and descriptive details below.</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ethiopian Electric Utility"
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-3 px-4 font-semibold text-gray-700 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold 
                text-gray-400 uppercase tracking-widest ml-1">Service Code</label>
                <input
                  type="text"
                  placeholder="e.g. EEU-01"
                  className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-3 px-4 font-semibold text-gray-700 transition"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Classification</label>
              <select
                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 py-3 px-4 font-semibold text-gray-700 transition"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="" disabled>Select Category</option>
                <option value="UTILITY">Utility Services</option>
                <option value="EDUCATION">Educational Institution</option>
                <option value="GOVERNMENT">Government Agency</option>
                <option value="OTHER">Other Services</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-100/50 transition cursor-pointer" onClick={() => setForm({ ...form, allowsPartial: !form.allowsPartial })}>
              <div>
                <p className="text-sm font-bold text-gray-800">Partial Payment Protocol</p>
                <p className="text-xs text-gray-400">Allow users to settle fractions of their total balance.</p>
              </div>
              <input
                type="checkbox"
                checked={form.allowsPartial}
                onChange={(e) => setForm({ ...form, allowsPartial: e.target.checked })}
                className="w-5 h-5 rounded-md border-none bg-white text-red-500 focus:ring-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition font-bold text-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </button>
            <button
              className="flex-[2] px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-2xl shadow-lg shadow-red-200 transition font-bold text-sm"
              onClick={handleSave}
            >
              {editingBiller ? "Apply Changes" : "Confirm Registration"}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </DashboardLayout>
  );
}