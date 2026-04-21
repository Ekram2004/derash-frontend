// src/features/settings/components/ChangePasswordForm.tsx

import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordForm() {
  const user = useAuthStore((state) => state.user);

  // ✅ SAFE FIX (no store change, no backend needed)
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.currentPassword) return "Current password is required";

    if (form.newPassword.length < 8)
      return "Password must be at least 8 characters";

    if (!/[A-Z]/.test(form.newPassword))
      return "Must include at least 1 uppercase letter";

    if (!/[0-9]/.test(form.newPassword))
      return "Must include at least 1 number";

    if (form.newPassword !== form.confirmPassword)
      return "Passwords do not match";

    if (form.newPassword === form.currentPassword)
      return "New password must be different";

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);

    // ✅ FRONTEND MOCK ONLY (NO BACKEND REQUIRED)
    setTimeout(() => {
      console.log("DERASH PASSWORD CHANGE (MOCK):", {
        userId,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setLoading(false);
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border  rounded-3xl shadow-sm p-8 w-full max-w-xl"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-50 p-2 rounded-xl">
          <ShieldCheckIcon className="w-5 h-5 text-red-500" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Security Settings
          </h2>
          <p className="text-gray-400 text-xs">
            Change your account password
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">
          {success}
        </div>
      )}

      {/* INPUTS */}
      <div className="space-y-4">

        <PasswordInput
          label="Current Password"
          value={form.currentPassword}
          show={show.current}
          onToggle={() =>
            setShow((p) => ({ ...p, current: !p.current }))
          }
          onChange={(v: string) => handleChange("currentPassword", v)}
        />

        <PasswordInput
          label="New Password"
          value={form.newPassword}
          show={show.new}
          onToggle={() =>
            setShow((p) => ({ ...p, new: !p.new }))
          }
          onChange={(v: string) => handleChange("newPassword", v)}
        />

        <PasswordInput
          label="Confirm Password"
          value={form.confirmPassword}
          show={show.confirm}
          onToggle={() =>
            setShow((p) => ({ ...p, confirm: !p.confirm }))
          }
          onChange={(v: string) => handleChange("confirmPassword", v)}
        />
      </div>

      {/* HINT */}
      <div className="mt-4 text-xs text-gray-400">
        Must be 8+ characters, include uppercase letters and numbers.
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={() => {
            setForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setError("");
            setSuccess("");
          }}
          className="flex-1 px-5 py-3 bg-gray-100 rounded-xl font-semibold text-gray-600"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex-[2] px-5 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- PASSWORD INPUT ---------------- */

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}: any) {
  return (
    <div className="relative">
      <label className="text-xs text-gray-500">{label}</label>

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-gray-50 rounded-xl py-3 px-4 pr-10 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-9 text-gray-400"
      >
        {show ? (
          <EyeSlashIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}