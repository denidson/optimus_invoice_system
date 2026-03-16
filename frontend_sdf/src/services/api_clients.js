import api from "./axiosConfig"; // Importa la configuración centralizada de axios
import { apiRegister } from "./authService";

// Obtener todos los clientes
export const getClients = async () => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        response = await api.get('/admin/clients');
      }else{
        response = await api.get('/api/clients');
      }
      return response.data;
    }
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};

// Consultar un cliente por ID
export const showClient = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        response = await api.get(`/admin/clients/${id}`);
      }else{
        response = await api.get(`/api/clients/${id}`);
      }
      var resLogo = await getClientLogo(response.data.id);
      if (resLogo){
        response.data.logo = resLogo;
      }
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

// Editar un cliente
export const editClient = async (id, body) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      // Extraer logo y preparar objeto con content_type
      let logoPayload = null;
      if (body.logo) {
        // Extraer tipo MIME desde el base64
        const match = body.logo.match(/^data:(image\/[a-zA-Z]+);base64,/);
        const content_type = match ? match[1] : "image/png";
        logoPayload = {
          logo: body.logo,
          content_type
        };
        // Eliminar logo del body principal para no enviarlo duplicado
        delete body.logo;
      }
      if (rol == 'admin'){
        response = await api.put(`/admin/clients/${id}`, body);
      }else{
        response = await api.put(`/api/clients/${id}`, body);
      }
      if (logoPayload) {
        await api.put(`/api/clients/${id}/logo`, logoPayload);
      }

      return response.data;
    }
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

// Crear un cliente
export const createClient = async (body) => {
  try {
    //console.log('createClient-body: ', body);
    const response = await api.post(`/api/clients/`, body);
    //console.log('createClient-response: ', response);
    for (var i = 0; i < body.length; i++){
        var bodyUser = {
        "nombre": body[i].nombre_empresa,
        "email": body[i].email,
        "password": body[i].rif,
        "cliente_id": response.data[i].id,
      }
      //console.log('createClient-bodyUser: ', bodyUser);
      var responseUser = await apiRegister(bodyUser);
      //console.log('createClient-responseUser: ', responseUser);
    }
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

export const getClientLogo = async (id) => {
  try {
    const response = await api.get(`/api/clients/${id}/logo`, {
      responseType: "arraybuffer" // muy importante para manejar binarios
    });

    // Convertir a base64 para usar en jsPDF
    const base64 = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Detectar tipo de imagen (puedes ajustarlo si sabes que siempre es PNG)
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error("Error al obtener logo del cliente:", err);
    return null;
  }
};