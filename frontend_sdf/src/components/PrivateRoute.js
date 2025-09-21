import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // ⚡ Mientras cargamos el contexto, no hacemos nada
  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
