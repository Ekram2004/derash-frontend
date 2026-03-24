// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import BillerTable, { type Biller } from "../components/BillerTable";

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
    setBillers([
      {
        id: "1",
        name: "Ethiopian Electric Utility",
        code: "EEU",
        category: "UTILITY",
        allowsPartial: false,
        isActive: true,
      },
      {
        id: "2",
        name: "Federal Revenue",
        code: "FR",
        category: "TAX",
        allowsPartial: true,
        isActive: false,
      },
    ]);
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
  const handleSave = () => {
    if (editingBiller) {
      setBillers((prev) =>
        prev.map((b) => (b.id === editingBiller.id ? { ...b, ...form } : b))
      );
    } else {
      setBillers((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          isActive: true,
          ...form,
        },
      ]);
    }

    setIsModalOpen(false);
  };

  // Toggle active
  const toggleStatus = (id: string) => {
    setBillers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  // Delete
  const deleteBiller = (id: string) => {
    setBillers((prev) => prev.filter((b) => b.id !== id));
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