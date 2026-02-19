import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import FormProformas from '../../components/Proformas/FormProformas';
import AdminLayout from "../../layouts/AdminLayout";

export default function FormPreInvoicesPage() {
  const { user } = useContext(AuthContext);
  const nombreUsuario = user?.nombre || "Usuario";

  return (
    <AdminLayout nombreUsuario={nombreUsuario}>
      {/* Contenedor principal con separación y fondo blanco */}
      <div className="mt-8 px-4 md:px-8">
        <FormProformas />
      </div>
    </AdminLayout>
  );
}

