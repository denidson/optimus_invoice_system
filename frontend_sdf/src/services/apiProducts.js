import api from "./axiosConfig"; // Centralized axios configuration

// Get all products
export const getProducts = async () => {
  try {
    const response = await api.get("/api/products/");
    return response.data; // Retorna los datos directamente
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // Lanzamos el error para que el componente lo maneje
  }
};

// Get a product by ID
export const showProduct = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Update a product
export const editProduct = async (id, body) => {
  try {
    const response = await api.put(`/api/products/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (body) => {
  try {
    console.log("POST /api/products body:", body);
    const response = await api.post("/api/products", body);
    return response.data.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};


// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/products/${id}`);
    console.log('deleteProduct-response:', response);
    return response.data.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
