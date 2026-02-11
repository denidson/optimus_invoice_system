import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Páginas públicas
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";

// Páginas privadas
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
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
import ListInvoices from "./pages/Invoices/ListInvoices";
import ListAuditLogs from "./pages/Config/ListAuditLogs";
import ListConfigWithholdings from "./pages/Config/ListConfigWithholdings";
import ListCompanyUsers from "./pages/CompanyUsers/ListCompanyUsers";
import FormCompanyUsers from "./pages/CompanyUsers/FormCompanyUsers";
import ListWithholdings from "./pages/Withholdings/ListWithholding";
import FormWithholding from "./pages/Withholdings/FormWithholding";
import ListDispatchGuide from "./pages/DispatchGuide/ListDispatchGuide";
import FormDispatchGuide from "./pages/DispatchGuide/FormDispatchGuide";
import ListCreditNote from "./pages/CreditNote/ListCreditNote";
import ListCreditDebit from "./pages/DebitNote/ListDebitNote";

// Seguridad
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 🔔 Toast global (Axios y AuthContext lo usan) */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          pauseOnHover
          newestOnTop
        />

        <Routes>
          {/* =================== */}
          {/* Rutas públicas */}
          {/* =================== */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* =================== */}
          {/* Rutas privadas */}
          {/* =================== */}
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

          {/* Pre-facturación */}
          <Route
            path="/preinvoices"
            element={
              <PrivateRoute>
                <ListPreInvoices />
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
          <Route
            path="/preinvoices/edit"
            element={
              <PrivateRoute>
                <FormPreInvoices />
              </PrivateRoute>
            }
          />

          {/* Clientes (admin) */}
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
            path="/clients/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin"]}>
                  <FormClients />
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

          {/* Clientes finales */}
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
            path="/endClients/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormEndClients />
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

          {/* Productos */}
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador", "admin"]}>
                  <ListProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador", "admin"]}>
                  <FormProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/products/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador", "admin"]}>
                  <FormProducts />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Configuración */}
          <Route
            path="/taxes"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin"]}>
                  <ListTaxes />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/taxpayer"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
                  <ListTypeTaxpayer />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/config-withholdings"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
                  <ListConfigWithholdings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Facturación */}
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <ListInvoices />
              </PrivateRoute>
            }
          />
          {/* Notas de Crédito */}
          <Route
            path="/credit-note"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
                  <ListCreditNote />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          {/* Notas de Débito */}
          <Route
            path="/debit-note"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
                  <ListCreditDebit />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          {/* Retenciones */}
          <Route
            path="/withholdings"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
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
        {/* Guia de despacho */}
          <Route
            path="/dispatch-guide"
            element={
              <PrivateRoute>
                <RoleRoute roles={["admin", "operador_admin", "operador"]}>
                  <ListDispatchGuide />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/dispatch-guide/create"
            element={
              <PrivateRoute>
                <FormDispatchGuide />
              </PrivateRoute>
            }
          />

          {/* Auditoría */}
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

          {/* Usuarios empresa */}
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
          <Route
            path="/company-users/create"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormCompanyUsers />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/company-users/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["operador_admin", "operador"]}>
                  <FormCompanyUsers />
                </RoleRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;