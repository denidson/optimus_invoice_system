import api from "./axiosConfig";

export const showProfileClient = async (id) => {
  try {
    var response = await api.get(`/api/clients/${id}`);
    var resLogo = await getClientLogo(response.data.id);
    if (resLogo){
      response.data.logo = resLogo;
    }
    //console.log('response.data.logo: ', response.data.logo);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cliente:", error);
    throw error;
  }
};

export const showProfile = async (id) => {
  try {
    var response = await api.get(`/api/profile`);
    /*var resLogo = await getClientLogo(response.data.id);
    if (resLogo){
      response.data.logo = resLogo;
    }
    //console.log('response.data.logo: ', response.data.logo);*/
    return response.data;
  } catch (error) {
    console.error("Error al consultar el perfil de usuario:", error);
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.put("/api/profile/change-password", data);
    return response.data;
  } catch (error) {
    console.error("Error al consultar el cambiar contraseña:", error);
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