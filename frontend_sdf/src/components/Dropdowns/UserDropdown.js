import React, { useState, useRef, useEffect } from "react";
import ReactImg from "../../assets/img/react.jpg";

export default function UserDropdown({ nombreUsuario, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen(!open);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
          <img
            src={ReactImg}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </span>
        <span className="text-white font-medium hidden md:inline">
          {nombreUsuario || "Usuario"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <a
              href="#profile"
              onClick={(e) => e.preventDefault()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Perfil
            </a>
            <a
              href="#logout"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
