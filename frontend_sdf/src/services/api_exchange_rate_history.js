import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getExchangeRateHistory = async (filterType) => {
  try {
    const response = await api.get(`/api/bcv/tasas/historial?moneda=${filterType}`); //?moneda=USD&desde=2026-04-01&hasta=2026-04-30
    return response.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener historial de tasas de cambio:", error);
    throw error;
  }
};

// Obtener todos los clientes
export const getLatestExchangeRateHistory = async (filterType) => {
  try {
    const response = await api.get(`/api/bcv/tasas`); //?moneda=USD&desde=2026-04-01&hasta=2026-04-30
    return response.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener la ultima tasa de cambio:", error);
    throw error;
  }
};
