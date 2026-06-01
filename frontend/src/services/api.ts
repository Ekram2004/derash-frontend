import axios from "axios";

const ADMIN_SECRET = "DERASH_SUPER_SECRET_2026"; 
const BASE_URL = "http://localhost:5000/api/v1"; // 💡 Extracted to a constant so it can be used safely inside the interceptor below

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔑 This passes your secure session HTTP cookies automatically!
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,   
  },
}); // 💡 Fixed: Added missing closing curly brace '}' here

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403) {
      console.warn("Access Denied: Not an admin. Stopping retry.");
      return Promise.reject(error);
    }
    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${BASE_URL}/auth/refresh`, // 💡 Fixed: Uses the defined BASE_URL constant
          {},
          { withCredentials: true },
        );

        // If refresh worked, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear(); // Clear any zombie tokens
        if (window.location.pathname !== "/login") {
          window.history.replaceState({}, "", "/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;