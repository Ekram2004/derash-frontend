import { Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "@/features/admin/pages/Dashboard";
import UsersPage from "@/features/admin/pages/UsersPage";
import AgentsPage from "@/features/admin/pages/AgentsPage";
import BillersPage from "@/features/admin/pages/BillersPage";
import ReportsPage from "@/features/admin/pages/ReportsPage";


export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="billers" element={<BillersPage />} />
      <Route path="reports" element={<ReportsPage />} />
      
    </Routes>
  );
}