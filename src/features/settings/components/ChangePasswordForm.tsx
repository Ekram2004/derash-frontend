import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import ChangePasswordForm from "../components/ChangePasswordForm";

export default function SettingsPage() {
  return (
    <DashboardLayout title={"setting"} links={[]}  >
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Password Section */}
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  );
}