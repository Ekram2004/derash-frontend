import axios from "axios";

const ADMIN_SECRET = "DERASH_SUPER_SECRET_2026";
const BASE_URL = "https://derash-bill-aggregator.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${BASE_URL}/auth/refresh`,
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
