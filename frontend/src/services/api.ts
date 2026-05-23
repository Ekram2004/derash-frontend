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

    // 1. Check if the error is 401
    // 2. Ensure we haven't already retried this specific request
    // 3. CRITICAL: Ensure the failed request wasn't the refresh call itself
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
        // If refresh fails, the session is dead.
        // Clear everything and force login.
        localStorage.clear(); // Clear any zombie tokens
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
