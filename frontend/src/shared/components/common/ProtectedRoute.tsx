// src/shared/components/common/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

// Updated ProtectedRoute with Role Support
interface Props {
  allowedRoles?: ("SYSTEM_ADMIN" | "AGENT_USER" | "BILLER_USER")[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role as any)) {
    // Logged in but wrong role? Send them to their specific home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}