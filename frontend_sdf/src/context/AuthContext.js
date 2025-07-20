import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );

  const login = (data) => {
    localStorage.setItem("usuario", JSON.stringify(data));
    setUsuario(data);
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};