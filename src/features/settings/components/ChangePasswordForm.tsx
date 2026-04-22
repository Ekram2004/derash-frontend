// src/features/settings/components/ChangePasswordForm.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function ChangePasswordForm() {
  const user = useAuthStore((state) => state.user);
  const userId = (user as any)?.id;

  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: "Weak", color: "red" };
    if (score <= 4) return { score, label: "Medium", color: "yellow" };
    return { score, label: "Strong", color: "green" };
  };

  const passwordStrength = calculatePasswordStrength(form.newPassword);

  // Real-time validation
  const validateField = (field: keyof FormState, value: string) => {
    switch (field) {
      case "currentPassword":
        if (!value) return "Current password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      
      case "newPassword":
        if (!value) return "New password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Must include at least 1 uppercase letter";
        if (!/[a-z]/.test(value)) return "Must include at least 1 lowercase letter";
        if (!/[0-9]/.test(value)) return "Must include at least 1 number";
        if (value === form.currentPassword) return "New password must be different from current";
        return "";
      
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== form.newPassword) return "Passwords do not match";
        return "";
      
      default:
        return "";
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    setSuccess("");
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    newErrors.currentPassword = validateField("currentPassword", form.currentPassword);
    newErrors.newPassword = validateField("newPassword", form.newPassword);
    newErrors.confirmPassword = validateField("confirmPassword", form.confirmPassword);
    
    setErrors(newErrors);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess("");

    // Simulate API call - Replace with actual API
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success (90% success rate for demo)
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error("Current password is incorrect"));
          }
        }, 1500);
      });

      setSuccess("Password updated successfully! Your password has been changed.");
      
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      
    } catch (error: any) {
      setErrors({
        currentPassword: error.message === "Current password is incorrect" 
          ? "Current password is incorrect" 
          : "Failed to update password. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setSuccess("");
    setTouched({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const getPasswordRequirements = () => {
    const requirements = [
      { text: "At least 8 characters long", met: form.newPassword.length >= 8 },
      { text: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(form.newPassword) },
      { text: "Contains lowercase letter (a-z)", met: /[a-z]/.test(form.newPassword) },
      { text: "Contains number (0-9)", met: /[0-9]/.test(form.newPassword) },
      { text: "Different from current password", met: form.newPassword !== form.currentPassword && form.newPassword !== "" },
    ];
    return requirements;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Security Settings
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Change your account password to keep your account secure
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Error Alert */}
          <AnimatePresence>
            {Object.keys(errors).length > 0 && !success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                      Please fix the following errors:
                    </p>
                    <ul className="mt-1 text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Alert */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 md:mb-6 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                      Success!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {success}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Inputs */}
          <div className="space-y-4 md:space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show.current ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  onBlur={() => handleBlur("currentPassword")}
                  className={`w-full pl-9 pr-10 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    touched.currentPassword && errors.currentPassword
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.current ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.currentPassword && errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show.new ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  onBlur={() => handleBlur("newPassword")}
                  className={`w-full pl-9 pr-10 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    touched.newPassword && errors.newPassword
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, new: !p.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.new ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        className={`h-full bg-${passwordStrength.color}-500`}
                      />
                    </div>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Password requirements:
                    </p>
                    {getPasswordRequirements().map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {req.met ? (
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={`text-xs ${req.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-500"}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {touched.newPassword && errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show.confirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full pl-9 pr-10 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.confirm ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Security Tip */}
          <div className="mt-4 md:mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <ShieldCheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Security Tip:</strong> Use a strong, unique password that you don't use on other websites. 
                Consider using a password manager to generate and store complex passwords.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-2.5 md:py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition font-semibold text-sm disabled:opacity-50"
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}