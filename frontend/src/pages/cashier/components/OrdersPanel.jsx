// frontend/src/pages/cashier/components/OrdersPanel.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { usePOSStore } from "../../../stores/usePOSStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function OrdersPanel() {
  const { setViewOrder, updateOrderStatus } = usePOSStore();
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const { data: ordersData } = useQuery({
    queryKey: ["orders", orderStatusFilter, orderSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== "all")
        params.append("status", orderStatusFilter);
      if (orderSearch) params.append("q", orderSearch);
      const res = await axiosInstance.get(`/orders?${params.toString()}`);
      return res.data?.data ?? [];
    },
    refetchInterval: 8000, // keep fresh in fast-paced env
  });

  const STATUS_FLOW = ["pending", "preparing", "ready", "served"];
  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Orders</h3>
        <div className="flex items-center gap-2">
          <Select
            value={orderStatusFilter}
            onValueChange={setOrderStatusFilter}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="served">Served</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!ordersData || ordersData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No orders
              </TableCell>
            </TableRow>
          ) : (
            ordersData.map((o) => (
              <TableRow key={o.order_id ?? o.id}>
                <TableCell>{o.order_id ?? o.id}</TableCell>
                <TableCell>
                  {o.customer?.customer_name ?? o.customer_name ?? "—"}
                </TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => setViewOrder(o)}>
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(o, nextStatus(o.status))}
                  >
                    Next
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
