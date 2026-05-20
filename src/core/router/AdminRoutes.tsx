// src/core/router/AdminRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../../features/admin/pages/Dashboard";
import UsersPage from "../../features/admin/pages/UsersPage";
import BillersPage from "../../features/admin/pages/BillersPage";
import AgentsPage from "../../features/admin/pages/AgentsPage";
import ReportsPage from "../../features/admin/pages/ReportsPage";
import SettingsPage from "../../features/admin/pages/SettingsPage"; // ✅ import SettingsPage

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="billers" element={<BillersPage />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="settings" element={<SettingsPage />} /> // ✅ add settings route
    </Routes>
  );
}