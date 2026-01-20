import React, { useEffect } from "react"; // ✅ import hooks
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Record from "./pages/Record";
import OrderOnline from "./pages/OrderOnline";
import Stock from "./pages/Stock";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// ✅ Dummy Data
import { recordData, onlineOrdersData } from "./data/dummyData";

export default function App() {

  // ✅ Initialize localStorage with dummy data
  useEffect(() => {
    if (!localStorage.getItem("records")) {
      localStorage.setItem("records", JSON.stringify(recordData));
    }
    if (!localStorage.getItem("onlineOrders")) {
      localStorage.setItem("onlineOrders", JSON.stringify(onlineOrdersData));
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/local-order"
            element={
              <ProtectedRoute>
                <Record />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-online"
            element={
              <ProtectedRoute>
                <OrderOnline />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
