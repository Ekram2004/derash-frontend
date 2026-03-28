// Agent API Layer

export async function searchBills(params: {
  billReference?: string;
  customerName?: string;
  billerCode?: string;
}) {
  const query = new URLSearchParams(params as any).toString();

  const response = await fetch(`/api/agent/bills?${query}`);

  if (!response.ok) {
    throw new Error("Failed to search bills");
  }

  return response.json();
}

export async function processPayment(data: {
  billId: string;
  amount: number;
  paymentMethod: string;
}) {
  const response = await fetch("/api/agent/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Payment failed");
  }

  return response.json();
}
// GET Agent Transactions
export async function getAgentTransactions(params: {
  fromDate?: string;
  toDate?: string;
  transactionId?: string;
  billReference?: string;
  customerName?: string;
  status?: string;
}) {
  const query = new URLSearchParams(params as any).toString();

  const response = await fetch(`/api/agent/transactions?${query}`);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}
// GET Agent Report Summary
export async function getAgentReport(params: {
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams(params as any).toString();

  const response = await fetch(`/api/agent/reports?${query}`);

  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }

  return response.json();
}