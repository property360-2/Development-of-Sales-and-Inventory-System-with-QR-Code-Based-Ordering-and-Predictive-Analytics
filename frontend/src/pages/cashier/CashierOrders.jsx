// src/pages/cashier/CashierOrders.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";

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

const CashierOrders = () => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // queries
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/orders");
      return res.data;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/payments");
      return res.data;
    },
  });

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/customers");
      return res.data;
    },
  });

  // merge data
  const merged = useMemo(() => {
    if (!ordersQuery.data || !paymentsQuery.data || !customersQuery.data)
      return [];

    return ordersQuery.data.map((order) => {
      const customer = customersQuery.data.find(
        (c) => c.customer_id === order.customer_id
      );
      const payment = paymentsQuery.data.find(
        (p) => p.order_id === order.order_id
      );

      return {
        ...order,
        customer_name: customer ? customer.name : "—",
        payment_status: payment ? payment.status : "Unpaid",
        payment_method: payment ? payment.method : "—",
      };
    });
  }, [ordersQuery.data, paymentsQuery.data, customersQuery.data]);

  const filtered = merged.filter((row) => {
    const q = debounced.toLowerCase();
    return (
      row.order_id.toString().includes(q) ||
      row.customer_name.toLowerCase().includes(q)
    );
  });

  if (
    ordersQuery.isLoading ||
    paymentsQuery.isLoading ||
    customersQuery.isLoading
  )
    return <p className="p-4">Loading orders…</p>;

  if (ordersQuery.error || paymentsQuery.error || customersQuery.error)
    return <p className="p-4">Error fetching orders.</p>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by order ID or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.order_id}>
              <TableCell>{row.order_id}</TableCell>
              <TableCell>{row.customer_name}</TableCell>
              <TableCell>₱{row.total_amount}</TableCell>
              <TableCell>{row.payment_status}</TableCell>
              <TableCell>{row.payment_method}</TableCell>
              <TableCell>
                {row.created_at
                  ? new Date(row.created_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-sm text-muted-foreground"
              >
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashierOrders;
