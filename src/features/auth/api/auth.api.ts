import api from "../../../services/api";


export const loginApi = async (data: any) => {
  const response = await api.post("/auth/login", data);
  return response.data; 
};
