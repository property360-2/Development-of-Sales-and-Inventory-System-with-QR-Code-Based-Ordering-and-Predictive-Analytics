// frontend/src/pages/cashier/components/OrdersPanel.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { usePOSStore } from "../../../stores/usePOSStore";
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
import { Loader2, Eye, ArrowRight, Coffee } from "lucide-react";

const STATUS_FLOW = ["pending", "preparing", "ready", "served"];
const nextStatus = (current) =>
  STATUS_FLOW[
    Math.min(STATUS_FLOW.indexOf(current) + 1, STATUS_FLOW.length - 1)
  ];

const statusBadgeClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "preparing":
      return "bg-sky-100 text-sky-800";
    case "ready":
      return "bg-emerald-100 text-emerald-800";
    case "served":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/* ✅ Memoized Row for Desktop */
const OrderRow = React.memo(function OrderRow({
  order,
  onView,
  onNext,
  isLoading,
}) {
  return (
    <tr key={order.order_id ?? order.id} className="border-t">
      {/* ID */}
      <td className="py-3 align-top">{order.order_id ?? order.id}</td>

      {/* Customer */}
      <td className="py-3 align-top">
        <div
          className="truncate max-w-[20ch] whitespace-nowrap"
          title={order.customer?.customer_name ?? order.customer_name ?? "—"}
        >
          {order.customer?.customer_name ?? order.customer_name ?? "—"}
        </div>
      </td>

      {/* Status */}
      <td className="py-3 align-top">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusBadgeClass(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 align-top text-right">
        <div className="inline-flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onView(order)}
            title="View"
            aria-label={`View order ${order.order_id ?? order.id}`}
            className="w-8 h-8"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="default"
            onClick={() => onNext(order)}
            disabled={isLoading}
            title="Next"
            aria-label={`Advance order ${order.order_id ?? order.id}`}
            className="w-8 h-8"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

/* ✅ Memoized Card for Mobile */
const MobileOrderCard = React.memo(function MobileOrderCard({
  order,
  onView,
  onNext,
  isLoading,
}) {
  return (
    <div
      key={order.order_id ?? order.id}
      className="p-3 shadow-sm mb-2 rounded-md border"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            ID: {order.order_id ?? order.id}
          </div>
          <div
            className="text-sm text-muted-foreground mt-1 truncate"
            title={order.customer?.customer_name ?? order.customer_name ?? "—"}
          >
            Customer:{" "}
            {order.customer?.customer_name ?? order.customer_name ?? "—"}
          </div>
          <div className="text-sm capitalize mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClass(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 ml-2">
          <Button size="sm" variant="outline" onClick={() => onView(order)}>
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => onNext(order)}
            disabled={isLoading}
          >
            <ArrowRight className="w-4 h-4 mr-1" /> Next
          </Button>
        </div>
      </div>
    </div>
  );
});

export default function OrdersPanel() {
  const setViewOrder = usePOSStore((s) => s.setViewOrder);

  const [orderSearch, setOrderSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);

  const queryClient = useQueryClient();
  const contentRef = useRef(null);

  /* ✅ Debounced search */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(orderSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [orderSearch]);

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ["orders", orderStatusFilter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderStatusFilter !== "all")
        params.append("status", orderStatusFilter);
      if (debouncedSearch) params.append("q", debouncedSearch);
      const res = await axiosInstance.get(`/orders?${params.toString()}`);
      return res.data?.data ?? [];
    },
    staleTime: 5_000,
    keepPreviousData: true,
    refetchInterval: 8_000,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });
      return { orderId, newStatus };
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries(["orders"]);
      const key = ["orders", orderStatusFilter, debouncedSearch];
      const previousOrders = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) =>
        old.map((o) =>
          o.order_id === orderId ? { ...o, status: newStatus } : o
        )
      );
      return { previousOrders, key };
    },
    onError: (_, __, context) => {
      if (context?.previousOrders && context?.key) {
        queryClient.setQueryData(context.key, context.previousOrders);
      }
    },
    onSettled: () => queryClient.invalidateQueries(["orders"]),
  });

  const filteredOrders = useMemo(
    () => (ordersData ?? []).filter((o) => o.status !== "served"),
    [ordersData]
  );

  /* ✅ Stable callbacks */
  const handleView = useCallback(
    (order) => setViewOrder(order),
    [setViewOrder]
  );

  const handleNext = useCallback(
    (order) => {
      const id = order.order_id ?? order.id;
      const newStatus = nextStatus(order.status);
      if (!id || !newStatus) return;
      updateOrderStatus.mutate({ orderId: id, newStatus });
    },
    [updateOrderStatus]
  );

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [ordersData]);

  return (
    <div className="p-4 w-full max-w-5xl mx-auto">
      <Card className="p-4 shadow-md relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h3 className="font-semibold text-lg">Orders</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-shrink-0 w-full sm:w-36">
              <Select
                value={orderStatusFilter}
                onValueChange={setOrderStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0">
              <Input
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Desktop */}
        {!showOrdersPanel && (
          <div
            ref={contentRef}
            className="hidden md:block overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "48vh" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-6 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading orders...
              </div>
            ) : (
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-2">ID</th>
                    <th className="text-left py-2 pr-2">Customer</th>
                    <th className="text-left py-2 pr-2">Status</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-500 py-6"
                      >
                        No active orders
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <OrderRow
                        key={o.order_id ?? o.id}
                        order={o}
                        onView={handleView}
                        onNext={handleNext}
                        isLoading={updateOrderStatus.isLoading}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Mobile Floating Button */}
        <div
          className="lg:hidden fixed bottom-20 right-5 flex items-center gap-2 z-50 cursor-pointer"
          onClick={() => setShowOrdersPanel(!showOrdersPanel)}
          role="button"
          aria-label="Toggle orders panel"
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
                  <MobileOrderCard
                    key={o.order_id ?? o.id}
                    order={o}
                    onView={handleView}
                    onNext={handleNext}
                    isLoading={updateOrderStatus.isLoading}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
