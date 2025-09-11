import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getPreInvoices = async () => {
  try {
    const response = await api.get('/api/prefacturas');
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener las pre-facturas:", error);
    throw error;
  }
};

// Consultar un cliente por ID
export const showPreInvoice = async (id) => {
  try {
    const response = await api.get(`/api/prefacturas/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

// Editar un cliente
export const editPreInvoice = async (id, body) => {
  try {
    const response = await api.put(`/api/prefacturas/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Crear un cliente
export const createPreInvoice = async (body) => {
  try {
    const response = await api.post(`/api/prefacturas`, body);
    console.log('createPreInvoice-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

// Eliminar un cliente
export const deletePreInvoice = async (id) => {
  try {
    const response = await api.delete(`/api/prefacturas/${id}`);
    console.log('deletePreInvoice-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};
