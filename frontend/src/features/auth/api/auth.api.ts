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

// ✅ Forgot Password – request a reset link
export const forgotPasswordApi = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// ✅ Reset Password – submit new password with token
export const resetPasswordApi = async (token: string, newPassword: string) => {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
};