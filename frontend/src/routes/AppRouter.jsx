import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import CashierDashboard from "../pages/CashierDashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute role="Cashier">
              <CashierDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LoginPage />} /> {/* fallback */}
      </Routes>
    </Router>
  );
}
