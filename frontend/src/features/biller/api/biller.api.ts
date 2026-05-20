import api from "@/services/api";

export const uploadBillsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/billers/upload-bills", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("Upload response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Upload error:", error);
    
    // Extract detailed error message from backend
    if (error.response) {
      // The backend responded with an error status
      const errorData = error.response.data;
      console.error("Error response data:", errorData);
      
      return {
        status: "ERROR",
        message: errorData.message || "Upload failed",
        data: errorData.data || null,
        errors: errorData.errors || [],
        timestamp: new Date().toISOString()
      };
    } else if (error.request) {
      // The request was made but no response received
      return {
        status: "ERROR",
        message: "No response from server. Please check your connection.",
        data: null,
        errors: [],
        timestamp: new Date().toISOString()
      };
    } else {
      // Something happened in setting up the request
      return {
        status: "ERROR",
        message: error.message || "Request failed",
        data: null,
        errors: [],
        timestamp: new Date().toISOString()
      };
    }
  }
};

export const getBillerStats = async () => {
  try {
    const response = await api.get("/stats");
    console.log("Stats response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Stats error:", error);
    return {
      status: "ERROR",
      message: error.response?.data?.message || "Failed to fetch stats",
      data: null
    };
  }
};

export const getBillerBills = async () => {
  try {
    const response = await api.get("/bills");
    return response.data;
  } catch (error: any) {
    console.error("Bills error:", error);
    return {
      status: "ERROR",
      message: error.response?.data?.message || "Failed to fetch bills",
      data: []
    };
  }
};

export const getBillerReport = async (fromDate?: string, toDate?: string) => {
  try {
    const response = await api.get('/report', {
      params: { fromDate, toDate }
    });
    return response.data;
  } catch (error: any) {
    console.error("Report error:", error);
    return {
      status: "ERROR",
      message: error.response?.data?.message || "Failed to fetch report",
      data: null
    };
  }
}