import api from "@/services/api";

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};