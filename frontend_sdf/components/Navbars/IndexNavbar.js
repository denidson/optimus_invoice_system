/*eslint-disable*/
import React from "react";
import { Link, useNavigate } from "react-router-dom";
// components

import UserDropdown from "../Dropdowns/UserDropdown.js";

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    // 👉 Aquí pones tu lógica de cerrar sesión, por ejemplo limpiar tokens
    // localStorage.removeItem("token");
    // o llamar a una API para cerrar sesión
    // Luego rediriges:
    navigate("/login");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
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
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
