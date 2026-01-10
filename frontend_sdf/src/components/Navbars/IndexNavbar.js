import React from "react";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Navbar({ nombreUsuario }) {
  return (
    <nav className="sticky top-0 w-full z-20 bg-[#4551f7] flex items-center p-4 shadow">
      <div className="w-full mx-auto flex justify-between items-center px-4 md:px-10">
        {/* Brand */}
        <a
          className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
          href="#pablo"
          onClick={(e) => e.preventDefault()}
        >
          Quantus Invoice
        </a>

        {/* UserDropdown con nombre directamente */}
        <div className="flex items-center gap-4">
          <UserDropdown nombreUsuario={nombreUsuario} />
        </div>
      </div>
    </nav>
  );
}
