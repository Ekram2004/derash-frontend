// src/features/biller/pages/SettingsPage.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BuildingOfficeIcon, CreditCardIcon, KeyIcon, ShieldCheckIcon, BellIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { billerLinks } from "../billerLinks";
import api from "@/services/api";
import ThemeToggle from "../components/settings/ThemeToggle";
import UserAccountInfoCard from "../components/settings/UserAccountInfoCard";
import ProfileTab from "../components/settings/ProfileTab";
import BillingTab from "../components/settings/BillingTab";
import ApiTab from "../components/settings/ApiTab";
import SecurityTab from "../components/settings/SecurityTab";
import NotificationsTab from "../components/settings/NotificationsTab";

type TabKey = "profile" | "billing" | "api" | "security" | "notifications";

export default function BillerSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const authUser = useAuthStore((state) => state.user);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        if (response.data.status === "SUCCESS") setUserDetails(response.data.data);
        else setUserDetails(authUser);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setUserDetails(authUser);
      } finally { setLoading(false); }
    };
    if (authUser) fetchUserDetails();
    else setLoading(false);
  }, [authUser]);

  const tabs = [
    { id: "profile" as TabKey, label: "Business Profile", icon: BuildingOfficeIcon },
    { id: "billing" as TabKey, label: "Billing", icon: CreditCardIcon },
    { id: "api" as TabKey, label: "API Settings", icon: KeyIcon },
    { id: "security" as TabKey, label: "Security", icon: ShieldCheckIcon },
    { id: "notifications" as TabKey, label: "Notifications", icon: BellIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab user={userDetails} onUpdate={() => {}} />;
      case "billing": return <BillingTab />;
      case "api": return <ApiTab />;
      case "security": return <SecurityTab />;
      case "notifications": return <NotificationsTab />;
      default: return <ProfileTab user={userDetails} onUpdate={() => {}} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Biller Settings" links={billerLinks}>
        <div className="flex items-center justify-center h-64"><div className="text-center"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-3 text-gray-500">Loading your account information...</p></div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Biller Settings" links={billerLinks}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">Biller Settings</h1><p className="text-sm text-gray-500 mt-1">Manage your business profile, billing, API keys, and security</p></div>
          <ThemeToggle />
        </div>

        <UserAccountInfoCard user={authUser} userDetails={userDetails} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:hidden p-4 border-b bg-gray-50">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as TabKey)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
              {tabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
          </div>

          <div className="hidden lg:flex border-b overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? "text-red-600 border-b-2 border-red-500" : "text-gray-600 hover:text-gray-900"}`}><Icon className="w-5 h-5" />{tab.label}</button>);
            })}
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