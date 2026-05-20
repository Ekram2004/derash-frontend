// src/shared/components/common/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  // 🔒 Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Render nested routes
  return <Outlet />;
}