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
  BarChart3,
  TrendingUp,
  Package,
  ClipboardList,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");

  const quotes = [
    "Leadership is not about being in charge. It's about taking care of those in your charge.",
    "Great leaders don't set out to be a leader, they set out to make a difference.",
    "Teamwork makes the dream work.",
    "Good management is the art of making problems so interesting that everyone wants to deal with them.",
    "Efficiency is doing things right; effectiveness is doing the right things.",
    "A goal without a plan is just a wish.",
    "Small daily improvements lead to stunning results.",
    "Don't just manage—lead, inspire, and empower.",
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

  const managementCards = [
    {
      title: "Manage Menus",
      description: "Add, view, and organize food & drinks.",
      icon: Utensils,
      color: "text-green-600",
      path: "/admin/menus",
    },
    {
      title: "User Management",
      description: "Create, view, and manage system users.",
      icon: Users,
      color: "text-blue-600",
      path: "/admin/users",
    },
    {
      title: "Customer Management",
      description: "View customer insights and statistics.",
      icon: UserCircle,
      color: "text-orange-600",
      path: "/admin/customers",
    },
    {
      title: "Audit Logs",
      description: "Review activity and system history.",
      icon: ClipboardList,
      color: "text-purple-600",
      path: "/admin/logs",
    },
  ];

  const analyticsCards = [
    {
      title: "Sales Analysis",
      description: "View revenue trends and top items.",
      icon: BarChart3,
      color: "text-cyan-600",
      path: "/admin/sales-analysis",
    },
    {
      title: "Predictive Analysis",
      description: "7-day sales forecast with AI insights.",
      icon: TrendingUp,
      color: "text-emerald-600",
      path: "/admin/predictive-analysis",
    },
    {
      title: "Inventory Management",
      description: "Track stock levels and alerts.",
      icon: Package,
      color: "text-amber-600",
      path: "/admin/inventory",
    },
  ];

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

      {/* Management Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Core Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {managementCards.map((card, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }}>
              <Card
                onClick={() => navigate(card.path)}
                className="cursor-pointer hover:shadow-lg transition rounded-2xl"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <card.icon className={`${card.color} mb-3`} size={36} />
                  <h2 className="font-bold text-lg">{card.title}</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Analytics & Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsCards.map((card, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }}>
              <Card
                onClick={() => navigate(card.path)}
                className="cursor-pointer hover:shadow-lg transition rounded-2xl"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <card.icon className={`${card.color} mb-3`} size={36} />
                  <h2 className="font-bold text-lg">{card.title}</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
