import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ListClients from "./pages/Clients/ListClients";
import FormClients from "./pages/Clients/FormClients";
import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import Invoices from "./pages/Invoices";
// import InvoiceForm from "./pages/InvoiceForm";
import PrivateRoute from "./components/PrivateRoute";
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <ListClients />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients/edit"
            element={
              <PrivateRoute>
                <FormClients />
              </PrivateRoute>
            }
          />

          <Route
            path="/clients/create"
            element={
              <PrivateRoute>
                <FormClients />
              </PrivateRoute>
            }
          />

          {/* <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoices/new"
            element={
              <PrivateRoute>
                <InvoiceForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/invoices/edit/:id"
            element={
              <PrivateRoute>
                <InvoiceForm />
              </PrivateRoute>
            }
          /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
