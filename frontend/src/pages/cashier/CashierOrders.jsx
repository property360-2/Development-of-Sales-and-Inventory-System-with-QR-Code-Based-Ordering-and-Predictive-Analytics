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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as HoverCard from "@radix-ui/react-hover-card";

// -----------------------
// View Order Modal
// -----------------------
function ViewOrderModal({ isOpen, onClose, order }) {
  if (!order) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <Dialog.Title className="text-lg font-bold mb-4">
          Order Details
        </Dialog.Title>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Order ID:</span> {order.order_id}
          </p>
          <p>
            <span className="font-semibold">Customer:</span>{" "}
            {order.customer_name}
          </p>
          <p>
            <span className="font-semibold">Total:</span> ₱{order.total_amount}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-semibold">Payment Status:</span>{" "}
            {order.payment_status}
          </p>
          <p>
            <span className="font-semibold">Payment Method:</span>{" "}
            {order.payment_method}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {order.order_timestamp
              ? new Date(order.order_timestamp).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>
          {order.items && order.items.length > 0 && (
            <div>
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-5">
                {order.items.map((item) => (
                  <li key={item.order_item_id}>
                    {item.menu.name} x {item.quantity} - ₱{item.price}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// -----------------------
// CashierOrders Component
// -----------------------
export default function CashierOrders() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [viewOrder, setViewOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // Today / Last7 / Last30 / All

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Queries
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axiosInstance.get("/orders")).data,
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await axiosInstance.get("/payments")).data,
  });

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await axiosInstance.get("/customers")).data,
  });

  // Merge orders with customer & payment info
  const mergedOrders = useMemo(() => {
    const orders = ordersQuery.data || [];
    const payments = paymentsQuery.data || [];
    const customers = customersQuery.data || [];

    return orders.map((order) => {
      const customer = customers.find(
        (c) => c.customer_id === order.customer_id
      );
      const payment = payments.find((p) => p.order_id === order.order_id);

      return {
        ...order,
        customer_name: customer ? customer.customer_name : "—",
        payment_status: payment ? payment.payment_status : "Unpaid",
        payment_method: payment ? payment.payment_method : "—",
      };
    });
  }, [ordersQuery.data, paymentsQuery.data, customersQuery.data]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return mergedOrders.filter((order) => {
      const q = debounced.toLowerCase();
      const matchesSearch =
        order.order_id.toString().includes(q) ||
        order.customer_name.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || order.payment_status === statusFilter;
      const matchesMethod =
        methodFilter === "all" || order.payment_method === methodFilter;

      // Date filter
      const orderDate = new Date(order.order_timestamp);
      let matchesDate = true;
      if (dateFilter === "today")
        matchesDate = orderDate.toDateString() === now.toDateString();
      else if (dateFilter === "last7")
        matchesDate = (now - orderDate) / (1000 * 60 * 60 * 24) <= 7;
      else if (dateFilter === "last30")
        matchesDate = (now - orderDate) / (1000 * 60 * 60 * 24) <= 30;

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [mergedOrders, debounced, statusFilter, methodFilter, dateFilter]);

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
      {/* Header + Search */}
      <div className="mb-4 flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Input
          placeholder="Search by order ID or customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="GCash">GCash</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last7">Last 7 Days</SelectItem>
            <SelectItem value="last30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("all");
            setMethodFilter("all");
            setDateFilter("all");
            setDebounced("");
            setSearch("");
          }}
        >
          Reset Filters
        </Button>
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredOrders.map((row) => (
            <TableRow key={row.order_id}>
              <TableCell>{row.order_id}</TableCell>
              <TableCell>{row.customer_name}</TableCell>
              <TableCell>₱{row.total_amount}</TableCell>
              <TableCell>{row.payment_status}</TableCell>
              <TableCell>{row.payment_method}</TableCell>
              <TableCell>
                {row.order_timestamp
                  ? new Date(row.order_timestamp).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </TableCell>
              <TableCell className="flex gap-2">
                <HoverCard.Root>
                  <HoverCard.Trigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewOrder(row)}
                    >
                      <Eye size={16} />
                    </Button>
                  </HoverCard.Trigger>
                  <HoverCard.Content
                    className="rounded-lg border bg-white p-3 shadow-md w-64"
                    side="top"
                    align="center"
                  >
                    <p className="text-xs text-gray-600">
                      {row.items
                        ?.map((i) => `${i.menu.name} x ${i.quantity}`)
                        .join(", ") || "No items"}
                    </p>
                    <p className="text-xs">Total: ₱{row.total_amount}</p>
                    <p className="text-xs">Payment: {row.payment_status}</p>
                  </HoverCard.Content>
                </HoverCard.Root>
              </TableCell>
            </TableRow>
          ))}

          {filteredOrders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-sm text-muted-foreground"
              >
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* View Order Modal */}
      {viewOrder && (
        <ViewOrderModal
          isOpen={!!viewOrder}
          onClose={() => setViewOrder(null)}
          order={viewOrder}
        />
      )}
    </div>
  );
}
