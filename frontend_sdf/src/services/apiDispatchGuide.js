import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todas guia de despacho
export const getAllDispatchGuides = async (params = {}) => {
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

    const endpoint = '/api/dispatch-guides';

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
    console.error("Error al obtener las guia de despacho:", error);
    throw error;
  }
};

// Consultar una guia de despacho por comprobante ID
export const showDispatchGuide = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      response = await api.get(`/api/dispatch-guides/${id}`);
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar la guia de despacho:", error);
    throw error;
  }
};

// Crear una guia de despacho
export const createDispatchGuide = async (body) => {
  try {
    const response = await api.post(`/api/dispatch-guides`, body);
    console.log('createDispatchGuide-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear la guia de despacho:", error);
    throw error;
  }
};