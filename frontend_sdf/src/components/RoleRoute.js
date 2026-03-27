import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function RoleRoute({ children, roles = [] }) {
  const { user } = useContext(AuthContext);

  const hasAccess = user && roles.includes(user.rol);

  useEffect(() => {
    if (user && !hasAccess) {
      toast.error("No tienes permiso para acceder a esta sección");
    }
  }, [user, hasAccess]);

  if (!user) return null;

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}