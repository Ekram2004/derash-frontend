// src/features/admin/api/admin.api.ts
import api from "../../../services/api";

// ---------- Interfaces ----------
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

export interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BILL_UPLOADED" | string;
  isRead: boolean;
  createdAt: string;
}

// ✅ Fixed: match backend response – customerName is a direct property of bill
export interface DetailedTransaction {
  transactionId: string;
  totalAmount: number;
  agentShare: number;
  aggregatorShare: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  bill: {
    customerName?: string;           // ✅ direct field from backend
    biller: { name: string };
    remainingBalance: number;
  };
  agent: { name: string };
}

export interface FullReportData {
  transactions: DetailedTransaction[];
  totalUsers: number;
  totalBillers: number;
  totalAgents: number;
  totalRevenue: number;
}

export interface DashboardData {
  stats: Stats;
  trends: TrendData;
  paymentMethods: PaymentMethods;
  topBillers: TopBiller[];
  recentTransactions: Transaction[];
}

export const adminApi = {
  // ---------- User endpoints ----------
  getUsers: async () => {
    const response = await api.get("/admin/user");
    return response.data.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // ---------- Stats ----------
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },

  // ---------- Biller endpoints ----------
  getBillers: async () => {
    const response = await api.get("/billers");
    return response.data.data || [];
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

  // ---------- Agent endpoints ----------
  getAgents: async () => {
    const response = await api.get("/agents");
    return response.data.data || [];
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
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  // ---------- Global Report (full transaction list) ----------
  getReportData: async (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<FullReportData> => {
    const response = await api.get("/admin/global-report", { params });
    const payload = response.data.data || response.data;
    const reportData = payload.report || payload;
    return {
      transactions: reportData.transactions || [],
      totalUsers: reportData.total_users ?? payload.totalUsers ?? 0,
      totalBillers: reportData.total_billers ?? payload.totalBillers ?? 0,
      totalAgents: reportData.total_agents ?? payload.totalAgents ?? 0,
      totalRevenue: reportData.total_collected ?? payload.totalRevenue ?? 0,
    };
  },

  // ---------- Aggregated Dashboard Data ----------
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get("/admin/dashboard-data");
    return response.data.data;
  },

  getNotifications: async (): Promise<AdminNotification[]> => {
    const response = await api.get("/admin/notifications");
    return response.data;
  },
  markNotificationAsRead: async (id: string) => {
    const response = await api.patch(`/admin/notifications/${id}/read`)
    return response.data;
  }
};