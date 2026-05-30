// src/core/router/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppProvider from "../providers/AppProvider"; 
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import AgentRoutes from "./AgentRoutes";
import BillerRoutes from "./BillerRoutes";

import LoginPage from "../../features/auth/pages/LoginPage";
import ChangePasswordPage from "../../features/auth/pages/ChangePasswordPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";   // ✅ new
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";     // ✅ new

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />    {/* ✅ new */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />      {/* ✅ new */}

          {/* Role‑based protected routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/agent/*" element={<AgentRoutes />} />
          <Route path="/biller/*" element={<BillerRoutes />} />

          {/* Fallback public routes (like landing pages) */}
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}