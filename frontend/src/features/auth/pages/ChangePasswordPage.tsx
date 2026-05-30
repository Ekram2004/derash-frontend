// src/features/auth/pages/ChangePasswordPage.tsx
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { changePasswordApi } from "../api/auth.api";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

// Generate a strong random password
const generateStrongPassword = (): string => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+";
  const all = lower + upper + digits + special;
  let password = "";
  // Ensure at least one of each required type
  password += lower[Math.floor(Math.random() * lower.length)];
  password += upper[Math.floor(Math.random() * upper.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];
  // Fill to at least 12 characters
  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Password strength calculation
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const normalized = Math.min(Math.floor(score / 1.5), 4);
  if (normalized <= 1) return { score: normalized, label: "Weak", color: "bg-red-500" };
  if (normalized === 2) return { score: normalized, label: "Fair", color: "bg-orange-500" };
  if (normalized === 3) return { score: normalized, label: "Good", color: "bg-yellow-500" };
  return { score: normalized, label: "Strong", color: "bg-green-500" };
};

const checkRequirement = (password: string, type: string): boolean => {
  switch (type) {
    case "length": return password.length >= 8;
    case "uppercase": return /[A-Z]/.test(password);
    case "lowercase": return /[a-z]/.test(password);
    case "number": return /[0-9]/.test(password);
    case "special": return /[^A-Za-z0-9]/.test(password);
    default: return false;
  }
};

export default function ChangePasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tempToken = location.state?.tempToken || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  
  const requirements = [
    { label: "At least 8 characters", type: "length" },
    { label: "At least one uppercase letter", type: "uppercase" },
    { label: "At least one lowercase letter", type: "lowercase" },
    { label: "At least one number", type: "number" },
    { label: "At least one special character (!@#$%^&*)", type: "special" },
  ];

  const allRequirementsMet = requirements.every(req => checkRequirement(newPassword, req.type));
  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = allRequirementsMet && passwordsMatch && newPassword.length > 0;

  const handleGenerate = () => {
    const strong = generateStrongPassword();
    setNewPassword(strong);
    setConfirmPassword(strong);
  };

  const handleSubmit = async () => {
    setError("");
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }
    if (!passwordsMatch) {
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
          <h2 className="text-2xl font-bold text-center text-red-600 mb-2">Change Your Password</h2>
          <p className="text-gray-600 text-center text-sm mb-6">Set a strong password to secure your account</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <XCircleIcon className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full border rounded-xl p-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      strength.label === "Weak" ? "text-red-600" :
                      strength.label === "Fair" ? "text-orange-600" :
                      strength.label === "Good" ? "text-yellow-600" : "text-green-600"
                    }`}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${strength.color} h-1.5 rounded-full transition-all duration-300`}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full border rounded-xl p-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Generate Strong Password Button */}
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2"
            >
              🔒 Generate Strong Password
            </button>

            {/* Requirements Checklist */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password requirements</p>
              {requirements.map((req) => {
                const met = checkRequirement(newPassword, req.type);
                return (
                  <div key={req.type} className="flex items-center gap-2">
                    {met ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <XCircleIcon className="w-4 h-4 text-gray-400" />}
                    <span className={`text-xs ${met ? "text-gray-700" : "text-gray-500"}`}>{req.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
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