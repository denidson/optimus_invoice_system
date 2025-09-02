import axios from 'axios';

// Obtener todos los clientes
export const getTypeTaxpayer = async () => {
  try {
    //console.log("Obtener los clientes-API_URL:", API_URL + '/api/clientes');
    const response = await axios.get('/api/config/tipos-contribuyente');
    //console.log("Obtener los clientes-response:", response);
    return response.data.data; // Devuelve los datos de los clientes
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    throw error;
  }
};