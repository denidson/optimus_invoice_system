import api from "./axiosConfig"; // Centralized axios configuration

// Get all IVA
export const getTaxCategories = async () => {
  try {
    const response = await api.get("/api/config/iva-categorias");
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching tax categories:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};