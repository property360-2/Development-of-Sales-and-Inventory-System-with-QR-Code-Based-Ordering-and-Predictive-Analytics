import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, ShoppingCart, History, FileText } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export default function CashierLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center shadow">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/cashier")}
        >
          Cashier Panel
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 items-center">
          <button
            onClick={() => navigate("/cashier")}
            className="hover:underline"
          >
            <FileText size={16} className="inline mr-1" /> Dashboard
          </button>
          <button
            onClick={() => navigate("/cashier/orders")}
            className="hover:underline"
          >
            <ShoppingCart size={16} className="inline mr-1" /> Orders
          </button>
          <button
            onClick={handleLogout}
            className="text-red-300 hover:underline"
          >
            <LogOut size={16} className="inline mr-1" /> Logout
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-blue-600 text-white flex flex-col space-y-2 p-4 shadow-lg"
          >
            <button onClick={() => navigate("/cashier")} className="text-left">
              <FileText size={16} className="inline mr-1" /> Dashboard
            </button>
            <button
              onClick={() => navigate("/cashier/orders")}
              className="text-left"
            >
              <ShoppingCart size={16} className="inline mr-1" /> Orders
            </button>
            
            <button onClick={handleLogout} className="text-left text-red-300">
              <LogOut size={16} className="inline mr-1" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (Outlet for nested routes) */}
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
