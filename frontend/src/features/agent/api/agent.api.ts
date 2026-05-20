import api from "../../../services/api";

// Hardcoded agent code (from your admin dashboard)
const AGENT_CODE = "CBE-1001";
const API_KEY = "cbe_agent_key_12345";

const getAgentApiKey = () => API_KEY;
const getAgentCode = () => AGENT_CODE;

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
    "x-agent-code": agentCode || getAgentCode(),
  };
  const response = await api.get(url, { headers });
  return response.data;
}

// Process payment
export async function processPayment(data: {
  bill_id: string;
  agent_id: string;
  amount: number;
  transactionId: string;
  idempotencyKey: string;
  payment_method: string;
  payer_phone: string;
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