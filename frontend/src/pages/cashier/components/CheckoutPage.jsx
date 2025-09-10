// frontend/src/pages/cashier/components/CheckoutPage.jsx
import React, { useState, useMemo } from "react";
import { usePOSStore } from "@/stores/usePOSStore";
import useAuthStore from "@/stores/useAuthStore";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, cartCount } = usePOSStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple submits

  const total = cartTotal();
  const change = useMemo(() => {
    if (!amountTendered) return 0;
    return Math.max(Number(amountTendered) - total, 0);
  }, [amountTendered, total]);

  // Badge scale
  const cartBadgeScale = Math.min(1 + Math.log2(cartCount() || 1) * 0.2, 2);

  const formatDateTime = (date) => date.toISOString().slice(0, 19);

  const handleCheckout = async () => {
    if (isSubmitting || cart.length === 0) return; // prevent multiple submits
    setIsSubmitting(true);

    try {
      // 1. Create customer
      const customerData = {
        customer_name: customerName || "Test Customer",
        table_number: tableNumber || "N/A",
        order_reference: `REF-${Date.now()}`,
      };
      const customerRes = await axiosInstance.post("/customers", customerData);

      const customerId =
        Number(customerRes.data?.customer_id) ||
        Number(customerRes.data?.data?.customer_id) ||
        Number(customerRes.data?.customer?.customer_id);

      if (!customerId) throw new Error("No customer_id returned from API");

      // 2. Create order
      const now = new Date();
      const orderData = {
        customer_id: customerId,
        handled_by: user?.user_id || 2,
        order_type: orderType,
        status: "pending",
        total_amount: total,
        order_timestamp: formatDateTime(now),
        expiry_timestamp: formatDateTime(
          new Date(now.getTime() + 60 * 60 * 1000)
        ),
        order_source: "Counter",
      };
      const orderRes = await axiosInstance.post("/orders", orderData);

      const orderId =
        Number(orderRes.data?.order_id) ||
        Number(orderRes.data?.data?.order_id) ||
        Number(orderRes.data?.order?.order_id);

      if (!orderId) throw new Error("No order_id returned from API");

      // 3. Create payment
      const paymentData = {
        order_id: orderId,
        amount_paid: total,
        payment_method: paymentMethod,
        payment_status: "completed",
        payment_timestamp: formatDateTime(now),
      };
      await axiosInstance.post("/payments", paymentData);

      // 4. Clear cart and navigate
      clearCart?.();
      navigate("/pos"); // redirect to POS
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Checkout
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount() > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ transform: `scale(${cartBadgeScale})` }}
                >
                  {cartCount()}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          {/* Order Type */}
          <div>
            <label className="block mb-1 text-sm font-medium">Order Type</label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Dine-in</SelectItem>
                <SelectItem value="take-out">Take-out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Payment Method
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cash Handling */}
          {paymentMethod === "cash" && (
            <div>
              <Input
                type="number"
                placeholder="Amount Tendered"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
              />
              <p className="text-sm mt-1">
                Change:{" "}
                <span className="font-semibold">₱{change.toFixed(2)}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <span className="text-lg font-semibold flex-1 text-center">
              Total: ₱{total.toFixed(2)}
            </span>
            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
