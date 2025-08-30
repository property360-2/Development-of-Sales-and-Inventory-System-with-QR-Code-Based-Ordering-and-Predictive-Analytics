import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMenus from "../pages/admin/AdminMenus";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";

// Cashier Pages
import CashierDashboard from "../pages/cashier/CashierDashboard";
import CashierOrders from "../pages/cashier/CashierOrders";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="menus" element={<AdminMenus />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="logs" element={<AdminAuditLogs />} />
        </Route>

        {/* ================= CASHIER ================= */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute role="Cashier">
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CashierDashboard />} />
          <Route path="orders" element={<CashierOrders />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
