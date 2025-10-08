import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los pre-facturas
export const getInvoices = async () => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        response = await api.get('/admin/invoices');
        //response = await api.get('/pre-invoices/');
      }else{
        response = await api.get('/api/invoices');
      }
      return response.data; // Devuelve los datos de los pre-facturas
    }
  } catch (error) {
    console.error("Error al obtener las pre-facturas:", error);
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