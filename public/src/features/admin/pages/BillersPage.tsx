// src/features/admin/pages/BillersPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { adminApi } from "../api/admin.api";
import type { Biller } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import Modal from "@/shared/components/Modal";
import * as XLSX from "xlsx";

export default function BillersPage() {
  const [billers, setBillers] = useState<Biller[]>([]);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiller, setEditingBiller] = useState<Biller | null>(null);
  const [form, setForm] = useState({ name: "", serviceType: "" });

  useEffect(() => {
    const load = async () => {
      const data = await adminApi.getBillers();
      setBillers(data);
    };
    load();
  }, []);

  const filtered = billers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceType.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBiller(null);
    setForm({ name: "", serviceType: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (biller: Biller) => {
    setEditingBiller(biller);
    setForm({ name: biller.name, serviceType: biller.serviceType });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingBiller) {
      setBillers((prev) =>
        prev.map((b) =>
          b.id === editingBiller.id ? { ...b, ...form } : b
        )
      );
    } else {
      setBillers((prev) => [
        ...prev,
        { id: Date.now().toString(), status: "active", ...form },
      ]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setBillers((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "disabled" : "active" }
          : b
      )
    );
  };

  const deleteBiller = (id: string) => {
    setBillers((prev) => prev.filter((b) => b.id !== id));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(billers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Billers");
    XLSX.writeFile(wb, "billers.xlsx");
  };

  return (
    <DashboardLayout title="Manage Billers" links={adminLinks}>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search billers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg w-64"
        />
        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={exportToExcel}
          >
            Export Excel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={openAddModal}
          >
            Add Biller
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th>Service Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((biller) => (
              <tr key={biller.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{biller.name}</td>
                <td>{biller.serviceType}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      biller.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {biller.status}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openEditModal(biller)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteBiller(biller.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="text-gray-600 hover:underline"
                    onClick={() => toggleStatus(biller.id)}
                  >
                    {biller.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            className="border p-2 rounded-lg w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Service Type"
            className="border p-2 rounded-lg w-full"
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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