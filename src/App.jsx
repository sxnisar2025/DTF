import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Record from "./pages/Record";
import Stock from "./pages/Stock";
import Customers from "./pages/Customers";
import Cashflow from "./pages/Cashflow";
import Order from "./pages/Order";
import Payment from "./pages/Payment";
import Invoice from "./pages/Invoice";


import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Dummy Data
import { recordData, onlineOrdersData } from "./data/dummyData";

export default function App() {

  // Initialize LocalStorage Dummy Data
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

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
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

          {/* ✅ NEW ORDER ROUTE */}
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute>
                <Invoice />
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

          <Route
            path="/cashflow"
            element={
              <ProtectedRoute>
                <Cashflow />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}
