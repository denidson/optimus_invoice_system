import React from "react";
import Sidebar from "../components/Sidebar/Sidebar.js";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import FooterAdmin from "../components/Footers/FooterAdmin.js";

export default function Admin({ children, nombreUsuario }) {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar nombreUsuario={nombreUsuario} /> {/* Mostrar nombre */}
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
