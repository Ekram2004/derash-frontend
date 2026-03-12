import { Routes, Route } from "react-router-dom";
import Dashboard from "@/features/biller/pages/Dashboard";
import BillsPage from "@/features/biller/pages/BillsPage";
import ReportsPage from "@/features/biller/pages/ReportsPage";
import UploadBillsPage from "@/features/biller/pages/UploadBillsPage";

export default function BillerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bills" element={<BillsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/upload" element={<UploadBillsPage />} />
    </Routes>
  );
}