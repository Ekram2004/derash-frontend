// derash-frontend/src/core/router/BillerRoutes.tsx

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/shared/components/common/ProtectedRoute";


import Dashboard from "../../features/biller/pages/Dashboard";
import BillsPage from "../../features/biller/pages/BillsPage";
import ReportsPage from "../../features/biller/pages/ReportsPage";
import UploadBillsPage from "../../features/biller/pages/UploadBillsPage";
import SettingsPage from "../../features/biller/pages/SettingsPage";

export default function BillerRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bills" element={<BillsPage />} />
        <Route path="upload" element={<UploadBillsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}