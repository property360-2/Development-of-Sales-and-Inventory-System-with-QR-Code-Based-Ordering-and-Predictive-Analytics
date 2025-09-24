// src/pages/admin/AdminCustomers.jsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/customers");
      return res.data ?? [];
    },
  });

  const customers = data ?? [];

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
        c.customer_name.toLowerCase().includes(debounced) ||
        c.order_reference.toLowerCase().includes(debounced)
    );
  }, [customers, debounced]);

  // Most frequent customers
  const frequentCustomers = useMemo(() => {
    const counts = {};
    filtered.forEach((c) => {
      counts[c.customer_name] = (counts[c.customer_name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filtered]);

  if (isLoading) return <p className="p-4">Loading customers...</p>;
  if (error) return <p className="p-4">Error loading customers</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      {/* Search only */}
      <div className="mb-6 flex w-full max-w-sm">
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Frequent Customers */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-3">
            Most Frequent Customers
          </h2>
          {frequentCustomers.length === 0 ? (
            <p className="text-gray-500">No customer data</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequentCustomers.map((fc, i) => (
                  <TableRow key={i}>
                    <TableCell>{fc.name}</TableCell>
                    <TableCell>{fc.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
