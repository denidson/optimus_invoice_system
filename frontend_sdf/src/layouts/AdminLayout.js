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
    <div className="flex min-h-screen bg-indigo-50 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`
          flex flex-col flex-1 min-w-0
          transition-[margin] duration-100 ease-in-out
          ${collapsed ? "md:ml-20" : "md:ml-64"}
          min-h-screen
        `}
      >
        <Navbar nombreUsuario={nombreUsuario} />

        <main className="flex-1 overflow-x-auto overflow-y-auto sidebar-scroll">
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
