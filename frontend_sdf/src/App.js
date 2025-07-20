import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function RutaPrivada({ children }) {
  const { usuario } = React.useContext(AuthContext);
  return usuario ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RutaPrivada>
                <Dashboard />
              </RutaPrivada>
            }
          />
          <Route
            path="/clientes"
            element={
              <RutaPrivada>
                <Clientes />
              </RutaPrivada>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;