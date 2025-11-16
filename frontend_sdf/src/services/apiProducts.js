import api from "./axiosConfig";

// Get all products
export const getProducts = async () => {
  const response = await api.get("/api/products/");
  return response.data;
};

// Get a product by ID
export const showProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

// Create a product
export const createProduct = async (body) => {
  const response = await api.post("/api/products", body);
  return response.data.data;
};

// Update a product
export const editProduct = async (id, body) => {
  const response = await api.put(`/api/products/${id}`, body);
  return response.data.data;
};

// Delete a product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

export const activateProduct = async (id) => {
  try {
    const response = await api.put(`/api/products/${id}/activar`);
    console.log('activateProduct-response: ', response);
    return response.data;
  } catch (error) {
    console.error("Error al activar el producto:", error);
    throw error;
  }
};
