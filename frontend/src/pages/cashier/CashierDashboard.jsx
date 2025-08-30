import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

export default function CashierDashboard() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if not logged in or not cashier
  useEffect(() => {
    if (!user || user.role !== "Cashier") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-4">
        <strong>User:</strong> {user?.name} | <strong>Role:</strong>{" "}
        {user?.role}
      </div>

      <div>
        <p>Token:</p>
        <code className="bg-gray-100 p-2 block break-all">{token}</code>
      </div>

      <div className="mt-6">
        <p>Manage Orders & Payments here...</p>
      </div>
    </div>
  );
}
