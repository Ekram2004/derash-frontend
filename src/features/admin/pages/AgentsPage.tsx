// src/features/admin/pages/AgentsPage.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import { adminApi } from "../api/admin.api";

// Agent type
interface Agent {
  id: string;
  name: string;
  code: string;
  api_key?: string;
  isEnabled: boolean;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    api_key: "",
    isEnabled: true,
  });

  // Load agents
  const loadAgents = async () => {
    try {
      const data = await adminApi.getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to load agents", error);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Filter
  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase())
  );

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
    try {
      if (editingAgent) {
        await adminApi.updateAgent(editingAgent.id, form);
      } else {
        await adminApi.createAgent(form);
      }

      await loadAgents();
      setIsModalOpen(false);
      alert("Agent saved successfully!");
    } catch (error: any) {
      console.error("Error saving agent:", error);
      alert(error.response?.data?.message || "Failed to save agent.");
    }
  };

  // Toggle status (FIXED like biller logic)
  const toggleStatus = async (id: string) => {
    try {
      const agent = agents.find((a) => a.id === id);
      if (!agent) return;

      await adminApi.updateAgent(id, {
        ...agent,
        isEnabled: !agent.isEnabled,
      });

      await loadAgents();
      alert("Agent status updated!");
    } catch (error: any) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  // Delete
  const deleteAgent = async (id: string) => {
    if (window.confirm("Delete this agent?")) {
      try {
        await adminApi.deleteAgent(id);
        await loadAgents();
        alert("Agent deleted successfully!");
      } catch (error: any) {
        console.error(error);
        alert("Failed to delete agent");
      }
    }
  };

  return (
    <DashboardLayout title="Manage Agents" links={adminLinks}>
      
      {/* HEADER (same style as biller page) */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 space-y-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Agents <span className="text-red-500">Management</span>
          </h1>

          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Manage system agents, API integrations, and access control.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full md:w-1/3"
          />

          {/* Button */}
          <button
            onClick={openAddModal}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            + Add Agent
          </button>
        </div>
      </div>

      {/* TABLE (same professional style as biller) */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">API Key</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((agent) => (
              <tr key={agent.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{agent.name}</td>
                <td className="p-3">{agent.code}</td>
                <td className="p-3">
                  {agent.api_key || "-"}
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                      agent.isEnabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {agent.isEnabled ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => openEditModal(agent)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => toggleStatus(agent.id)}
                    className="text-gray-600 hover:underline"
                  >
                    {agent.isEnabled ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        title={editingAgent ? "Edit Agent" : "Add Agent"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Agent Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Agent Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="API Key"
            value={form.api_key}
            onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) =>
                setForm({ ...form, isEnabled: e.target.checked })
              }
            />
            <label>Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-red-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}