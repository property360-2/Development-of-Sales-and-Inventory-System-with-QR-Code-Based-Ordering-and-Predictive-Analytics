// frontend/src/stores/usePOSStore.js
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "./useAuthStore";

export const usePOSStore = create((set, get) => ({
    // --- UI State ---
    cart: [],
    cartOpen: false,
    paymentDialogOpen: false,
    viewOrder: null,
    selectedCategory: "all",
    search: "",
    paymentMethod: "cash",

    // --- Orders State ---
    orders: [],
    ordersMeta: null,

    // --- Derived ---
    cartTotal: () => get().cart.reduce((s, i) => s + Number(i.price) * i.qty, 0),
    cartCount: () => get().cart.reduce((s, i) => s + i.qty, 0),

    // --- Cart Actions ---
    addToCart: (menu) => {
        set((state) => {
            const existing = state.cart.find((i) => i.menu_id === menu.menu_id);
            if (existing) {
                return {
                    cart: state.cart.map((i) =>
                        i.menu_id === menu.menu_id ? { ...i, qty: i.qty + 1 } : i
                    ),
                };
            }
            return { cart: [...state.cart, { ...menu, qty: 1 }] };
        });
    },

    updateCartQty: (menu_id, delta) => {
        set((state) => ({
            cart: state.cart
                .map((i) =>
                    i.menu_id === menu_id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
                )
                .filter((i) => i.qty > 0),
        }));
    },

    removeFromCart: (menu_id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.menu_id !== menu_id) })),

    setCartOpen: (open) => set({ cartOpen: open }),
    setPaymentDialogOpen: (open) => set({ paymentDialogOpen: open }),
    setViewOrder: (order) => set({ viewOrder: order }),
    setSelectedCategory: (cat) => set({ selectedCategory: cat }),
    setSearch: (text) => set({ search: text }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),

    // --- Orders Actions ---
    setOrders: (orders) => set({ orders }),
    setOrdersMeta: (meta) => set({ ordersMeta: meta }),

    updateOrderStatus: async (order, status) => {
        try {
            await axiosInstance.patch(`/orders/${order.order_id ?? order.id}`, {
                status,
            });
            const { orders } = get();
            set({
                orders: orders.map((o) =>
                    o.order_id === order.order_id ? { ...o, status } : o
                ),
            });
        } catch (err) {
            console.error("Failed to update order status", err);
            alert("Failed to update order status");
        }
    },

    nextStatus: (current) => {
        const STATUS_FLOW = ["pending", "preparing", "ready", "served", "completed"];
        const idx = STATUS_FLOW.indexOf(current);
        return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    },

    // --- Print ---
    printReceipt: (order) => {
        const lines = [];
        lines.push(
            `<h2>Receipt — Order #${order.order_id ?? order.id}</h2>`
        );
        lines.push(
            `<p>Cashier: ${useAuthStore.getState().user?.name ?? "-"}</p>`
        );
        lines.push(
            `<p>Date: ${new Date(
                order.order_timestamp ?? order.created_at ?? Date.now()
            ).toLocaleString()}</p>`
        );
        lines.push("<ul>");
        (order.order_items || order.items || []).forEach((it) => {
            lines.push(
                `<li>${it.name ?? "Item"} x ${it.quantity} — ₱${(
                    (it.price ?? 0) * it.quantity
                ).toFixed(2)}</li>`
            );
        });
        lines.push("</ul>");
        lines.push(
            `<p><strong>Total: ₱${(
                order.total_amount ?? get().cartTotal()
            ).toFixed(2)}</strong></p>`
        );

        const newWindow = window.open("", "PRINT", "height=600,width=400");
        if (!newWindow) return alert("Unable to open print window (popup blocked)");
        newWindow.document.write(
            "<html><head><title>Receipt</title></head><body>"
        );
        newWindow.document.write(lines.join("\n"));
        newWindow.document.write("</body></html>");
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
    },
}));
