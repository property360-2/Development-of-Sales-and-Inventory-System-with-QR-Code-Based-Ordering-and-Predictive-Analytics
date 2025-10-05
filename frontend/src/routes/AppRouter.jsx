import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMenus from "../pages/admin/AdminMenus";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminSalesAnalysis from "../pages/admin/AdminSalesAnalysis";
import AdminPredictiveAnalysis from "../pages/admin/AdminPredictiveAnalysis";
import AdminInventoryManagement from "../pages/admin/AdminInventoryManagementSystemAlerts";

// Cashier Pages
import CashierDashboard from "../pages/cashier/CashierDashboard";
import CashierOrders from "../pages/cashier/CashierOrders";
import CashierPOS from "../pages/cashier/CashierPOS";
import CheckoutPage from "../pages/cashier/components/CheckoutPage";

// Customer Pages
import CustomerOrderingInterface from "../pages/Customer/CustomerOrderingInterface";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />

        {/* Customer QR Ordering (Public - No Auth Required) */}
        <Route path="/qr-order" element={<CustomerOrderingInterface />} />

        {/* ================= ADMIN ROUTES ================= */}
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
          <Route path="sales-analysis" element={<AdminSalesAnalysis />} />
          <Route
            path="predictive-analysis"
            element={<AdminPredictiveAnalysis />}
          />
          <Route path="inventory" element={<AdminInventoryManagement />} />
        </Route>

        {/* ================= CASHIER ROUTES ================= */}
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
          <Route path="pos" element={<CashierPOS />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
