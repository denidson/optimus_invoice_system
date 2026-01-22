import api from "./axiosConfig";

/**
 * Todos los reportes ahora aceptan filtros opcionales:
 * {
 *   start_date: "YYYY-MM-DD",
 *   end_date: "YYYY-MM-DD"
 * }
 */

// Sales summary
export const getSalesSummary = async (params = {}) => {
  const response = await api.get("/api/reports/sales-summary", {
    params,
  });
  return response.data;
};

// Sales by structure
export const getSalesByStructure = async (params = {}) => {
  const response = await api.get("/api/reports/sales-by-structure", {
    params,
  });
  return response.data;
};

// Sales by structure drilldown
export const getSalesByStructureDrilldown = async (params = {}) => {
  const response = await api.get(
    "/api/reports/sales-by-structure/drilldown",
    { params }
  );
  return response.data;
};

// Top clients
export const getTopClients = async (params = {}) => {
  const response = await api.get("/api/reports/top-clients", {
    params,
  });
  return response.data;
};

// Top products
export const getTopProducts = async (params = {}) => {
  const response = await api.get("/api/reports/top-products", {
    params,
  });
  return response.data;
};

// Sales over time (para el gráfico)
export const getSalesOverTime = async (params = {}) => {
  const response = await api.get("/api/reports/sales-over-time", {
    params,
  });
  return response.data;
};
