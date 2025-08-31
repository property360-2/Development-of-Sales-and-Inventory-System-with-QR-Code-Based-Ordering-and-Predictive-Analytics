import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, ShoppingCart, History, FileText } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FileText size={16} className="inline mr-1" />,
    },
    {
      name: "Menus",
      path: "/admin/menus",
      icon: <ShoppingCart size={16} className="inline mr-1" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <History size={16} className="inline mr-1" />,
    },
    {
      name: "Audit Logs",
      path: "/admin/logs",
      icon: <LogOut size={16} className="inline mr-1" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-green-700 text-white px-4 py-3 flex justify-between items-center shadow">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/admin")}
        >
          Admin Panel
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 items-center">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="hover:underline"
            >
              {item.icon} {item.name}
            </button>
          ))}
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
            className="md:hidden bg-green-600 text-white flex flex-col space-y-2 p-4 shadow-lg"
          >
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="text-left"
              >
                {item.icon} {item.name}
              </button>
            ))}
            <button onClick={handleLogout} className="text-left text-red-300">
              <LogOut size={16} className="inline mr-1" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
