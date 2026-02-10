import api from "./axiosConfig"; // Importa la configuración centralizada de axios

export const getInvoices = async (params = {}) => {
  try {
    const authData = localStorage.getItem("authData");
    if (!authData) return [];

    const { rol } = JSON.parse(authData);

    // Determinar endpoint según rol
    const endpoint = rol === "admin" ? "/admin/invoices" : "/api/invoices";

    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.per_page) query.append("per_page", params.per_page);
    if (params.tipo_documento) query.append("tipo_documento", params.tipo_documento);
    if (params.numero_control) query.append("numero_control", params.numero_control);
    if (params.desde) query.append("desde", params.desde);
    if (params.hasta) query.append("hasta", params.hasta);
    if (params.estatus) query.append("estatus", params.estatus);

    const response = await api.get(`${endpoint}?${query.toString()}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // No se encontraron facturas
      return [];
    }
    console.error("Error al obtener las facturas:", error);
    throw error;
  }
};

// Consultar un pre-facturas por ID
export const showInvoice = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        response = await api.get(`/admin/invoices/${id}`);
        //response = await api.get(`/pre-invoices/${id}`);
      }else{
        response = await api.get(`/api/invoices/${id}`);
      }
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar el pre-facturas:", error);
    throw error;
  }
};