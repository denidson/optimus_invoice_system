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

// Get registros de auditoria
export const getAuditLogs = async () => {
  try {
    const response = await api.get("/admin/logs");
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};

// Consultar un registro de auditoria por ID
export const showAuditLogs = async (id) => {
  try {
    const response = await api.get(`/admin/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el audit logs:", error);
    throw error;
  }
};