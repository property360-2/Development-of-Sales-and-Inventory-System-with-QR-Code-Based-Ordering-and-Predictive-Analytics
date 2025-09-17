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
import { Loader2, Eye, ArrowRight, ShoppingCart, Coffee } from "lucide-react";

export default function OrdersPanel() {
  const { setViewOrder, cartCount } = usePOSStore();
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const queryClient = useQueryClient();

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

  const STATUS_FLOW = ["pending", "preparing", "ready", "served"];
  const nextStatus = (current) =>
    STATUS_FLOW[
      Math.min(STATUS_FLOW.indexOf(current) + 1, STATUS_FLOW.length - 1)
    ];

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
    onSettled: () => queryClient.invalidateQueries(["orders"]),
  });

  const filteredOrders = ordersData?.filter((o) => o.status !== "served") ?? [];

  return (
    <div className="p-4 w-full max-w-5xl mx-auto">
      <Card className="p-4 shadow-md relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h3 className="font-semibold text-lg">Orders</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Select
              value={orderStatusFilter}
              onValueChange={setOrderStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-36">
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
              className="w-full sm:w-40"
            />
          </div>
        </div>

        {/* Table visible only on desktop (>=768px) */}
        {!showOrdersPanel && (
          <div className="hidden md:block overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-6 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading orders...
              </div>
            ) : (
              <Table className="min-w-[500px]">
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
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500"
                      >
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
                        <TableCell className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewOrder(o)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
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
                            <ArrowRight className="w-4 h-4 mr-1" /> Next
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* Mobile floating Coffee button (<=768px) */}
        <div
          className="lg:hidden fixed bottom-20 right-5 flex items-center gap-2 z-50 cursor-pointer"
          onClick={() => setShowOrdersPanel(!showOrdersPanel)}
        >
          <div className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center bg-white">
            <Coffee className="w-6 h-6 text-gray-800" />
          </div>
        </div>

        {/* Mobile Orders Panel */}
        {showOrdersPanel && (
          <div className="md:hidden fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="w-4/5 max-w-xs bg-white h-full p-4 overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Orders</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOrdersPanel(false)}
                >
                  Close
                </Button>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  No active orders
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <Card key={o.order_id ?? o.id} className="p-3 shadow-sm mb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold">
                          ID: {o.order_id ?? o.id}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Customer:{" "}
                          {o.customer?.customer_name ?? o.customer_name ?? "—"}
                        </div>
                        <div className="text-sm capitalize mt-1">
                          Status: {o.status}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewOrder(o)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
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
                          <ArrowRight className="w-4 h-4 mr-1" /> Next
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
