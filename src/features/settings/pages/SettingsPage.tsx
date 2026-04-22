// src/features/settings/pages/SettingsPage.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ProfileTab from "../components/ProfileTab";
import AccountTab from "../components/AccountTab";
import PreferencesTab from "../components/PreferencesTab";

import { adminLinks } from "../../admin/adminLinks";
import { agentLinks } from "../../agent/agentLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { billerLinks } from "@/features/biller/billerLinks";

type TabKey = "security" | "profile" | "account" | "preferences";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  color: string;
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabKey>("security");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Apply theme on mount and when changed
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme: "light" | "dark" | "system") => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (selectedTheme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    localStorage.setItem("theme", selectedTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = () => {
    if (theme === "light") return <SunIcon className="w-4 h-4" />;
    if (theme === "dark") return <MoonIcon className="w-4 h-4" />;
    return <ComputerDesktopIcon className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  const getLinks = () => {
    if (user?.role === "ADMIN") return adminLinks;
    if (user?.role === "AGENT") return agentLinks;
    if (user?.role === "BILLER") return billerLinks;
    return adminLinks;
  };

  const tabs: TabConfig[] = [
    { 
      key: "security", 
      label: "Security", 
      icon: ShieldCheckIcon,
      description: "Manage your password and security settings",
      color: "red"
    },
    { 
      key: "profile", 
      label: "Profile", 
      icon: UserCircleIcon,
      description: "Update your personal information",
      color: "blue"
    },
    { 
      key: "account", 
      label: "Account", 
      icon: Cog6ToothIcon,
      description: "Manage account settings and preferences",
      color: "purple"
    },
    { 
      key: "preferences", 
      label: "Preferences", 
      icon: PaintBrushIcon,
      description: "Customize your experience",
      color: "green"
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case "security":
        return <ChangePasswordForm />;
      case "profile":
        return <ProfileTab user={user} />;
      case "account":
        return <AccountTab user={user} />;
      case "preferences":
        return <PreferencesTab />;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <DashboardLayout title="Settings" links={getLinks()}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-800 dark:via-red-700 dark:to-rose-800">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                    Settings
                  </h1>
                  <p className="text-base md:text-lg text-white/90 max-w-2xl">
                    Manage your account preferences, security settings, and personal information
                  </p>
                </div>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-200 text-white text-sm font-medium border border-white/20"
                >
                  {getThemeIcon()}
                  <span>{getThemeLabel()} Mode</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          
          {/* Settings Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Mobile Tab Selector */}
            <div className="lg:hidden p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Select Section
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabKey)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      group relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${activeTab === tab.key
                        ? `text-${tab.color}-600 dark:text-${tab.color}-400`
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${
                      activeTab === tab.key
                        ? `text-${tab.color}-600 dark:text-${tab.color}-400`
                        : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                    }`} />
                    <span>{tab.label}</span>
                    
                    {/* Active Indicator */}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600 dark:bg-${tab.color}-400`}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab Header (Mobile) */}
                    <div className="lg:hidden mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <ShieldCheckIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Security
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your password and security settings
                      </p>
                    </div>
                    <ChangePasswordForm />
                  </motion.div>
                )}

                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab Header (Mobile) */}
                    <div className="lg:hidden mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <UserCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Profile
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Update your personal information
                      </p>
                    </div>
                    <ProfileTab user={user} />
                  </motion.div>
                )}

                {activeTab === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab Header (Mobile) */}
                    <div className="lg:hidden mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <Cog6ToothIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Account
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage account settings and preferences
                      </p>
                    </div>
                    <AccountTab user={user} />
                  </motion.div>
                )}

                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab Header (Mobile) */}
                    <div className="lg:hidden mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <PaintBrushIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Preferences
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customize your experience
                      </p>
                    </div>
                    <PreferencesTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Help & Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Need Help?
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Contact support or check our documentation for assistance
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Documentation
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  Contact Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}