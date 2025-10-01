import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getClients = async () => {
  try {
    //const authData = localStorage.getItem("authData");
    //const response = await api.get('/api/clients');
    const response = await api.get('/admin/clients');
    return response.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

// Consultar un cliente por ID
export const showClient = async (id) => {
  try {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

// Editar un cliente
export const editClient = async (id, body) => {
  try {
    const response = await api.put(`/admin/clients/${id}`, body);
    return response.data;
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Crear un cliente
export const createClient = async (body) => {
  try {
    const response = await api.post(`/api/clients`, body);
    console.log('createClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

// Desactivar un cliente
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/api/clients/${id}`);
    console.log('deleteClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};

// Activar un cliente
export const activateClient = async (id) => {
  try {
    const response = await api.put(`/api/clients/${id}/activar`);
    console.log('deleteClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};
