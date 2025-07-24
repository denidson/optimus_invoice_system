import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbars/IndexNavbar';
import HeaderStats from '../components/Headers/HeaderStats';
import CardStats from '../components/Cards/CardStats';


function Dashboard() {
  const { usuario } = useContext(AuthContext);

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <Navbar />
        {/* Header */}
        <HeaderStats />
      </div>
    </>
  );
}

export default Dashboard;
