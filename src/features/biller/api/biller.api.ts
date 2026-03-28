
// derash-frontend/src/features/biller/api/biller.api.ts

export interface BillerStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalRevenue: number;
}


import api from "@/services/api";

export const uploadBillsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // 'file' must match the key your backend expects
  const response = await api.post("/billers/upload-bills", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // This returns { status, message, data: { total, success, failed } }
};


export const billerApi = {
  async getStats(): Promise<BillerStats> {
    return {
      totalBills: 1200,
      paidBills: 950,
      unpaidBills: 200,
      totalRevenue: 350000,
    };
  },

  async getBills(): Promise<Bill[]> {
    return [
      { id: "1", customerName: "John Doe", amount: 1200, status: "paid", date: "2026-03-01" },
      { id: "2", customerName: "Jane Smith", amount: 800, status: "unpaid", date: "2026-03-02" },
    ];
  },

  async getReports(): Promise<ReportData[]> {
    return [
      { month: "Jan", revenue: 50000 },
      { month: "Feb", revenue: 70000 },
      { month: "Mar", revenue: 90000 },
    ];
  },
};

