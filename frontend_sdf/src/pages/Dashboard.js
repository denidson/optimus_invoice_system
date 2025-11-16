import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbars/IndexNavbar";
import HeaderStats from "../components/Headers/HeaderStats";
import CardBarChart from "../components/Cards/CardBarChart";
import CardTopClients from "../components/Cards/CardTopClients";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <>
      <Sidebar />

      <div className="relative md:ml-64 bg-slate-100 min-h-screen">
        <Navbar nombreUsuario={nombreUsuario} />

        <HeaderStats />

        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <div className="flex flex-wrap">

            {/* Gráfico */}
            <div className="w-full xl:w-8/12 px-4">
              <CardBarChart />
            </div>

            {/* Top Clientes */}
            <div className="w-full xl:w-4/12 px-4">
              <CardTopClients />
            </div>

          </div>
        </div>

      </div>
    </>

  );
}
