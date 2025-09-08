// src/api/axiosConfig.js
import axios from "axios";

// Para desarrollo con Docker Desktop (Windows/Mac):
// host.docker.internal apunta a tu máquina host desde dentro del contenedor
// Puedes sobreescribir con la variable de entorno REACT_APP_API_URL si quieres
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://host.docker.internal:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
