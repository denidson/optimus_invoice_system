import api from "./axiosConfig";

// Login
export const loginRequest = async (email, password) => {
  const response = await api.post("/api/login", { email, password });
  return response.data; // devuelve { mensaje, token, usuario }
};

export const forgotPassword = async (email) => {
  const response = await api.post("/api/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/api/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
};

export const apiRegister = async () => {
  const response = await api.post(" /api/register");
  return response.data;
};