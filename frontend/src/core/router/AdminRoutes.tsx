// src/core/router/AdminRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../../features/admin/pages/Dashboard";
import UsersPage from "../../features/admin/pages/UsersPage";
import BillersPage from "../../features/admin/pages/BillersPage";
import AgentsPage from "../../features/admin/pages/AgentsPage";
import ReportsPage from "../../features/admin/pages/ReportsPage";
import SettingsPage from "../../features/admin/pages/SettingsPage"; // ✅ import SettingsPage
import NotificationsPage from "@/features/admin/pages/NotificationsPage";
import RoleGuard from "./RoleGuard"; 


export default function AdminRoutes() {
  return (
    <Route element={<RoleGuard allowedRole="SYSTEM_ADMIN" />}>
      <Route path="users" element={<UsersPage />} />
      <Route path="billers" element={<BillersPage />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  );
}