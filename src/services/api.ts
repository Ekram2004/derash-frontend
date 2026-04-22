import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");


        const res = await axios.post(
          "http://localhost:5000/api/v1/auth/refresh",
          {
            refreshToken,
          },
        );

        if (res.status === 200) {
          const { accessToken } = res.data;

          
          localStorage.setItem("token", accessToken);

          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        
        console.error("Session expired or overwritten. Logging out...");
        localStorage.clear();
        window.location.href = "/login"; 
      }
    }

    return Promise.reject(error);
  },
);
export default api;