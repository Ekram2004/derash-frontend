// src/core/router/AgentRoutes.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/shared/components/common/ProtectedRoute";

// Agent Pages
import Dashboard from "../../features/agent/pages/Dashboard";
import PayBill from "@/features/agent/pages/PayBill";
import Transactions from "@/features/agent/pages/Transactions";
import Reports from "@/features/agent/pages/Reports";
import SettingsPage from "../../features/settings/pages/SettingsPage";

export default function AgentRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pay-bill" element={<PayBill />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        {/*<Route path="settings" element={<SettingsPage />} />*/}
      </Route>
    </Routes>
  );
}

    
