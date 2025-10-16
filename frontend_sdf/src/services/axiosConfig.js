import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api/proxy" // En producción toma la URL de Vercel
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
      // Evitar mostrar múltiples toasts si se disparan varios 401 a la vez
      if (!window._sessionExpired) {
        window._sessionExpired = true;

        // Mostrar notificación
        import("react-toastify").then(({ toast }) => {
          toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.", {
            position: "top-center",
            autoClose: 2000,
            onClose: () => {
              localStorage.removeItem("authData");
              window._sessionExpired = false;
              window.location.href = "/login";
            },
          });
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
