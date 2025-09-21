import api from "./axiosConfig";

// Login
export const loginRequest = async (email, password) => {
  const response = await api.post("/api/login", { email, password });
  return response.data; // devuelve { mensaje, token, usuario }
};
