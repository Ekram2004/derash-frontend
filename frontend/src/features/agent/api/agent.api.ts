import api from "../../../services/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

// 💡 DYNAMIC LOOKUPS: Replaced hardcoded constants with dynamic selectors from your store
const getAgentApiKey = () => {
  const state = useAuthStore.getState();
  return state.user?.agent?.apiKey || "";
};

const getAgentCode = () => {
  const state = useAuthStore.getState();
  return state.user?.agent?.code || "";
};

// Dashboard
export async function getAgentDashboard() {
  const response = await api.get("/agent/dashboard", {
    headers: {
      "x-api-key": getAgentApiKey(),
      "x-agent-code": getAgentCode(),
    },
  });
  return response.data; // { success, stats, recentTransactions }
}

// Search bills
export async function searchBills(params: {
  billReference: string;
  agentCode?: string;
  customerName?: string;
  billerCode?: string;
}) {
  const { billReference, agentCode, customerName, billerCode } = params;
  const queryParams = new URLSearchParams();
  if (customerName) queryParams.append("customerName", customerName);
  if (billerCode) queryParams.append("billerCode", billerCode);
  const queryString = queryParams.toString();
  const url = `/agent/bill-inquiry/${encodeURIComponent(billReference)}${queryString ? `?${queryString}` : ""}`;
  
  const headers: Record<string, string> = {
    "x-api-key": getAgentApiKey(),
    "x-agent-code": agentCode || getAgentCode(), // Uses override or falls back to logged-in agent code
  };
  
  const response = await api.get(url, { headers });
  return response.data;
}

// Process payment – accepts dynamic parameters cleanly
export async function processPayment(data: {
  billId: string;
  agentId: string;
  amount: number;
  transactionId: string;
  idempotencyKey: string;
  paymentMethod: string;
  payerPhone: string;
}) {
  const response = await api.post("/agent/confirm-payment", data, {
    headers: {
      "x-api-key": getAgentApiKey(),
      "x-agent-code": getAgentCode(),
    },
  });
  return response.data;
}

// Agent transactions (report)
export async function getAgentTransactions(params?: {
  fromDate?: string;
  toDate?: string;
}) {
  const response = await api.get("/agent/my-report", {
    params,
    headers: {
      "x-api-key": getAgentApiKey(),
      "x-agent-code": getAgentCode(),
    },
  });
  return response.data;
}

// Alias
export async function getAgentReport(params?: { fromDate?: string; toDate?: string }) {
  return getAgentTransactions(params);
}