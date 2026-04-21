import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ProfileTab from "../components/ProfileTab";
import AccountTab from "../components/AccountTab";
import PreferencesTab from "../components/PreferencesTab";
import TabButton from "../components/tabs/TabButton";

import { adminLinks } from "../../admin/adminLinks";
import { agentLinks } from "../../agent/agentLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { billerLinks } from "@/features/biller/billerLinks";

type TabKey = "security" | "profile" | "account" | "preferences";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<TabKey>("security");
  const [darkMode, setDarkMode] = useState(false);

  const getLinks = () => {
    if (user?.role === "ADMIN") return adminLinks;
    if (user?.role === "AGENT") return agentLinks;
    if (user?.role === "BILLER") return billerLinks;
    return adminLinks;
  };

  const tabs = [
    { key: "security", label: "Security" },
    { key: "profile", label: "Profile" },
    { key: "account", label: "Account" },
    { key: "preferences", label: "Preferences" },
  ] as const;

  return (
    <DashboardLayout title="Settings" links={getLinks()}>

      <div className={`${darkMode ? "dark bg-gray-900" : ""} min-h-screen flex flex-col items-center p-6`}>

        {/* HEADER */}
        <div className="w-full max-w-5xl mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your DERASH account settings
          </p>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm"
          >
            Toggle {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>

        {/* CARD */}
        <div className="w-full max-w-5xl bg-white dark:bg-gray-800 border rounded-2xl shadow-sm">

          {/* TABS */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>

          {/* CONTENT */}
          <div className="p-8">

            <AnimatePresence mode="wait">

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ChangePasswordForm />
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ProfileTab user={user} />
                </motion.div>
              )}

              {activeTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AccountTab user={user} />
                </motion.div>
              )}

              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <PreferencesTab />
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}