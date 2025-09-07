// frontend/src/pages/cashier/CashierPOS.jsx
import React from "react";

// POS Components
import MenuGrid from "./components/MenuGrid";
import CartDrawer from "./components/CartDrawer";
import OrdersPanel from "./components/OrdersPanel";
import OrderDetailModal from "./components/OrderDetailModal";
import PaymentDialog from "./components/PaymentDialog";

export default function CashierPOS() {
  return (
    <div className="min-h-screen p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left/Center: MenuGrid */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <MenuGrid />
      </div>

      {/* Right: Orders + Cart panels */}
      <div className="flex flex-col gap-4">
        <OrdersPanel />
        <CartDrawer />
      </div>

      {/* Modals */}
      <OrderDetailModal />
      <PaymentDialog />
    </div>
  );
}
