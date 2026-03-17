import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbars/IndexNavbar";
import { AuthContext } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  // Estado del sidebar (collapsed / expanded)
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? true
  );

  // Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-indigo-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div
        className={`
          flex flex-col flex-1 min-w-0
          transition-[margin] duration-100 ease-in-out
          ml-0 md:ml-0 md:ml-${collapsed ? "20" : "64"}
          min-h-screen
        `}
      >
        {/* Navbar */}
        <Navbar nombreUsuario={nombreUsuario} />

        {/* Main content */}
        <main className="flex-1 w-full p-4 md:p-6 overflow-x-auto overflow-y-auto sidebar-scroll">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { collapsed })
              : child
          )}
        </main>
      </div>
    </div>
  );
}