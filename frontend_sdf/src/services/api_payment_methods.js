import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/api/config/metodos-pago');
    return response.data; // Devuelve los datos de los metodos de pago
  } catch (error) {
    console.error("Error al obtener del tipos contribuyente:", error);
    throw error;
  }
};