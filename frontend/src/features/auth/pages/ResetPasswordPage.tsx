import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, KeyIcon } from "@heroicons/react/24/solid";
import { resetPasswordApi } from "../api/auth.api";
import PublicLayout from "../../../shared/components/layout/PublicLayout";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirm: "" });

  useEffect(() => {
    if (!token) {
      setApiError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const validateFields = () => {
    let isValid = true;
    const errors = { password: "", confirm: "" };

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirm = "Passwords do not match";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!validateFields()) return;

    setLoading(true);
    setApiError("");
    try {
      await resetPasswordApi(token, password);
      navigate("/login?reset=true");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to reset password. Token may be expired or invalid.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PublicLayout>
        <div className="min-h-[80vh] flex justify-center items-center py-16 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">The password reset link is missing or invalid. Please request a new one.</p>
            <Link to="/forgot-password" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
              Request New Link
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex justify-center items-center py-16 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-8 py-6 text-center">
              <h2 className="text-2xl font-bold text-white">Create New Password</h2>
              <div className="w-12 h-0.5 bg-white/30 mx-auto mt-2 rounded-full" />
              <p className="text-white/80 text-sm mt-3">Enter your new password below</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg"
                  >
                    <p className="text-red-700 text-sm font-medium">{apiError}</p>
                  </motion.div>
                )}

                {/* New Password */}
                <motion.div variants={fadeInUp} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <LockClosedIcon className="w-4 h-4 text-red-600" /> New Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full border-2 rounded-xl p-3 pl-11 pr-12 outline-none transition-all duration-200 ${
                        fieldErrors.password ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-red-400"
                      }`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                    />
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-sm">{fieldErrors.password}</p>}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={fadeInUp} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full border-2 rounded-xl p-3 pl-11 outline-none transition-all duration-200 ${
                        fieldErrors.confirm ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-red-400"
                      }`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, confirm: "" }));
                      }}
                    />
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {fieldErrors.confirm && <p className="text-red-500 text-sm">{fieldErrors.confirm}</p>}
                </motion.div>

                <motion.button
                  variants={fadeInUp}
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl py-3 font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading ? "bg-red-300 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </motion.button>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}