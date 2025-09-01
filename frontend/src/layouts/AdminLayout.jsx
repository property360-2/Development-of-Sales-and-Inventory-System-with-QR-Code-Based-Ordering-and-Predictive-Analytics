import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  LogOut,
  ShoppingCart,
  Users,
  FileText,
  ClipboardList,
} from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: FileText },
    { name: "Menus", path: "/admin/menus", icon: ShoppingCart },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Audit Logs", path: "/admin/logs", icon: ClipboardList },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-green-700 text-white shadow px-6 py-3 flex justify-between items-center">
        {/* Logo / Title */}
        <div
          className="text-2xl font-bold cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate("/admin")}
        >
          Admin Panel
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-2 rounded hover:bg-green-800 transition ${
                  isActive(item.path) ? "bg-green-900 font-semibold" : ""
                }`}
              >
                <Icon size={18} className="mr-2" /> {item.name}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded text-red-300 hover:text-red-500 hover:bg-green-800 transition"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 hover:bg-green-800 rounded"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-green-600 text-white flex flex-col space-y-1 shadow-lg"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 hover:bg-green-800 transition ${
                    isActive(item.path) ? "bg-green-800 font-semibold" : ""
                  }`}
                >
                  <Icon size={18} className="mr-2" /> {item.name}
                </button>
              );
            })}
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center px-4 py-3 text-red-300 hover:text-red-500 hover:bg-green-800 transition"
            >
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
