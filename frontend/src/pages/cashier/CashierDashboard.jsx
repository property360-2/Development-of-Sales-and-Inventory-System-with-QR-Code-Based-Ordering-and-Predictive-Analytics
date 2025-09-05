// src/pages/cashier/CashierDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LogOut,
  ShoppingCart,
  CreditCard,
  Receipt,
  ListChecks,
} from "lucide-react";

export default function CashierDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  // Redirect if not logged in or not cashier
  useEffect(() => {
    if (!user || user.role !== "Cashier") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          className="text-3xl font-extrabold text-gray-800"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {greeting}, {user?.name} 👋
        </motion.h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white flex gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/cashier/pos")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <ShoppingCart className="text-green-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">POS</h2>
              <p className="text-gray-500 text-sm mt-2">
                Take orders and manage walk-in sales.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/cashier/orders")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <ListChecks className="text-blue-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Orders</h2>
              <p className="text-gray-500 text-sm mt-2">
                View & update QR and cashier orders.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/cashier/payments")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CreditCard className="text-purple-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Payments</h2>
              <p className="text-gray-500 text-sm mt-2">
                Handle customer payments & status.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/cashier/receipts")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Receipt className="text-orange-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Receipts</h2>
              <p className="text-gray-500 text-sm mt-2">
                View and print customer receipts.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
