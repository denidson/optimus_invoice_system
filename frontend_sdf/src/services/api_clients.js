import axios from 'axios';

// Obtener todos los clientes
export const getClients = async () => {
  try {
    const response = await axios.get('/api/clientes');
    //console.log("Obtener los clientes-response:", response);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

export const showClient = async (id) => {
  try {
    const response = await axios.get(`/api/clientes/${id}`);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al consultar al clientes:", error);
    throw error;
  }
};

export const editClient = async (id, body) => {
  try {
    const response = await axios.put(`/api/clientes/${id}`, body);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al editar al clientes:", error);
    throw error;
  }
};

export const createClient = async (body) => {
  try {
    const response = await axios.post(`/api/clientes`, body);
    console.log('createClient-response: ', response);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al crear al clientes:", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`/api/clientes/${id}`);
    console.log('deleteClient-response: ', response);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al eliminar al clientes:", error);
    throw error;
  }
};