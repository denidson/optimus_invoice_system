import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("authData");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // Token ya expirado
      if (Date.now() >= parsedUser.expiresAt) {
        handleLogout(true);
      } else {
        setUser(parsedUser);
        startExpirationTimer(parsedUser.expiresAt);
      }
    }

    setLoading(false);
  }, []);

  const startExpirationTimer = (expiresAt) => {
    const timeLeft = expiresAt - Date.now();

    setTimeout(() => {
      handleLogout(true);
    }, timeLeft);
  };

  const login = (data) => {
    window._sessionExpired = false;

    const expiresAt = Date.now() + data.expires_in * 1000;

    const authData = {
      ...data,
      expiresAt,
    };

    setUser(authData);
    localStorage.setItem("authData", JSON.stringify(authData));
  };

  const handleLogout = (expired = false) => {
    setUser(null);
    localStorage.removeItem("authData");

    if (expired) {
      toast.warning("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
