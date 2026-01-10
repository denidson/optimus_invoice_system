import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbars/IndexNavbar";
import { AuthContext } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? true
  );

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div
        className={`
          flex flex-col flex-1
          transition-[margin] duration-100 ease-in-out
          ${collapsed ? "md:ml-20" : "md:ml-64"}
          min-h-screen
        `}
      >
        {/* Navbar */}
        <Navbar nombreUsuario={nombreUsuario} />

        {/* Contenido */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
