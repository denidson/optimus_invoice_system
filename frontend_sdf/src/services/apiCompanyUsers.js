import api from "./axiosConfig"; 

// Obtener todos los usuarios
export const getCompanyUsers = async ({ page = 1, per_page = 20 } = {}) => {
  try {
    const response = await api.get(`/api/company-users?page=${page}&per_page=${per_page}`);
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching company users:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};

// Editar cliente
export const editCompanyUsers = async (id, body) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      response = await api.put(`/api/company-users/${id}`, body);
      return response.data;
    }
  } catch (error) {
    console.error("Error al editar el usuario:", error);
    throw error;
  }
};

// Crear un usuario
export const createCompanyUsers = async (body) => {
  try {
    const response = await api.post(`/api/company-users`, body);
    console.log('createClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error;
  }
};