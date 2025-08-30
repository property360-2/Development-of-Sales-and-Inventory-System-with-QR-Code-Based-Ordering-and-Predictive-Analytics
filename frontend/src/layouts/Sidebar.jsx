// frontend/src/layouts/Sidebar.jsx
import { Link } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuthStore();

  const menuItems = {
    Admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Menus", path: "/admin/menus" },
      { name: "Users", path: "/admin/users" },
      { name: "Audit Logs", path: "/admin/audit-logs" },
    ],
    Cashier: [
      { name: "Dashboard", path: "/cashier" },
      { name: "Orders", path: "/cashier/orders" },
      { name: "Payments", path: "/cashier/payments" },
    ],
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        ></div>
      )}

      <div
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-gray-800 text-white transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <h2 className="text-xl font-bold p-4 border-b border-gray-700">
          🍽️ Restaurant
        </h2>

        {/* Role-based nav */}
        <nav className="p-4 space-y-2">
          {menuItems[user.role]?.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block py-2 px-3 rounded hover:bg-gray-700 transition"
              onClick={toggleSidebar} // auto-close sa mobile
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
