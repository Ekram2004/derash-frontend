// src/features/admin/pages/AgentsPage.tsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import Modal from "../../../shared/components/Modal";
import SuccessModal from "@/shared/components/SuccessModal";
import AgentTable from "../components/AgentTable";
import { adminApi } from "../api/admin.api";
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

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

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    }
  };

  useEffect(() => {
    loadData();
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
        setSuccessMessage("Agent updated successfully!");
      } else {
        await adminApi.createAgent(form);
        setSuccessMessage("Agent created successfully!");
      }

      await loadData();
      setIsModalOpen(false);
      setSuccessOpen(true);
    } catch (error: any) {
      console.error("Error saving agent:", error);
      setSuccessMessage(
        error.response?.data?.message || "Operation failed."
      );
      setSuccessOpen(true);
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
      setSuccessMessage("Status updated successfully.");
      setSuccessOpen(true);
    } catch (error) {
      console.error(error);
      setSuccessMessage("Failed to update status.");
      setSuccessOpen(true);
    }
  };

  // Delete
  const deleteAgent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await adminApi.deleteAgent(id);
        await loadData();
        setSuccessMessage("Agent removed from system.");
        setSuccessOpen(true);
      } catch (error) {
        console.error(error);
        setSuccessMessage("Deletion failed.");
        setSuccessOpen(true);
      }
    }
  };

  return (
    <DashboardLayout title="Manage Agents" links={adminLinks}>
      
      {/* HEADER (same as BillersPage) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Agents{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400">
              Directory
            </span>
          </h1>

          <p className="text-gray-400 mt-2 font-medium leading-relaxed">
            Manage system agents, API integrations, and access control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 font-bold text-sm"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            Add New Agent
          </button>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/20 shadow-sm transition-all font-medium text-gray-600 placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AgentTable
          agents={filtered}
          onEdit={openEditModal}
          onDelete={deleteAgent}
          onToggleStatus={toggleStatus}
        />
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        title={editingAgent ? "Agent Configuration" : "New Agent Registration"}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-2">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingAgent ? "Edit Agent Details" : "Register Agent"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Fill in the technical and identification details below.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <input
                type="text"
                placeholder="Agent Name"
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="text"
                placeholder="Agent Code"
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <input
              type="text"
              placeholder="API Key"
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-semibold text-gray-700"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            />

            {/* Toggle */}
            <div
              className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer"
              onClick={() =>
                setForm({ ...form, isEnabled: !form.isEnabled })
              }
            >
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Agent Activation
                </p>
                <p className="text-xs text-gray-400">
                  Enable or disable agent access.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) =>
                  setForm({ ...form, isEnabled: e.target.checked })
                }
                className="w-5 h-5"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </button>

            <button
              className="flex-[2] px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-2xl shadow-lg font-bold text-sm"
              onClick={handleSave}
            >
              {editingAgent ? "Apply Changes" : "Confirm Registration"}
            </button>
          </div>
        </div>
      </Modal>

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </DashboardLayout>
  );
}