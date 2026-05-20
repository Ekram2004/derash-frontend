// src/features/auth/pages/ChangePasswordPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { changePasswordApi } from "../api/auth.api";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export default function ChangePasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tempToken = location.state?.tempToken || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changePasswordApi({ newPassword, token: tempToken });
      navigate("/login?changed=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex justify-center items-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-red-600 mb-6">Change Your Password</h2>
          <p className="text-gray-600 text-center mb-6">You must set a new password before accessing the system.</p>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
          <div className="space-y-4">
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full border rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full border rounded-xl p-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                {showPassword ? "Hide" : "Show"} password
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Changing..." : "Change Password"}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}