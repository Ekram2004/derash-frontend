import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useState } from "react";

export default function PasswordAlert() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const [open, setOpen] = useState(true);

  if (!user?.mustChangePassword || !open) return null;

  const handleRedirect = () => {
    const base = location.pathname.split("/")[1];

    // 🔴 close popup
    setOpen(false);

    if (base === "admin") {
      navigate("/admin/settings");
    } else if (base === "agent") {
      navigate("/agent/settings");
    } else if (base === "biller") {
      navigate("/biller/settings");
    } else {
      navigate("/admin/settings");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 text-center space-y-4">

        <h2 className="text-xl font-bold text-gray-800">
          Security Alert
        </h2>

        <p className="text-sm text-gray-600">
          You must change your password before continuing.
        </p>

        <button
          onClick={handleRedirect}
          className="w-full bg-red-600 text-white py-2.5 rounded-xl"
        >
          Change Password Now
        </button>
      </div>
    </div>
  );
}