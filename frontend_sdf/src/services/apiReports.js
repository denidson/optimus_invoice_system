import api from "./axiosConfig";

// Get sales summary
export const getSalesSummary = async () => {
  const response = await api.get("/api/reports/sales-summary");
  return response.data;
};

// Get sales by structure
export const getSalesByStructure = async () => {
  const response = await api.get("/api/reports/sales-by-structure");
  return response.data;
};

// Get sales by structure drilldown
export const getSalesByStructureDrilldown = async () => {
  const response = await api.get("/api/reports/sales-by-structure/drilldown");
  return response.data;
};

// Get top clients
export const getTopClients = async () => {
  const response = await api.get("/api/reports/top-clients");
  return response.data;
};

// Get top products
export const getTopProducts = async () => {
  const response = await api.get("/api/reports/top-products");
  return response.data;
};

// Get sales over time
export const getSalesOverTime = async () => {
  const response = await api.get("/api/reports/sales-over-time");
  return response.data;
};
