// src/core/router/AgentRoutes.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/shared/components/common/ProtectedRoute";

// Agent Pages
import Dashboard from "../../features/agent/pages/Dashboard";
import PayBill from "@/features/agent/pages/PayBill";

import Reports from "@/features/agent/pages/Reports";
console.log("Dashboard component is mounting");

export default function AgentRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pay-bill" element={<PayBill />} />
        
        <Route path="reports" element={<Reports />} />
        {/*<Route path="settings" element={<SettingsPage />} />*/}
      </Route>
    </Routes>
  );
}

    
