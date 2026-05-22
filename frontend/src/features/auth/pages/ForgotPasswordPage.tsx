import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { forgotPasswordApi } from "../api/auth.api";
import PublicLayout from "../../../shared/components/layout/PublicLayout";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setApiError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await forgotPasswordApi(email);
      setSubmitted(true);
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-8 py-6 text-center">
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <div className="w-12 h-0.5 bg-white/30 mx-auto mt-2 rounded-full" />
              <p className="text-white/80 text-sm mt-3">We'll send you a link to reset your password</p>
            </div>

            <div className="p-8 space-y-6">
              {!submitted ? (
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

                  <motion.div variants={fadeInUp} className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-red-600" /> Email Address
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full border-2 rounded-xl p-3 pl-11 outline-none transition-all duration-200 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>

                  <motion.button
                    variants={fadeInUp}
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-xl py-3 font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      loading
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </motion.button>

                  <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold">
                      <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Check your email</h3>
                  <p className="text-gray-600">
                    If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                  </p>
                  <Link to="/login" className="inline-block mt-4 text-red-600 font-semibold hover:underline">
                    Return to Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}