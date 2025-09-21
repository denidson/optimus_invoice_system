import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⚡ estado de carga

  useEffect(() => {
    const storedUser = localStorage.getItem("authData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // ya cargó el estado del user
  }, []);

  const login = (data) => {
    setUser(data);
    localStorage.setItem("authData", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
