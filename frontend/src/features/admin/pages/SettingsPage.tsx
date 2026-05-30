// src/features/admin/pages/SettingsPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { LockClosedIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { adminLinks } from "../adminLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import ThemeToggle from "../components/shared/ThemeToggle";
import UserAccountInfoCard from "../components/settings/UserAccountInfoCard";
import AccountSecurityTab from "../components/settings/AccountSecurityTab";
import PreferencesTab from "../components/settings/PreferencesTab";

type TabKey = "account" | "preferences";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const loggedInAdmin = useAuthStore((state) => state.user);

  const tabs = [
    { id: "account" as TabKey, label: t("account_security"), icon: LockClosedIcon },
    { id: "preferences" as TabKey, label: t("preferences"), icon: Cog6ToothIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "account": return <AccountSecurityTab />;
      case "preferences": return <PreferencesTab />;
      default: return <AccountSecurityTab />;
    }
  };

  return (
    <DashboardLayout title={t("settings")} links={adminLinks}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 dark:from-red-400 dark:via-gray-300 dark:to-red-400 bg-clip-text text-transparent">
              {t("settings")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("settings_description")}</p>
          </div>
          <ThemeToggle />
        </div>

        <UserAccountInfoCard user={loggedInAdmin} />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Mobile dropdown */}
          <div className="lg:hidden p-4 border-b bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}