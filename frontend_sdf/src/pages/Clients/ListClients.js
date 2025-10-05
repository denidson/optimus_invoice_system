import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbars/IndexNavbar';
import HeaderStats from '../../components/Headers/HeaderStats';
import ListClients from '../../components/Clients/ListClients';

function ListClientsPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";
  
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
        <Navbar nombreUsuario={nombreUsuario} />

        {/* Header con estadísticas */}
        <HeaderStats
          statSubtitle="Facturas"
          statTitle="1,200"
          statArrow="up"
          statPercent="3.48"
          statPercentColor="text-emerald-500"
          statDescription="Desde el mes pasado"
          statIconName="fas fa-chart-line"
          statIconColor="bg-blue-500"
        />

        {/* Contenido principal */}
        <div className="mt-6 px-4 md:px-8">
          <ListClients />
        </div>
      </div>
    </>
  );
}

export default ListClientsPage;
