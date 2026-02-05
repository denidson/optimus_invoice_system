// Dashboard.jsx
import React, { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";

import AdminLayout from "../layouts/AdminLayout";
import HeaderStats from "../components/Headers/HeaderStats";
import CardBarChart from "../components/Cards/CardBarChart";
import CardTopClients from "../components/Cards/CardTopClients";
import CardTopProducts from "../components/Cards/CardTopProducts";

import {
  getSalesSummary,
  getSalesOverTime,
  getTopClients,
  getTopProducts,
} from "../services/apiReports";

import { getClients } from "../services/api_clients";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.rol === "admin";
  const cliente_id = user?.cliente_id;
  const nombreUsuario = user?.nombre || "Usuario";

  /* ========================
     FILTROS
  ========================= */
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [selectedClientId, setSelectedClientId] = useState(
    isAdmin ? "" : cliente_id
  );

  const applyFilter = () => {
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
  };

  const clearFilter = () => {
    setDraftStartDate("");
    setDraftEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    if (isAdmin) setSelectedClientId("");
  };

  /* ========================
     CLIENTES (solo admin)
  ========================= */
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    enabled: isAdmin,
  });

  /* ========================
     PARAMS COMUNES
  ========================= */
  const effectiveClientId = isAdmin
    ? selectedClientId || undefined
    : cliente_id;

  const params = {
    ...(effectiveClientId && { cliente_id: effectiveClientId }),
    ...(appliedStartDate && { start_date: appliedStartDate }),
    ...(appliedEndDate && { end_date: appliedEndDate }),
  };

  /* ========================
     QUERIES
  ========================= */
  const summaryQuery = useQuery({
    queryKey: ["sales-summary", params],
    queryFn: () => getSalesSummary(params),
    enabled: isAdmin || !!cliente_id,
    keepPreviousData: true,
  });

  const salesOverTimeQuery = useQuery({
    queryKey: ["sales-over-time", params],
    queryFn: () => getSalesOverTime(params),
    enabled: isAdmin || !!cliente_id,
    keepPreviousData: true,
  });

  const topClientsQuery = useQuery({
    queryKey: ["top-clients", params],
    queryFn: () => getTopClients(params),
    enabled: isAdmin || !!cliente_id,
  });

  const topProductsQuery = useQuery({
    queryKey: ["top-products", params],
    queryFn: () => getTopProducts(params),
    enabled: isAdmin || !!cliente_id,
  });

  /* ========================
     RENDER
  ========================= */
  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      {/* FILTRO */}
      <div className="px-4 md:px-8 mx-auto w-full bg-twilight-indigo-400">
        <div className="flex flex-wrap gap-2 items-center p-4">
          <span className="text-sm text-white font-semibold">
            Filtrar por:
          </span>

          {/* CLIENTE (solo admin) */}
          {isAdmin && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Todos los clientes</option>
              {clientsQuery.data?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre_empresa}
                </option>
              ))}
            </select>
          )}

          {/* FECHAS */}
          <input
            type="date"
            value={draftStartDate}
            onChange={(e) => setDraftStartDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          <input
            type="date"
            value={draftEndDate}
            onChange={(e) => setDraftEndDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          <button
            onClick={applyFilter}
            className="bg-white text-twilight-indigo-600 px-3 py-1 rounded text-sm font-semibold hover:bg-slate-100"
          >
            Aplicar
          </button>

          <button
            onClick={clearFilter}
            className="text-white text-sm underline"
          >
            <i className="fa-solid fa-eraser" title="Limpiar" />
          </button>
        </div>
      </div>

      {/* HEADER STATS */}
      <HeaderStats
        summary={summaryQuery.data}
        isLoading={summaryQuery.isFetching}
      />

      {/* CONTENIDO */}
      <div className="px-4 md:px-8 mx-auto w-full">
        <div className="flex flex-wrap">
          {/* GRÁFICO */}
          <div className="w-full xl:w-5/12 px-4 pt-6">
            <CardBarChart
              data={salesOverTimeQuery.data?.data || []}
              currency={salesOverTimeQuery.data?.currency || ""}
              isLoading={salesOverTimeQuery.isFetching}
            />
          </div>

          {/* RANKINGS */}
          <div className="w-full xl:w-7/12 px-4 pt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CardTopClients
              clients={topClientsQuery.data?.slice(0, 10) || []}
            />

            <CardTopProducts
              products={topProductsQuery.data?.slice(0, 10) || []}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
