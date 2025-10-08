import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function RoleRoute({ children, roles = [] }) {
  const { user } = useContext(AuthContext);

  if (!user || !roles.includes(user.rol)) {
    toast.error("No tienes permiso para acceder a esta sección");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
