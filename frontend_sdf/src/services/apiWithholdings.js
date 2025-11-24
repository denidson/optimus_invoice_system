import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todas retenciones
export const getAllWithholdings = async (params = {}) => {
  try {
    const authData = localStorage.getItem("authData");
    const {
      page = 1,
      per_page = 20,
      numero_comprobante,
      sujeto_retenido_rif,
      periodo_fiscal,
    } = params;

    if (!authData) return;

    const { rol } = JSON.parse(authData);

    const endpoint = '/api/retenciones';

    const query = new URLSearchParams({
      page,
      per_page,
      ...(numero_comprobante && { numero_comprobante }),
      ...(sujeto_retenido_rif && { sujeto_retenido_rif }),
      ...(periodo_fiscal && { periodo_fiscal }),
    });

    const response = await api.get(`${endpoint}?${query.toString()}`);
    return response.data; 
  } catch (error) {
    console.error("Error al obtener las retenciones:", error);
    throw error;
  }
};

// Consultar una retencion por comprobante ID
export const showWithholding = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      response = await api.get(`/api/retenciones/${id}`);
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar la retencion:", error);
    throw error;
  }
};

// Crear una retencion
export const createWithholding = async (body) => {
  try {
    const response = await api.post(`/api/retenciones`, body);
    console.log('createWithholding-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear la retencion:", error);
    throw error;
  }
};