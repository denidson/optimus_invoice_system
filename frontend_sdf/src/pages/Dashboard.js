import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import HeaderStats from "../components/Headers/HeaderStats";
import CardBarChart from "../components/Cards/CardBarChart";
import CardTopClients from "../components/Cards/CardTopClients";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      <HeaderStats />

      {/* Ajustamos el contenedor de tarjetas */}
      <div className="px-4 md:px-8 mx-auto w-full">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 px-4">
            <CardBarChart />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardTopClients />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
