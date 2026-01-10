import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";
import ListPreInvoices from "../../components/PreInvoices/ListPreInvoices";

export default function ListPreInvoicesPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      {/* Contenedor principal con separación y fondo blanco */}
      <div className="mt-8 px-4 md:px-8">
        <ListPreInvoices />
      </div>
    </AdminLayout>
  );
}
