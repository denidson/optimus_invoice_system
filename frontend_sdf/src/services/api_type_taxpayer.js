import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getTypeTaxpayer = async () => {
  try {
    const response = await api.get('/api/config/tipos-contribuyente');
    return response.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener del tipos contribuyente:", error);
    throw error;
  }
};