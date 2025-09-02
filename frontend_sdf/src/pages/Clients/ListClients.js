import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbars/IndexNavbar';
import HeaderStats from '../../components/Headers/HeaderStats';
import ListClients from '../../components/Clients/ListClients';
import CardStats from '../../components/Cards/CardStats';

function Dashboard() {
  const { usuario } = useContext(AuthContext);

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Navbar />
        {/* Header */}
          <div className="p-6">
            {/* HeaderStats con datos */}
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

            {/* CompClients */}
            <div className="mt-6">
              <ListClients />
            </div>
          </div>
      </div>
    </>
  );
}

export default Dashboard;