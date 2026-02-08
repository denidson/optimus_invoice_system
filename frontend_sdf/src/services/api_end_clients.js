import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los clientes
export const getEndClients = async ({ page = 1, per_page = 20, request_type=false, client_id=false } = {}) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      //if (rol == 'admin'){
        //response = await api.get('/admin/clients');
      //}else{
      if (client_id == false){
        response = await api.get(`/api/final-clients?page=${page}&per_page=${per_page}` + (request_type != false ? `?request_type=${request_type}` : ``));
      }else{
        response = await api.get(`/api/final-clients?client_id=${client_id}`);
      }
      //}
      return response.data;
    }
  } catch (error) {
    console.error("Error al obtener los final-clients:", error);
    throw error;
  }
};

export const getAuditLogs = async ({ page = 1, per_page = 20 } = {}) => {
    try {
      const response = await api.get(`/admin/logs?page=${page}&per_page=${per_page}`);
      return response.data; // Retorna los datos directamente
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error; // Lanzamos el error para que el componente lo maneje
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
    const response = await api.post(`/api/final-clients`, body);
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
    const response = await api.get(`/api/final-clients/search?rif=${rif}`);
    console.log('searchEndClient-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

