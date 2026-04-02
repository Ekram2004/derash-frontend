// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import BillerTable, { type Biller } from "../components/BillerTable";
import { adminApi } from "../api/admin.api";

export default function BillersPage() {
  const [billers, setBillers] = useState<Biller[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiller, setEditingBiller] = useState<Biller | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    allowsPartial: false,
  });

  // Mock initial data
  useEffect(() => {
    const load = async () => {
      const data = await adminApi.getBillers();
      setBillers(data);
    };
    load();
  }, []);

  // Filtered billers
  const filtered = billers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  // Open Add
  const openAddModal = () => {
    setEditingBiller(null);
    setForm({
      name: "",
      code: "",
      category: "",
      allowsPartial: false,
    });
    setIsModalOpen(true);
  };

  // Open Edit
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

  // Save
  const handleSave = async() => {
    try {
      if (editingBiller) {
        await adminApi.updateBiller(editingBiller.id, form);
      } else {
        await adminApi.createBiller(form);
      }

      const freshData = await adminApi.getBillers();
      setBillers(freshData);
      setIsModalOpen(false);
      alert("Biller saved successfully!");
    } catch (error: any) {
      console.error("Error saving biller:", error);
      alert(error.response?.data?.message || "Failed to save biller.");
    }
  };

  // Toggle active
  const toggleStatus = (id: string) => {
    setBillers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  // Delete
  const deleteBiller = async (id: string) => {
    if (window.confirm("Delete this Biller organization?")) {
      try {
        await adminApi.deleteBiller(id); // This deletes from the DB

        // 🚀 THE FIX: Refresh the list after deleting
        const freshBillersList = await adminApi.getBillers();
        setBillers(freshBillersList);
        alert("Biller deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting biller:", error);
        alert(error.response?.data?.message || "Failed to delete biller.");
      }
    }
  };
  return (
    <DashboardLayout title="Manage Billers" links={adminLinks}>
      {/* Top Bar */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search billers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg w-64"
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          onClick={openAddModal}
        >
          Add Biller
        </button>
      </div>

      {/* Table */}
      <BillerTable
        billers={filtered}
        onEdit={openEditModal}
        onDelete={deleteBiller}
        onToggleStatus={toggleStatus}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingBiller ? "Edit Biller" : "Add Biller"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Biller Name"
            className="border p-2 rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Code (e.g. EEU)"
            className="border p-2 rounded-lg"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            className="border p-2 rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowsPartial}
              onChange={(e) =>
                setForm({ ...form, allowsPartial: e.target.checked })
              }
            />
            Allows Partial Payment
          </label>

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}