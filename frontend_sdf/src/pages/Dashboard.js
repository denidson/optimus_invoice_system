import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";

import AdminLayout from "../layouts/AdminLayout";
import HeaderStats from "../components/Headers/HeaderStats";
import CardBarChart from "../components/Cards/CardBarChart";
import CardTopClients from "../components/Cards/CardTopClients";

import {
  getSalesSummary,
  getSalesOverTime,
  getTopClients,
} from "../services/apiReports";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const cliente_id = user?.cliente_id;
  const nombreUsuario = user?.nombre || "Usuario";

  const summaryQuery = useQuery({
    queryKey: ["sales-summary", cliente_id],
    queryFn: () => getSalesSummary(cliente_id),
    enabled: !!cliente_id,
  });

  const salesOverTimeQuery = useQuery({
    queryKey: ["sales-over-time", cliente_id],
    queryFn: () => getSalesOverTime(cliente_id),
    enabled: !!cliente_id,
  });

  const topClientsQuery = useQuery({
    queryKey: ["top-clients", cliente_id],
    queryFn: () => getTopClients(cliente_id),
    enabled: !!cliente_id,
  });

  const isLoading =
    summaryQuery.isLoading ||
    salesOverTimeQuery.isLoading ||
    topClientsQuery.isLoading;

  const isError =
    summaryQuery.isError ||
    salesOverTimeQuery.isError ||
    topClientsQuery.isError;

  if (isLoading) {
    return <p className="text-white p-4">Cargando dashboard...</p>;
  }

  if (isError) {
    return <p className="text-red-500 p-4">Error cargando dashboard</p>;
  }

  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      <HeaderStats summary={summaryQuery.data} />

      <div className="px-4 md:px-8 mx-auto w-full">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 px-4 pt-6">
            <CardBarChart data={salesOverTimeQuery.data.data} />
          </div>
          <div className="w-full xl:w-4/12 px-4 pt-6 flex">
            <CardTopClients clients={topClientsQuery.data.slice(0, 10)} />
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
