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
      <div className="min-h-[70vh] flex justify-center items-start pt-16 px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-5">
          
          <h2 className="text-2xl font-bold text-center text-red-600">
            WELCOME TO DERASH
          </h2>
          <h3 className="text-xl font-semibold text-center text-gray-700">
            Log In
          </h3>

          {apiError && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
              {apiError}
            </div>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full border rounded p-2.5 outline-none focus:ring-2 ${
                fieldErrors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-red-400"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full border rounded p-2.5 outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-red-400"
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁"}
            </button>

            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full rounded-lg py-2.5 font-semibold text-white ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Links */}
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
    </PublicLayout>
  );
}