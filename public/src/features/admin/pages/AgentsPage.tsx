// src/features/admin/pages/AgentsPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { adminApi} from "../api/admin.api";
import type { Agent  } from "../api/admin.api";
import { adminLinks } from "../adminLinks";
import Modal from "@/shared/components/Modal";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", commission: 0 });

  useEffect(() => {
    const load = async () => {
      const data = await adminApi.getAgents();
      setAgents(data);
    };
    load();
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  const openAddModal = () => {
    setEditingAgent(null);
    setForm({ name: "", phone: "", commission: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({ name: agent.name, phone: agent.phone, commission: agent.commission });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingAgent) {
      setAgents((prev) =>
        prev.map((a) => (a.id === editingAgent.id ? { ...a, ...form } : a))
      );
    } else {
      setAgents((prev) => [
        ...prev,
        { id: Date.now().toString(), status: "active", ...form },
      ]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status:
                a.status === "active"
                  ? "suspended"
                  : a.status === "pending"
                  ? "active"
                  : "active",
            }
          : a
      )
    );
  };

  const deleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DashboardLayout title="Manage Agents" links={adminLinks}>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg w-64"
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          Add Agent
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>Commission (%)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agent) => (
              <tr key={agent.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{agent.name}</td>
                <td>{agent.phone}</td>
                <td>{agent.commission}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      agent.status === "active"
                        ? "bg-green-500"
                        : agent.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openEditModal(agent)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteAgent(agent.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="text-gray-600 hover:underline"
                    onClick={() => toggleStatus(agent.id)}
                  >
                    {agent.status === "active" ? "Disable" : "Enable"}
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
        title={editingAgent ? "Edit Agent" : "Add Agent"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Agent Name"
            className="border p-2 rounded-lg w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="border p-2 rounded-lg w-full"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="number"
            placeholder="Commission"
            className="border p-2 rounded-lg w-full"
            value={form.commission}
            onChange={(e) => setForm({ ...form, commission: parseInt(e.target.value) })}
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