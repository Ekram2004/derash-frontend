// src/features/admin/api/admin.api.ts
import api from "../../../services/api";
import axios from "axios";

// ========== INTERFACES ==========
export interface User {
  billerId: string;
  agentId: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "active" | "disabled";
}

export interface Agent {
  id: string;
  name: string;
  code: string;
  api_key?: string;
  isEnabled: boolean;
}

export interface Biller {
  id: string;
  name: string;
  code?: string;
  category?: string;
  allowsPartial?: boolean;
  isActive: boolean;
}

export interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalBillers: number;
  totalTransactions: number;
  totalRevenue: number;
}

export interface ReportData {
  name: string;
  totalTransactions: number;
  totalRevenue: number;
}

export interface Transaction {
  id: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
  biller: string;
  agent: string;
}

export interface TrendData {
  labels: string[];
  values: number[];
}

export interface PaymentMethods {
  mobile: number;
  internet: number;
  agent: number;
  bank: number;
}

export interface TopBiller {
  name: string;
  transactions: number;
  revenue: number;
}

export interface FullReportData {
  transactions: Transaction[];
  totalUsers: number;
  totalBillers: number;
  totalAgents: number;
  totalRevenue: number;
}

// Detailed transaction interface (for getDetailedReport)
export interface DetailedTransaction {
  transactionId: string;
  total_amount: number;
  agent_share: number;
  aggregator_share: number;
  status: string;
  payment_method: string;
  createdAt: string;
  bill: {
    customer: { full_name: string };
    biller: { name: string };
    remaining_bal: number;
  };
  agent: { name: string };
}

export interface DetailedReportResponse {
  report: {
    transactions: DetailedTransaction[];
  };
}

// ========== API METHODS ==========
export const adminApi = {
  // ---------- User endpoints ----------
  // GET /admin/user – returns all users
  getUsers: async () => {
    const response = await api.get("/admin/user");
    return response.data.data;
  },

  // POST /admin/users – create user
  createUser: async (userData: any) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },

  // PUT /admin/users/:id – update user
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // DELETE /admin/users/:id – delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // PATCH /admin/users/:id/toggle-status – toggle user status
  toggleStatus: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // ---------- Stats ----------
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },

  // ---------- Biller endpoints (backed by biller.routes.ts) ----------
  getBillers: async () => {
    const response = await api.get("/billers");
    const responseData = response.data.data;
    return Array.isArray(responseData) ? responseData : (responseData?.items || []);
  },

  createBiller: async (data: any) => {
    const response = await api.post("/billers", data);
    return response.data;
  },

  updateBiller: async (id: string, data: any) => {
    const response = await api.put(`/billers/${id}`, data);
    return response.data;
  },

  deleteBiller: async (id: string) => {
    const response = await api.delete(`/billers/${id}`);
    return response.data;
  },

  // ---------- Agent endpoints (backed by agent.routes.ts) ----------
  getAgents: async () => {
    const response = await api.get("/agents");
    const responseData = response.data.data;
    return Array.isArray(responseData) ? responseData : (responseData?.items || []);
  },

  createAgent: async (data: any) => {
    const response = await api.post("/agents", data);
    return response.data;
  },

  updateAgent: async (id: string, data: any) => {
    const payload = {
      name: data.name,
      code: data.code,
      isEnabled: data.isEnabled,
    };
    const response = await api.put(`/agents/${id}`, payload);
    return response.data;
  },

  deleteAgent: async (id: string) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  // ---------- Current user ----------
  getCurrentUser: async () => {
    const res = await axios.get("/auth/me", {
      withCredentials: true,
    });
    return res.data.data;
  },

  // ---------- Dashboard methods ----------
  getRecentTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get("/admin/transactions/recent");
    return response.data.data;
  },

  getTransactionTrends: async (): Promise<TrendData> => {
    const response = await api.get("/admin/stats/trends");
    return response.data.data;
  },

  getPaymentMethods: async (): Promise<PaymentMethods> => {
    const response = await api.get("/admin/stats/payment-methods");
    return response.data.data;
  },

  getTopBillers: async (): Promise<TopBiller[]> => {
    const response = await api.get("/admin/stats/top-billers");
    return response.data.data;
  },

  // ---------- Global Report endpoint ----------
  // Backend route: GET /global-report inside adminRoutes (prefixed with /admin)
  getReportData: async (params?: { fromDate?: string; toDate?: string }): Promise<FullReportData> => {
    const response = await api.get("/admin/global-report", { params });
    const payload = response.data.data || response.data;
    return {
      transactions: payload.transactions || [],
      totalUsers: payload.totalUsers || 0,
      totalBillers: payload.totalBillers || 0,
      totalAgents: payload.totalAgents || 0,
      totalRevenue: payload.totalRevenue || 0,
    };
  },

  // ---------- Detailed Report endpoint (NEW) ----------
  // Expected backend route: GET /admin/reports/detailed
  // Query parameters: fromDate, toDate, agent_id, biller_id
  getDetailedReport: async (params?: {
    fromDate?: string;
    toDate?: string;
    agent_id?: string;
    biller_id?: string;
  }): Promise<DetailedReportResponse> => {
    const response = await api.get("/admin/reports/detailed", { params });
    // Assuming backend returns { status: "SUCCESS", data: DetailedReportResponse }
    return response.data.data;
  },
};