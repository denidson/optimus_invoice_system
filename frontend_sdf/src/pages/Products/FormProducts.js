import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbars/IndexNavbar';
import HeaderStats from '../../components/Headers/HeaderStats';
import FormProducts from '../../components/Products/FormProducts';
import CardStats from '../../components/Cards/CardStats';

function FormProductPage() {
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

          {/* Formulario de Productos */}
          <div className="mt-6 md:px-6 w-full">
            <FormProducts
              cliente_id={user?.rol === "operador" ? user?.cliente_id : null}
              rol={user?.rol}
            />

          </div>
        </main>
      </div>
    </>
  );
}

export default FormProductPage;