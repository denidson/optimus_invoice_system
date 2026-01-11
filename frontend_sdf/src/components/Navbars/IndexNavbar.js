import React from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Navbar({ nombreUsuario }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // o lo que uses
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 w-full z-20 bg-[#4551f7] flex items-center p-4">
      <div className="w-full mx-auto flex justify-between items-center px-4 md:px-10">
        <a
          className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
          href="#pablo"
          onClick={(e) => e.preventDefault()}
        >
          Quantus Invoice
        </a>

        <div className="flex items-center gap-4">
          <UserDropdown
            nombreUsuario={nombreUsuario}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}
