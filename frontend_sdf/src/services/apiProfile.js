import api from "./axiosConfig";

export const showProfileClient = async (id) => {
  try {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

export const showProfile = async (id) => {
  try {
    const response = await api.get(`/api/profile`);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el perfil de usuario:", error);
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.put("/api/profile/change-password", data);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cambiar contraseña:", error);
    throw error;
  }
};