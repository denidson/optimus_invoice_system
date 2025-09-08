import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getClients = async () => {
  try {
    const response = await api.get('/api/clientes');
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

// Consultar un cliente por ID
export const showClient = async (id) => {
  try {
    const response = await api.get(`/api/clientes/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

// Editar un cliente
export const editClient = async (id, body) => {
  try {
    const response = await api.put(`/api/clientes/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Crear un cliente
export const createClient = async (body) => {
  try {
    const response = await api.post(`/api/clientes`, body);
    console.log('createClient-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/api/clientes/${id}`);
    console.log('deleteClient-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};
