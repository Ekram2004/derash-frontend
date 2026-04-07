import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import ChangePasswordForm from "../components/ChangePasswordForm";

import { adminLinks } from "../../admin/adminLinks";
import { agentLinks } from "../../agent/agentLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  const getLinks = () => {
    if (user?.role === "ADMIN") return adminLinks;
    if (user?.role === "AGENT") return agentLinks;
    return [];
  };

  return (
    <DashboardLayout title="Settings" links={getLinks()}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  );
}