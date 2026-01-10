import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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
        <span className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-slate-400 text-white">
          <i className="fas fa-user-circle text-2xl"></i>
        </span>
        <span className="text-white font-medium hidden md:inline">
          {nombreUsuario || "Usuario"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)} // Cierra el dropdown
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Perfil
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
