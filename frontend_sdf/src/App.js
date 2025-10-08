import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListClients from "./pages/Clients/ListClients";
import FormClients from "./pages/Clients/FormClients";
import ListPreInvoices from "./pages/PreInvoices/ListPreInvoices";
import FormPreInvoices from "./pages/PreInvoices/FormPreInvoices";
import ListProducts from "./pages/Products/ListProducts";
import FormProducts from "./pages/Products/FormProducts";
import ListTaxes from "./pages/Config/ListTaxes";
import ListTypeTaxpayer from "./pages/Config/ListTypeTaxpayer";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ListInvoices from "./pages/Invoices/ListInvoices";
// import Invoices from "./pages/Invoices";
// import InvoiceForm from "./pages/InvoiceForm";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute"; // Nuevo
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Rutas privadas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Pre-facturación (todos los roles autenticados) */}
          <Route
            path="/preinvoices"
            element={
              <PrivateRoute>
                <ListPreInvoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/preinvoices/edit"
            element={
              <PrivateRoute>
                <FormPreInvoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/preinvoices/create"
            element={
              <PrivateRoute>
                <FormPreInvoices />
              </PrivateRoute>
            }
          />

          {/* Clientes (solo admin) */}
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin"]}>
                  <ListClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/clients/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin"]}>
                  <FormClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/clients/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin"]}>
                  <FormClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Productos y Servicios (solo admin) */}
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador"]}>
                  <ListProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador"]}>
                  <FormProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador"]}>
                  <FormProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Impuestos y tipos de contribuyentes (solo admin) */}
          <Route
            path="/taxes"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador"]}>
                  <ListTaxes />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/taxpayer"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador"]}>
                  <ListTypeTaxpayer />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Facturación (todos los roles autenticados) */}
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <ListInvoices />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
