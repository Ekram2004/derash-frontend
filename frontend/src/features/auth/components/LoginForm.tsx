// src/features/auth/components/LoginForm.tsx
"use client";
import { useState } from "react";
import { loginApi } from "../../auth/api/auth.api";
console.log("LoginForm rendered");

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("FORM SUBMITTED");

    try {
      const res = await loginApi({ email, password });
      console.log(res);
      if (res.status?.toUpperCase() === "SUCCESS" && res.data?.token) {
        localStorage.setItem("token", res.data.token);

        // Save user info if you want
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect based on role
        switch (res.data.user.role) {
          case "SYSTEM_ADMIN":
            window.location.href = "/admin/dashboard";
            break;
          case "BILLER_USER":
            window.location.href = "/biller/dashboard";
            break;
          case "AGENT_USER":
            window.location.href = "/agent/dashboard";
            break;
          default:
            window.location.href = "/";
        }
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <div className="mb-4">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
