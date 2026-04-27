// src/core/router/AdminRoutes.tsx

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/shared/components/common/ProtectedRoute";

import Dashboard from "../../features/admin/pages/Dashboard";
import UsersPage from "../../features/admin/pages/UsersPage";
import AgentsPage from "../../features/admin/pages/AgentsPage";
import BillersPage from "../../features/admin/pages/BillersPage";
import ReportsPage from "../../features/admin/pages/ReportsPage";
import SettingsPage from "../../features/admin/pages/SettingsPage";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* ✅ Protected wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="billers" element={<BillersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}