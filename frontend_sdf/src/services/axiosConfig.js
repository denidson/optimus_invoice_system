import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL // En producción toma la URL de Vercel
      : "", // En desarrollo usamos el proxy definido en package.json
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar token a cada request
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejar 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authData");
      window.location.href = "/login"; // redirige al login
    }
    return Promise.reject(error);
  }
);

export default api;
