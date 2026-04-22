import api from "../../../services/api";
import axios from "axios";

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
  phone: string;
  commission: number;
  status: "active" | "pending" | "suspended";
}

export interface Biller {
  id: string;
  name: string;
  serviceType: string;
  status: "active" | "disabled";
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

export const adminApi = {
  getUsers: async () => {
    const response = await api.get("/admin/users");
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
  getStats: async () => {
    const response = await api.get("/admin/stats"); 
    return response.data.data;
  },
  getBillers: async () => {
    const response = await api.get("/billers"); 
    return response.data.data;
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
  getAgents: async () => {
    const response = await api.get("/agents"); 
    return response.data.data;
  },
  createAgent: async (data: any) => {
    const response = await api.post("/agents", data);
    return response.data;
  },
  updateAgent: async (id: string, data: any) => {
    const response = await api.put(`/agents/${id}`, data);
    return response.data;
  },
  deleteAgent: async (id: string) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },
  getCurrentUser: async () => {
    const res = await axios.get("/auth/me", {
      withCredentials: true,
    });
    return res.data.data;
  }
};
