import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow px-4 py-4 flex justify-between">
      <div className="font-bold text-lg">Notus React SFD</div>
      <div>
        {usuario ? (
          <>
            <span className="mr-4">Hola, {usuario.nombre}</span>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;