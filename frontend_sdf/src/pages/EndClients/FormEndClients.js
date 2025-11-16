import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbars/IndexNavbar';
import HeaderStats from '../../components/Headers/HeaderStats';
import FormEndClients from '../../components/EndClients/FormEndClients';
import CardStats from '../../components/Cards/CardStats';

function FormEndClientPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 min-h-screen bg-blueGray-100 flex flex-col">
        <Navbar nombreUsuario={nombreUsuario} />
        {/* Header */}
        <main className="flex-1">
          {/* HeaderStats */}
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

          {/* Formulario de Clientes */}
          <div className="mt-6 md:px-6 w-full">
            <FormEndClients />
          </div>
        </main>
      </div>
    </>
  );
}

export default FormEndClientPage;