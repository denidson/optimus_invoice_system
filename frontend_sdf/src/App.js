import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListClients from "./pages/Clients/ListClients";
import FormClients from "./pages/Clients/FormClients";
import ListEndClients from "./pages/EndClients/ListEndClients";
import FormEndClients from "./pages/EndClients/FormEndClients";
import ListPreInvoices from "./pages/PreInvoices/ListPreInvoices";
import FormPreInvoices from "./pages/PreInvoices/FormPreInvoices";
import ListProducts from "./pages/Products/ListProducts";
import FormProducts from "./pages/Products/FormProducts";
import ListTaxes from "./pages/Config/ListTaxes";
import ListTypeTaxpayer from "./pages/Config/ListTypeTaxpayer";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ListInvoices from "./pages/Invoices/ListInvoices";
import ListAuditLogs from "./pages/Config/ListAuditLogs";
import ListConfigWithholdings from "./pages/Config/ListConfigWithholdings";
import ListCompanyUsers from "./pages/CompanyUsers/ListCompanyUsers";
import ListWithholdings from "./pages/Withholdings/ListWithholding";
import FormWithholding from "./pages/Withholdings/FormWithholding";
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

        {/* Clientes (solo operador) */}
          <Route
            path="/endClients"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <ListEndClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/endClients/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormEndClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/endClients/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormEndClients />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Productos y Servicios (solo admin) */}
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <ListProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
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
                <RoleRoute roles={["admin","operador_admin"]}>
                  <ListTaxes />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/taxpayer"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador_admin", "operador"]}>
                  <ListTypeTaxpayer />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          {/* Retenciones */}
          <Route
            path="/config-withholdings"
            element={
              <PrivateRoute>
                <RoleRoute  roles={["admin","operador_admin", "operador"]}>
                  <ListConfigWithholdings />
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
          {/* Retenciones */}
          <Route
            path="/withholdings"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin","operador_admin","operador"]}>
                  <ListWithholdings />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/withholdings/create"
            element={
              <PrivateRoute>
                <FormWithholding />
              </PrivateRoute>
            }
          />

          {/* Auditoria (solo admin) */}
          <Route
            path="/auditlogs"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin"]}>
                  <ListAuditLogs />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          {/* Usuarios de la empresa */}
          <Route
            path="/company-users"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin"]}>
                  <ListCompanyUsers />
                </RoleRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
