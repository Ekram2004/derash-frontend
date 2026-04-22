import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { loginApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import PublicLayout from "../../../shared/components/layout/PublicLayout";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import derashLogo from "../../../assets/images.jpg";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    setApiError("");
    if (!validateFields()) return;

    setLoading(true);
    try {
      const res = await loginApi({ email, password });

      if (res.status === "SUCCESS") {
        const { token, user } = res.data;

        localStorage.setItem("token", token);
        login(user);

        switch (user.role) {
          case "SYSTEM_ADMIN":
            navigate("/admin/dashboard");
            break;
          case "AGENT_USER":
            navigate("/agent/dashboard");
            break;
          case "BILLER_USER":
            navigate("/biller/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        setApiError(res.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setApiError("Invalid credentials or network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex justify-center items-center py-16 px-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
            <svg
              className="w-full h-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <motion.div
            variants={fadeInScale}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header with Gradient and Logo */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-8 py-6 text-center relative overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full translate-y-16 -translate-x-16"
              />
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                {/* Logo Section */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                      <img 
                        src={derashLogo} 
                        alt="DERASH Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -inset-1 bg-white/20 rounded-2xl blur-md -z-10"></div>
                  </motion.div>
                </div>
                
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  WELCOME TO DERASH
                </h2>
                <div className="w-12 h-0.5 bg-white/30 mx-auto mt-2 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white/90 mt-3">
                  Log In to Your Account
                </h3>
              </motion.div>
            </div>

            {/* Form Body */}
            <div className="p-8 space-y-6">
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <p className="text-red-700 text-sm font-medium">
                      {apiError}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-red-600" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full border-2 rounded-xl p-3 pl-11 outline-none transition-all duration-200 ${
                      fieldErrors.email
                        ? "border-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                  />
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                </div>
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {fieldErrors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4 text-red-600" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full border-2 rounded-xl p-3 pl-11 pr-12 outline-none transition-all duration-200 ${
                      fieldErrors.password
                        ? "border-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                  />
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {fieldErrors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Login Button */}
              <motion.div variants={fadeInUp}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={loading}
                  className={`w-full rounded-xl py-3 font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>

  

              {/* Links */}
              <motion.div variants={fadeInUp} className="space-y-3 text-center">
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <a
                    href="/forgot-password"
                    className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-all"
                  >
                    Reset here
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">
                Secure login • Your data is protected
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}