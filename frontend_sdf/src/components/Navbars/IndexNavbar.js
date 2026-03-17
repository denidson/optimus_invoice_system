import React from "react"; 
import { useNavigate } from "react-router-dom";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Navbar({ nombreUsuario, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 w-full z-20 bg-twilight-indigo-600 flex items-center p-4 shadow-md">
      <div className="w-full mx-auto flex justify-between items-center px-4 md:px-10">

        {/* ---------------- IZQUIERDA: hamburguesa + título ---------------- */}
        <div className="flex items-center gap-2">
          {/* Botón hamburguesa en mobile */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="md:hidden text-white text-xl focus:outline-none"
          >
            <i className={`fas ${collapsed ? "fa-bars" : "fa-times"}`}></i>
          </button>

          {/* Título */}
          <span className="text-white text-sm uppercase font-semibold truncate">
            Quantus Invoice
          </span>
        </div>

        {/* ---------------- DERECHA: UserDropdown ---------------- */}
        <div className="flex items-center gap-4 relative">
          <UserDropdown
            nombreUsuario={nombreUsuario}
            onLogout={handleLogout}
          />
        </div>

      </div>
    </nav>
  );
}