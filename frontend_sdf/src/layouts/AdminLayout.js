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
    <div className="flex min-h-screen bg-indigo-50 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div
        className={`
          flex flex-col flex-1 min-w-0
          transition-all duration-300 ease-in-out
          ${collapsed ? "md:pl-20" : "md:pl-64"}
          min-h-screen
        `}
      >
        {/* Navbar */}
        <Navbar
          nombreUsuario={nombreUsuario}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main */}
        <main className="flex-1 w-full overflow-y-auto">
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