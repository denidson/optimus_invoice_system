import api from "./axiosConfig"; 

// Obtener todos los usuarios
export const getCompanyUsers = async (params = {}) => {
  try {
    const query = new URLSearchParams();

    if (params.include_inactive) query.append("include_inactive", params.include_inactive);

    const response = await api.get(`/api/company-users?${query.toString()}`);
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching company users:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};

export const showCompanyUsers = async (id) => {
  try {
    const response = await api.get(`/api/company-users/${id}`);
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching company users:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};

// Editar cliente
export const editCompanyUsers = async (id, body) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      response = await api.put(`/api/company-users/${id}`, body);
      return response.data;
    }
  } catch (error) {
    console.error("Error al editar el usuario:", error);
    throw error;
  }
};

// Crear un usuario
export const createCompanyUsers = async (body, client_id=false) => {
  try {
    var response;
    console.log('api-client_id: ', client_id);
    if (client_id === false){
      response = await api.post(`/api/company-users`, body);
    }else if (client_id === null){
      response = await api.post(`/admin/users`, body);
    }else{
      response = await api.post(`/admin/clients/${client_id}/users`, body);
    }
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return error.response.data;
  }
};

// Delete a Usuario
export const deleteCompanyUser = async (id) => {
  const response = await api.delete(`/api/company-users/${id}`);
  return response.data;
};

export const activateCompanyUser = async (id) => {
  try {
    const response = await api.put(`/api/company-users/${id}/activar`);
    //console.log('activateProduct-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al activar el usuario:", error);
    throw error;
  }
}