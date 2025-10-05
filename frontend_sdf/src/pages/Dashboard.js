import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbars/IndexNavbar';
import HeaderStats from '../components/Headers/HeaderStats';

function Dashboard() {
  const { user } = useContext(AuthContext);

  // Extraemos el nombre del usuario correctamente
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Navbar nombreUsuario={nombreUsuario} /> {/* Pasamos el nombre al Navbar */}
        {/* Header */}
        <HeaderStats />
      </div>
    </>
  );
}

export default Dashboard;
