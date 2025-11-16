import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los pre-facturas
export const getPreInvoices = async (params = {}) => {
  try {
    const authData = localStorage.getItem("authData");
    const {
      page = 1,
      per_page = 20,
      estatus,
      zona,
      correlativo_interno,
      cliente_final_rif,
      desde,
      hasta,
    } = params;

    if (!authData) return;

    const { rol } = JSON.parse(authData);

    const endpoint = rol === 'admin'
      ? '/admin/pre-invoices'
      : '/api/pre-invoices/';

    const query = new URLSearchParams({
      page,
      per_page,
      ...(estatus && { estatus }),
      ...(zona && { zona }),
      ...(correlativo_interno && { correlativo_interno }),
      ...(cliente_final_rif && { cliente_final_rif }),
      ...(desde && { desde }),
      ...(hasta && { hasta }),
    });
    console.log('params: ', params);
    console.log('query: ', query);
    const response = await api.get(`${endpoint}?${query.toString()}`);
    return response.data; // {data, total, total_pages}
    /*if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      if (rol == 'admin'){
        response = await api.get(`/admin/pre-invoices?page=${page}&per_page=${per_page}`);
      }else{
        response = await api.get(`/api/pre-invoices?page=${page}&per_page=${per_page}`);
      }
      return response.data.data; // Devuelve los datos de los pre-facturas
    }*/
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
        response = await api.get(`/admin/pre-invoices/${id}`);
        //response = await api.get(`/pre-invoices/${id}`);
      }else{
        response = await api.get(`/api/pre-invoices/${id}`);
      }
      return response.data;
    }
  } catch (error) {
    console.error("Error al consultar el pre-facturas:", error);
    throw error;
  }
};

// Convertir en factura
export const convertInInvoice = async (body) => {
  try {
    const response = await api.post(`/api/invoices/from-pre-invoice`, body);
    //console.log('convertInInvoice-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al Convertir en factura:", error);
    throw error;
  }
};

// Editar un pre-facturas
export const editPreInvoice = async (id, body) => {
  try {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { rol } = JSON.parse(authData);
      var response;
      var response_i;
      if (rol == 'admin'){
        response = await api.get(`/admin/pre-invoices/${id}`);
        //response = await api.get(`/pre-invoices/${id}`);
      }else{
        var items = body.items;
        console.log('body: ', body);
        console.log('items: ', items);
        delete body.items;
        response = await api.put(`/api/pre-invoices/${id}`, body);
        for (var i = 0; i < items.length; i++){
          if (items[i].nueva_linea == true){
            delete items[i].id;
          }
        }
        console.log('items(F): ', items);
        response_i = await api.put(`/api/pre-invoices/${id}/items:bulk_upsert`, items);
        console.log('response_i: ', response_i);
      }
      return response.data;
    }
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
    const response = await api.delete(`/pre-invoices/${id}`);
    console.log('deletePreInvoice-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el pre-facturas:", error);
    throw error;
  }
};