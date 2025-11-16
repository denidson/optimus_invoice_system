import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getEndClients = async () => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      //if (rol == 'admin'){
        //response = await api.get('/admin/clients');
      //}else{
      response = await api.get('/api/final-clients/');
      //}
      return response.data.data;
    }
  } catch (error) {
    console.error("Error al obtener los final-clients:", error);
    throw error;
  }
};

// Consultar un cliente por ID
export const showEndClient = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      /*if (rol == 'admin'){
        response = await api.get(`/admin/clients/${id}`);
      }else{*/
      response = await api.get(`/api/final-clients/${id}`);
      //}
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

// Editar un cliente
export const editEndClient = async (id, body) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      /*if (rol == 'admin'){
        response = await api.put(`/admin/clients/${id}`, body);
      }else{*/
      response = await api.put(`/api/final-clients/${id}`, body);
      //}
      return response.data;
    }
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Crear un cliente
export const createEndClient = async (body) => {
  try {
    const response = await api.post(`/api/final-clients/`, body);
    console.log('createEndClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

// Desactivar un cliente
export const deleteEndClient = async (id) => {
  try {
    const response = await api.delete(`/api/final-clients/${id}`);
    console.log('deleteEndClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    throw error;
  }
};

// Activar un cliente
export const searchEndClient = async (rif) => {
  try {
    const response = await api.put(`/api/final-clients/?rif=${rif}`);
    console.log('searchEndClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

