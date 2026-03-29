import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import PublicLayout from "../../../shared/components/layout/PublicLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ Add state for show/hide password
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
        const token = res.data.token;
        const user = res.data.user;

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
      <div className="min-h-[70vh] flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center text-red-600">
            WELCOME TO DERASH
          </h2>
          <h2 className="text-2xl font-bold text-center text-red-600">
            Log In
          </h2>

          {apiError && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
              {apiError}
            </div>
          )}

 
          <div className="space-y-4">

          <div className="space-y-3">
            {/* Email input */}
            <div>
              <input
                type="email"
                className={`w-full border rounded p-2.5 outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-red-400"
                }`}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

 
           <div>

            {/* Password input with show/hide */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full border rounded p-2.5 outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-red-400"
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
              />
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7a11.24 11.24 0 0 1 2.76-4.14" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.5 1 12c1.73 4.5 6 7.5 11 7.5s9.27-3 11-7.5c-1.73-4.5-6-7.5-11-7.5z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>

              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              className={`w-full rounded-lg py-2.5 font-semibold text-white ${
                loading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Forgot your password?{" "}
            <a href="/forgot-password" className="text-red-600 hover:underline">
              Reset here
            </a>
          </p>

          <p className="text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a href="/register" className="text-red-600 hover:underline">
              Sign up
            </a>
          </p>
            </div>
            </div>
          </div>
          </div>
    </PublicLayout>
  );
}

