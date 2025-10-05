import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";

export default function AdminSalesAnalysis() {
  const [timeRange, setTimeRange] = React.useState("7days");

  // Fetch all data
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axiosInstance.get("/orders")).data,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await axiosInstance.get("/payments")).data,
  });

  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => (await axiosInstance.get("/menus")).data,
  });

  const isLoading = ordersLoading || paymentsLoading || menusLoading;

  // Filter data by time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const ranges = {
      "7days": 7,
      "30days": 30,
      "90days": 90,
      all: Infinity,
    };
    const days = ranges[timeRange];

    return orders.filter((order) => {
      const orderDate = new Date(order.order_timestamp || order.created_at);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      return diffDays <= days;
    });
  }, [orders, timeRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0
    );
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customer_id))
      .size;

    // Calculate growth (compare with previous period)
    const halfwayPoint = Math.floor(filteredOrders.length / 2);
    const recentRevenue = filteredOrders
      .slice(0, halfwayPoint)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    const olderRevenue = filteredOrders
      .slice(halfwayPoint)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    const revenueGrowth =
      olderRevenue > 0
        ? ((recentRevenue - olderRevenue) / olderRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      revenueGrowth,
    };
  }, [filteredOrders]);

  // Sales by day
  const salesByDay = useMemo(() => {
    const grouped = {};
    filteredOrders.forEach((order) => {
      const date = new Date(
        order.order_timestamp || order.created_at
      ).toLocaleDateString("en-PH");
      if (!grouped[date]) grouped[date] = { date, revenue: 0, orders: 0 };
      grouped[date].revenue += Number(order.total_amount);
      grouped[date].orders += 1;
    });
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredOrders]);

  // Top selling items
  const topItems = useMemo(() => {
    const itemSales = {};
    filteredOrders.forEach((order) => {
      (order.items || order.order_items || []).forEach((item) => {
        const name = item.menu?.name || item.name || "Unknown";
        if (!itemSales[name]) {
          itemSales[name] = { name, quantity: 0, revenue: 0 };
        }
        itemSales[name].quantity += item.quantity;
        itemSales[name].revenue += item.quantity * item.price;
      });
    });
    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categorySales = {};
    filteredOrders.forEach((order) => {
      (order.items || order.order_items || []).forEach((item) => {
        const menu = menus.find((m) => m.menu_id === item.menu_id);
        const category = menu?.category || "Unknown";
        if (!categorySales[category]) {
          categorySales[category] = { name: category, value: 0 };
        }
        categorySales[category].value += item.quantity * item.price;
      });
    });
    return Object.values(categorySales);
  }, [filteredOrders, menus]);

  // Payment method distribution
  const paymentMethods = useMemo(() => {
    const methods = {};
    payments.forEach((payment) => {
      const method = payment.payment_method || "Unknown";
      if (!methods[method]) methods[method] = { name: method, value: 0 };
      methods[method].value += Number(payment.amount_paid);
    });
    return Object.values(methods);
  }, [payments]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const formatMoney = (value) => `₱${Number(value).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatMoney(kpis.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {kpis.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      kpis.revenueGrowth >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {Math.abs(kpis.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{kpis.totalOrders}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  {formatMoney(kpis.avgOrderValue)}
                </p>
              </div>
              <Package className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{kpis.uniqueCustomers}</p>
              </div>
              <Users className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Bar dataKey="value" fill="#f59e0b" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
