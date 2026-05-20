// src/features/auth/api/auth.api.ts
import api from "../../../services/api";

export const loginApi = async (data: any) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const changePasswordApi = async (data: { newPassword: string; token: string }) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};