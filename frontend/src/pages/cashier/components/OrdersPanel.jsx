// frontend/src/pages/cashier/components/OrdersPanel.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card } from "@/components/ui/card";
import { Loader2, Eye, ArrowRight } from "lucide-react";

export default function OrdersPanel() {
  const { setViewOrder } = usePOSStore();
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", orderStatusFilter, orderSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== "all")
        params.append("status", orderStatusFilter);
      if (orderSearch) params.append("q", orderSearch);
      const res = await axiosInstance.get(`/orders?${params.toString()}`);
      return res.data?.data ?? [];
    },
    refetchInterval: 8000,
  });

  // Status flow
  const STATUS_FLOW = ["pending", "preparing", "ready", "served"];
  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
  };

  // Optimistic update
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });
      return { orderId, newStatus };
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries(["orders"]);
      const previousOrders = queryClient.getQueryData([
        "orders",
        orderStatusFilter,
        orderSearch,
      ]);

      queryClient.setQueryData(
        ["orders", orderStatusFilter, orderSearch],
        (old) =>
          old
            ? old.map((o) =>
                o.order_id === orderId ? { ...o, status: newStatus } : o
              )
            : []
      );

      return { previousOrders };
    },
    onError: (_, __, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", orderStatusFilter, orderSearch],
          context.previousOrders
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  // Hide served orders
  const filteredOrders = ordersData?.filter((o) => o.status !== "served") ?? [];

  return (
    <Card className="p-4 max-h-[55vh] overflow-y-auto shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Orders</h3>
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
            </SelectContent>
          </Select>
          <Input
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading orders...
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No active orders
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <TableRow key={o.order_id ?? o.id}>
                  <TableCell>{o.order_id ?? o.id}</TableCell>
                  <TableCell>
                    {o.customer?.customer_name ?? o.customer_name ?? "—"}
                  </TableCell>
                  <TableCell className="capitalize">{o.status}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewOrder(o)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        updateOrderStatus.mutate({
                          orderId: o.order_id ?? o.id,
                          newStatus: nextStatus(o.status),
                        })
                      }
                      disabled={updateOrderStatus.isLoading}
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Next
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
