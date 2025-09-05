import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import useAuthStore from "../../stores/useAuthStore";

// shadcn v5 imports (grouped by component type)
import { Card, CardContent } from "@/components/ui/card";

import { Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// icons
import { ShoppingCart, Printer } from "lucide-react";

// animations
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-featured Cashier POS
 * - Fetches menus
 * - Add/edit cart
 * - Checkout -> creates order (preparing) + payment
 * - Shows live orders list (QR & Counter)
 * - Update order status (preparing -> ready -> served)
 * - View order details + print receipt
 *
 * Drop this file into: src/pages/cashier/CashierPOS.jsx
 * Requires: QueryClientProvider at app root, axiosInstance and useAuthStore
 */

export default function CashierPOS() {
  const { user } = useAuthStore(); // { user_id, name, role }
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]); // items: { id, menu_id, name, price, qty, category }
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Orders panel
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [viewOrder, setViewOrder] = useState(null);

  // Categories (you can sync this with backend categories later)
  const categories = ["all", "food", "beverages", "dessert", "snack"];

  // --- MENUS ---
  const {
    data: menusRaw,
    isLoading: menusLoading,
    error: menusError,
  } = useQuery({
    queryKey: ["menus", "pos", { per_page: 200 }],
    queryFn: async () => {
      const res = await axiosInstance.get("/menus?per_page=200");
      // normalize to array
      return res.data?.data ?? [];
    },
    keepPreviousData: true,
  });

  // Filtered menus for UI
  const filteredMenus = (menusRaw || []).filter((m) => {
    const byCategory =
      selectedCategory === "all" || !selectedCategory
        ? true
        : m.category === selectedCategory;
    const bySearch =
      !search || m.name.toLowerCase().includes(search.toLowerCase());
    return byCategory && bySearch;
  });

  // --- ORDERS (live list) ---
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: [
      "orders",
      ordersPage,
      ordersPerPage,
      orderStatusFilter,
      orderSearch,
    ],
    queryFn: async () => {
      // build params
      const params = new URLSearchParams();
      params.append("page", ordersPage);
      params.append("per_page", ordersPerPage);
      if (orderStatusFilter && orderStatusFilter !== "all")
        params.append("status", orderStatusFilter);
      if (orderSearch) params.append("q", orderSearch);

      const res = await axiosInstance.get(`/orders?${params.toString()}`);
      return res.data; // expect paginated response
    },
    keepPreviousData: true,
  });

  const orders = ordersData?.data ?? [];
  const ordersMeta = ordersData ?? null;

  // --- CART MANAGEMENT ---
  function addToCart(menu) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_id === menu.menu_id);
      if (existing)
        return prev.map((i) =>
          i.menu_id === menu.menu_id ? { ...i, qty: i.qty + 1 } : i
        );
      return [
        ...prev,
        {
          id: menu.menu_id,
          menu_id: menu.menu_id,
          name: menu.name,
          price: Number(menu.price),
          qty: 1,
          category: menu.category,
        },
      ];
    });
  }

  function updateCartQty(menu_id, delta) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menu_id === menu_id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  function removeFromCart(menu_id) {
    setCart((prev) => prev.filter((i) => i.menu_id !== menu_id));
  }

  function cartTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  // --- MUTATIONS ---
  const checkoutMutation = useMutation({
    mutationFn: async ({ order_type = "take-out", customer_id = null }) => {
      if (!cart || cart.length === 0) throw new Error("Cart is empty");

      // create order payload
      const payload = {
        customer_id: customer_id,
        handled_by: user?.user_id ?? null,
        order_type: order_type, // dine-in | take-out
        order_source: "Counter",
        status: "preparing",
        total_amount: cartTotal(),
        items: cart.map((i) => ({
          menu_id: i.menu_id,
          quantity: i.qty,
          price: i.price,
        })),
      };

      const orderRes = await axiosInstance.post("/orders", payload);
      const newOrderId = orderRes.data?.order_id ?? orderRes.data?.id ?? null;

      // create payment (mark completed for cash/card; for gcash could be pending in another flow)
      await axiosInstance.post("/payments", {
        order_id: newOrderId,
        amount_paid: cartTotal(),
        payment_method: paymentMethod,
        payment_status: "completed",
      });

      return { order: orderRes.data };
    },
    onSuccess: (data) => {
      setCart([]);
      setPaymentDialogOpen(false);
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["menus"]);
      queryClient.invalidateQueries(["payments"]);
      // show confirmation
      const createdId = data?.order?.order_id ?? data?.order?.id;
      alert(
        `Order #${
          createdId ?? "(unknown)"
        } placed — kitchen notified (preparing).`
      );
    },
    onError: (err) => {
      console.error("Checkout failed", err);
      alert("Checkout failed: " + (err?.message || "Unknown error"));
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ order_id, status }) => {
      // patch order status
      const res = await axiosInstance.patch(`/orders/${order_id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to update order status");
    },
  });

  // --- ORDER VIEW / PRINT ---
  function openOrderDetail(order) {
    setViewOrder(order);
  }

  function closeOrderDetail() {
    setViewOrder(null);
  }

  function printReceipt(order) {
    // build simple printable HTML
    const lines = [];
    lines.push(`<h2>Receipt — Order #${order.order_id ?? order.id}</h2>`);
    lines.push(`<p>Cashier: ${user?.name ?? "-"}</p>`);
    lines.push(
      `<p>Date: ${new Date(
        order.order_timestamp ?? order.created_at ?? Date.now()
      ).toLocaleString()}</p>`
    );
    lines.push("<hr/>");
    lines.push("<ul>");
    (order.order_items || []).forEach((it) => {
      lines.push(
        `<li>${
          it.name ?? it.menu?.name ?? it.menu_name ?? "ID:" + it.menu_id
        } x ${it.quantity} — ₱${(
          (it.price ?? it.unit_price ?? 0) * it.quantity
        ).toFixed(2)}</li>`
      );
    });
    lines.push("</ul>");
    lines.push(
      `<p><strong>Total: ₱${(order.total_amount ?? cartTotal()).toFixed(
        2
      )}</strong></p>`
    );

    const newWindow = window.open("", "PRINT", "height=600,width=400");
    if (!newWindow) return alert("Unable to open print window (popup blocked)");
    newWindow.document.write("<html><head><title>Receipt</title></head><body>");
    newWindow.document.write(lines.join("\n"));
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }

  // --- helpers for status buttons ---
  const STATUS_FLOW = ["pending", "preparing", "ready", "served", "completed"];

  function nextStatus(current) {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1) return "preparing";
    return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
  }

  // --- UI ---
  return (
    <div className="min-h-screen p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left / Center: POS menu + controls */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />

          <div className="hidden sm:flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="ml-2 text-sm">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Categories as always-visible buttons for speed */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[65vh] p-1">
          {menusLoading ? (
            <p>Loading menus...</p>
          ) : (
            filteredMenus.map((m) => (
              <Card
                key={m.menu_id}
                className="rounded-lg shadow hover:shadow-md transition"
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="w-full text-center">
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.category}</div>
                    <div className="mt-2 font-bold">
                      ₱{Number(m.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQty(m.menu_id, -1);
                      }}
                    >
                      -
                    </Button>
                    <div className="min-w-[36px] text-center">
                      {cart.find((c) => c.menu_id === m.menu_id)?.qty ?? 0}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQty(m.menu_id, +1);
                      }}
                    >
                      +
                    </Button>
                  </div>

                  <Button className="mt-3 w-full" onClick={() => addToCart(m)}>
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right: Orders list & Cart summary */}
      <div className="flex flex-col gap-4">
        {/* Orders Panel */}
        <div className="bg-white shadow rounded-lg p-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Orders</h3>
            <div className="flex items-center gap-2">
              <Select
                value={orderStatusFilter}
                onValueChange={(v) => setOrderStatusFilter(v)}
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
                <TableHead>Source</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-gray-500"
                  >
                    No orders
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.order_id ?? o.id}>
                    <TableCell>{o.order_id ?? o.id}</TableCell>
                    <TableCell>
                      {o.customer?.customer_name ?? o.customer_name ?? "—"}
                    </TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>{o.order_source}</TableCell>
                    <TableCell>
                      {new Date(
                        o.order_timestamp ?? o.created_at
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => openOrderDetail(o)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            order_id: o.order_id ?? o.id,
                            status: nextStatus(o.status),
                          })
                        }
                      >
                        Next
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* pagination controls (simple) */}
          {ordersMeta && (
            <div className="mt-3 flex items-center justify-between">
              <div>
                Page {ordersMeta.current_page} of {ordersMeta.last_page}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!ordersMeta.prev_page_url}
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  disabled={!ordersMeta.next_page_url}
                  onClick={() => setOrdersPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Cart summary */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-bold mb-2">Cart</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items yet</p>
          ) : (
            <ul className="space-y-2">
              {cart.map((i) => (
                <li
                  key={i.menu_id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-sm text-gray-500">
                      ₱{i.price} x {i.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQty(i.menu_id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{i.qty}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQty(i.menu_id, +1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(i.menu_id)}
                    >
                      x
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <hr className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₱{cartTotal().toFixed(2)}</span>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                setCartOpen(true);
              }}
            >
              Open Cart
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={cart.length === 0}
              onClick={() => setPaymentDialogOpen(true)}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Order detail modal */}
      <Dialog open={!!viewOrder} onOpenChange={() => closeOrderDetail()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div>
              <div className="mb-2">
                Order ID: {viewOrder.order_id ?? viewOrder.id}
              </div>
              <div className="mb-2">Status: {viewOrder.status}</div>
              <div className="mb-2">Source: {viewOrder.order_source}</div>
              <div className="mb-2">Items:</div>
              <ul className="mb-3">
                {(viewOrder.order_items || viewOrder.items || []).map(
                  (it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{it.name ?? it.menu?.name ?? "Item"}</span>
                      <span>
                        {it.quantity} x ₱
                        {(it.price ?? it.unit_price ?? 0).toFixed
                          ? (it.price ?? it.unit_price ?? 0).toFixed(2)
                          : it.price ?? it.unit_price ?? 0}
                      </span>
                    </li>
                  )
                )}
              </ul>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => printReceipt(viewOrder)}
                >
                  <Printer size={16} /> Print
                </Button>
                <Button
                  onClick={() =>
                    updateOrderStatusMutation.mutate({
                      order_id: viewOrder.order_id ?? viewOrder.id,
                      status: nextStatus(viewOrder.status),
                    })
                  }
                >
                  Advance Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Confirm & Payment</DialogTitle>
          </DialogHeader>

          <div className="mb-3 border rounded p-3 max-h-56 overflow-y-auto bg-gray-50">
            {cart.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              <ul className="space-y-2">
                {cart.map((i) => (
                  <li key={i.menu_id} className="flex justify-between">
                    <span>
                      {i.name} x {i.qty}
                    </span>
                    <span>₱{(i.price * i.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              {" "}
              <span>Total</span> <span>₱{cartTotal().toFixed(2)}</span>{" "}
            </div>
          </div>

          <label className="block mb-3">
            <span className="text-sm">Payment Method</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
            </select>
          </label>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => checkoutMutation.mutate({ order_type: "counter" })}
              disabled={checkoutMutation.isLoading || cart.length === 0}
            >
              {checkoutMutation.isLoading ? "Processing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Cart Drawer (simple) */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-80 bg-white shadow z-50 p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Cart</h3>
              <Button variant="outline" onClick={() => setCartOpen(false)}>
                Close
              </Button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-500">No items</p>
            ) : (
              <ul className="space-y-2">
                {cart.map((i) => (
                  <li
                    key={i.menu_id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-gray-500">
                        ₱{i.price} x {i.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQty(i.menu_id, -1)}
                      >
                        -
                      </Button>
                      <span>{i.qty}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQty(i.menu_id, +1)}
                      >
                        +
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCartOpen(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-green-600"
                disabled={cart.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  setPaymentDialogOpen(true);
                }}
              >
                Checkout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
