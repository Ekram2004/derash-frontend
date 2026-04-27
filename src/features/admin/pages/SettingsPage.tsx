// src/features/admin/pages/SettingsPage.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cog6ToothIcon, ServerIcon, PuzzlePieceIcon, LockClosedIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import ThemeToggle from "../components/shared/ThemeToggle";
import UserAccountInfoCard from "../components/settings/UserAccountInfoCard";
import GeneralTab from "../components/settings/GeneralTab";
import SystemTab from "../components/settings/SystemTab";
import IntegrationsTab from "../components/settings/IntegrationsTab";
import SecurityTab from "../components/settings/SecurityTab";
import AuditLogTab from "../components/settings/AuditLogTab";

type TabKey = "general" | "system" | "integrations" | "security" | "audit";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const loggedInAdmin = useAuthStore((state) => state.user);

  const tabs = [
    { id: "general" as TabKey, label: "General", icon: Cog6ToothIcon, description: "Platform-wide settings" },
    { id: "system" as TabKey, label: "System", icon: ServerIcon, description: "Security & authentication" },
    { id: "integrations" as TabKey, label: "Integrations", icon: PuzzlePieceIcon, description: "Bank & payment gateways" },
    { id: "security" as TabKey, label: "Security", icon: LockClosedIcon, description: "Your account & IP whitelist" },
    { id: "audit" as TabKey, label: "Audit Logs", icon: DocumentTextIcon, description: "System activities" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "general": return <GeneralTab />;
      case "system": return <SystemTab />;
      case "integrations": return <IntegrationsTab />;
      case "security": return <SecurityTab />;
      case "audit": return <AuditLogTab />;
      default: return <GeneralTab />;
    }
  };

  return (
    <DashboardLayout title="Admin Settings" links={adminLinks}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">Admin Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {loggedInAdmin?.name || "Administrator"}! Configure platform settings</p>
          </div>
          <ThemeToggle />
        </div>

        <UserAccountInfoCard user={loggedInAdmin} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:hidden p-4 border-b bg-gray-50">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as TabKey)} className="w-full px-4 py-2 border rounded-lg">
              {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
          </div>

          <div className="hidden lg:flex border-b overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? "text-red-600 border-b-2 border-red-500" : "text-gray-600 hover:text-gray-900"}`}>
                  <Icon className="w-5 h-5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block px-6 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-gray-500">{tabs.find(t => t.id === activeTab)?.description}</p>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}