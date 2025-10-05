import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminCustomers = () => {
  // Fetch customers and orders
  const {
    data: customers = [],
    isLoading: customersLoading,
    error: customersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/customers");
      return res.data ?? [];
    },
  });

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/orders");
      return res.data ?? [];
    },
  });

  const isLoading = customersLoading || ordersLoading;
  const error = customersError || ordersError;

  // Search state
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filtered by search
  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        !debounced ||
        c.customer_name?.toLowerCase().includes(debounced) ||
        c.order_reference?.toLowerCase().includes(debounced) ||
        c.table_number?.toLowerCase().includes(debounced)
    );
  }, [customers, debounced]);

  // Most frequent customers (by counting orders, not customer records)
  const frequentCustomers = useMemo(() => {
    // Group orders by customer_id
    const customerOrderCounts = {};

    orders.forEach((order) => {
      const customerId = order.customer_id;
      if (!customerOrderCounts[customerId]) {
        customerOrderCounts[customerId] = {
          count: 0,
          totalSpent: 0,
          customer: null,
        };
      }
      customerOrderCounts[customerId].count += 1;
      customerOrderCounts[customerId].totalSpent += Number(order.total_amount);
    });

    // Match with customer names
    customers.forEach((customer) => {
      if (customerOrderCounts[customer.customer_id]) {
        customerOrderCounts[customer.customer_id].customer = customer;
      }
    });

    // Convert to array and sort by order count
    return Object.values(customerOrderCounts)
      .filter((item) => item.customer) // Only include customers with names
      .map((item) => ({
        name: item.customer.customer_name || "Guest",
        count: item.count,
        totalSpent: item.totalSpent,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [orders, customers]);

  // Customer statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      avgOrderValue,
    };
  }, [customers, orders]);

  if (isLoading) return <p className="p-4">Loading customers...</p>;
  if (error) return <p className="p-4">Error loading customers</p>;

  const formatMoney = (amount) => `₱${Number(amount).toFixed(2)}`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">
              {formatMoney(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold">
              {formatMoney(stats.avgOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6 flex w-full max-w-sm">
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name, reference, or table…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Most Frequent Customers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Customers by Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {frequentCustomers.length === 0 ? (
            <p className="text-gray-500">No customer data</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequentCustomers.map((fc, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">#{i + 1}</TableCell>
                    <TableCell>{fc.name}</TableCell>
                    <TableCell>{fc.count} orders</TableCell>
                    <TableCell>{formatMoney(fc.totalSpent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customer Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Order Reference</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>{customer.customer_id}</TableCell>
                  <TableCell>{customer.customer_name || "Guest"}</TableCell>
                  <TableCell>{customer.table_number}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {customer.order_reference}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
