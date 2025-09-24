// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Utensils,
  LogOut,
  Quote,
  UserCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");

  const quotes = [
    "Leadership is not about being in charge. It’s about taking care of those in your charge.",
    "Great leaders don’t set out to be a leader, they set out to make a difference.",
    "Teamwork makes the dream work.",
    "Good management is the art of making problems so interesting that everyone wants to deal with them.",
    "Efficiency is doing things right; effectiveness is doing the right things.",
    "A goal without a plan is just a wish.",
    "Small daily improvements lead to stunning results.",
    "Don’t just manage—lead, inspire, and empower.",
  ];

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Pick random quote on mount
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
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
          Welcome, Admin 👋
        </motion.h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white flex gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      {/* Quote of the day */}
      <motion.div
        className="mb-10 flex items-center bg-white shadow rounded-2xl p-6 border-l-4 border-blue-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Quote className="text-blue-500 mr-4" size={28} />
        <p className="text-gray-600 italic">{quote}</p>
      </motion.div>

      {/* Quick Actions / Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/admin/menus")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Utensils className="text-green-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Manage Menus</h2>
              <p className="text-gray-500 text-sm mt-2">
                Add, view, and organize food & drinks.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/admin/users")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Users className="text-blue-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">User Management</h2>
              <p className="text-gray-500 text-sm mt-2">
                Create, view, and manage system users.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/admin/customers")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <UserCircle className="text-orange-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Customer Management</h2>
              <p className="text-gray-500 text-sm mt-2">
                View and manage customer records.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Card
            onClick={() => navigate("/admin/logs")}
            className="cursor-pointer hover:shadow-lg transition rounded-2xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BookOpen className="text-purple-600 mb-3" size={36} />
              <h2 className="font-bold text-lg">Audit Logs</h2>
              <p className="text-gray-500 text-sm mt-2">
                Review activity and system history.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
