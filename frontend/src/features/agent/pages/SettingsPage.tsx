import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { agentLinks } from "../agentLinks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import api from "@/services/api";
import { Eye, EyeOff, Copy, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [agent, setAgent] = useState<any>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await api.get("/agent/me", {
          headers: { "x-agent-code": user?.agent?.code },
        });
        setAgent(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.agent) fetchAgent();
  }, [user]);

  const handleCopyApiKey = () => {
    if (agent?.apiKey) {
      navigator.clipboard.writeText(agent.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied!");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // ✅ Use the correct endpoint for voluntary password change
      await api.post("/auth/update-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings" links={agentLinks}>
      <div className="max-w-4xl mx-auto space-y-8 p-4">
        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Agent Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Agent Name:</span>
              <span>{agent?.name || user?.agent?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Agent Code:</span>
              <span className="font-mono">{agent?.code || user?.agent?.code || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">API Key:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {showApiKey ? agent?.apiKey : "••••••••••••••••"}
                </code>
                <button onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={handleCopyApiKey} className="text-blue-600">
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            {message && <p className="text-red-500 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}