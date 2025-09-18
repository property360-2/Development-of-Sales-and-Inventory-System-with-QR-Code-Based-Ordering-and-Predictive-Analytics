// frontend/src/pages/cashier/components/CheckoutPage.jsx
import React, { useState, useMemo } from "react";
import { usePOSStore } from "@/stores/usePOSStore";
import useAuthStore from "@/stores/useAuthStore";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartTotal();
  const change = useMemo(() => {
    if (!amountTendered) return 0;
    return Math.max(Number(amountTendered) - total, 0);
  }, [amountTendered, total]);

  const formatDateTime = (date) => date.toISOString().slice(0, 19);

  const handleCheckout = async () => {
    if (isSubmitting || cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const now = new Date();

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

      // 2. Create order + items in one request
      const orderData = {
        customer_id: customerId,
        handled_by: user?.user_id || 2,
        order_type: orderType,
        status: "pending",
        total_amount: total,
        order_timestamp: now.toISOString().slice(0, 19),
        expiry_timestamp: new Date(now.getTime() + 60 * 60 * 1000)
          .toISOString()
          .slice(0, 19),
        order_source: "Counter",
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.qty,
          price: item.price,
        })),
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
        payment_timestamp: now.toISOString().slice(0, 19),
      };
      await axiosInstance.post("/payments", paymentData);

      // 4. Clear cart and redirect
      clearCart?.();
      navigate("/cashier/pos", { replace: true }); // <- fixed: go back to POS
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
          <CardTitle className="text-xl">Checkout</CardTitle>
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
