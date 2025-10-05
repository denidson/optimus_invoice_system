/*eslint-disable*/
import React from "react";
import { useNavigate } from "react-router-dom";

// components
import UserDropdown from "../Dropdowns/UserDropdown.js";

export default function Navbar({ nombreUsuario }) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar tokens o llamar a la API de logout si tienes
    navigate("/login");
  };

  return (
    <>
      <nav className="absolute top-0 left-0 w-full z-10 bg-[#4551f7] md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <a
            className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
            href="#pablo"
            onClick={(e) => e.preventDefault()}
          >
            Sistema de Facturación Digital
          </a>
          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            {/* Pasamos el nombre de usuario al dropdown */}
            <UserDropdown nombreUsuario={nombreUsuario} onLogout={handleLogout} />
          </ul>
        </div>
      </nav>
    </>
  );
}
