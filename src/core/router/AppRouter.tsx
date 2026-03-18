import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import AgentRoutes from "./AgentRoutes";
import BillerRoutes from "./BillerRoutes";
import LoginPage from "../.././features/auth/pages/LoginPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/agent/*" element={<AgentRoutes />} />
        <Route path="/biller/*" element={<BillerRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}