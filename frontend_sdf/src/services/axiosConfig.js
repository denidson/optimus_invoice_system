import axios from "axios";

// Configuración centralizada de axios
// Puedes ajustar la baseURL según tu entorno
// http://host.docker.internal:5000 es para acceder al host desde un contenedor Docker en Windows/Mac
// localhost:5000 es para desarrollo local sin Docker
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "http://host.docker.internal:5000"),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
