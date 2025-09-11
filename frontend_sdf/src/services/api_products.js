import api from "./axiosConfig"; // Importa la configuración centralizada de axios

// Obtener todos los productos
export const getProducts = async () => {
  try {
    const response = await api.get('/api/productos');
    return response.data.data; // Devuelve los datos de los productos
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    throw error;
  }
};

// Consultar un producto por ID
export const showProduct = async (id) => {
  try {
    const response = await api.get(`/api/productos/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error al consultar el producto:", error);
    throw error;
  }
};

// Editar un producto
export const editProduct = async (id, body) => {
  try {
    const response = await api.put(`/api/productos/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error("Error al editar el producto:", error);
    throw error;
  }
};

// Crear un producto
export const createProduct = async (body) => {
  try {
    const response = await api.post(`/api/productos`, body);
    console.log('createProduct-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al crear el producto:", error);
    throw error;
  }
};

// Eliminar un producto
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/productos/${id}`);
    console.log('deleteProduct-response: ', response);
    return response.data.data;
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    throw error;
  }
};
