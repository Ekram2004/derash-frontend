
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

