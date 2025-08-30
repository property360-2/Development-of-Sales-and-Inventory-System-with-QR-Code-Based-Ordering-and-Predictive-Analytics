// frontend/src/layouts/Navbar.jsx
import useAuthStore from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react"; // icon (install: npm i lucide-react)

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded hover:bg-gray-200"
        >
          <Menu size={24} />
        </button>
        <span className="font-semibold">
          {user?.role} Panel | Welcome, {user?.name}
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
