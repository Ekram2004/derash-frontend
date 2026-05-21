import axios from "axios";

const ADMIN_SECRET = "DERASH_SUPER_SECRET_2026"; 

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // 🔑 This passes your secure session HTTP cookies automatically!
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,   
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post("http://localhost:5000/api/v1/auth/refresh", {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;