import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";
import ListProformas from "../../components/Proformas/ListProformas";

export default function ListProformasPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      {/* Contenedor principal con separación y fondo blanco */}
      <div className="mt-8 px-4 md:px-8">
        <ListProformas />
      </div>
    </AdminLayout>
  );
}
