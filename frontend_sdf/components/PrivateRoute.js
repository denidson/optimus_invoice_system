import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Si no hay sesión, redirige a login
    return <Navigate to="/" replace />;
  }

  // Si hay sesión, renderiza el componente hijo
  return children;
}
