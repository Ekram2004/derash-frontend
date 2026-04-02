import api from "@/services/api";

export const uploadBillsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // We don't need to pass billerId because your backend
  // now gets it from the Cookie/Session!
  const response = await api.post("/billers/upload-bills", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getBillerStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export const getBillerBills = async () => {
  const response = await api.get("/bills");
  return response.data; 
};

export const getBillerReport = async (fromDate?: string, toDate?: string) => {
  const response = await api.get('/report', {
    params: { fromDate, toDate }
  });
  return response.data;
}
