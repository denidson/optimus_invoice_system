import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los pre-facturas
export const getPreInvoices = async () => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        //response = await api.get('/admin/pre-invoices');
        response = await api.get('/pre-invoices');
      }else{
        response = await api.get('/pre-invoices');
      }
      return response.data; // Devuelve los datos de los pre-facturas
    }
  } catch (error) {
    console.error("Error al obtener las pre-facturas:", error);
    throw error;
  }
};

// Consultar un pre-facturas por ID
export const showPreInvoice = async (id) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        //response = await api.get(`/admin/pre-invoices/${id}`);
        response = await api.get(`/pre-invoices/${id}`);
      }else{
        response = await api.get(`/pre-invoices/${id}`);
      }
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar el pre-facturas:", error);
    throw error;
  }
};

// Editar un pre-facturas
export const editPreInvoice = async (id, body) => {
  try {
    const response = await api.put(`/api/prefacturas/${id}`, body);
    return response.data;
  } catch (error) {
    console.error("Error al editar el pre-facturas:", error);
    throw error;
  }
};

// Crear un pre-facturas
export const createPreInvoice = async (body) => {
  try {
    const response = await api.post(`/api/invoices`, body);
    console.log('createPreInvoice-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al crear el pre-facturas:", error);
    throw error;
  }
};

// Eliminar un pre-facturas
export const deletePreInvoice = async (id) => {
  try {
    const response = await api.delete(`/api/invoices/${id}`);
    console.log('deletePreInvoice-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el pre-facturas:", error);
    throw error;
  }
};
