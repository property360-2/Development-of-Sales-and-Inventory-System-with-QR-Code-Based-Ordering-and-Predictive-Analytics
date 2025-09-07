import React, { useState, useMemo } from "react";
import { usePOSStore } from "@/stores/usePOSStore";
import useAuthStore from "@/stores/useAuthStore";
import axiosInstance from "@/api/axiosInstance";
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
  const { cartTotal, clearCart } = usePOSStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");

  const total = cartTotal();
  const change = useMemo(() => {
    if (!amountTendered) return 0;
    return Math.max(Number(amountTendered) - total, 0);
  }, [amountTendered, total]);

  // ✅ Proper ISO8601 format: YYYY-MM-DDTHH:MM:SS
  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 19); // keeps the "T"
  };

  const handleCheckout = async () => {
    try {
      // Step 1: Create customer
      const customerRes = await axiosInstance.post("/customers", {
        customer_name: customerName || "Walk-in",
        table_number: tableNumber || null,
        order_reference: `REF-${Date.now()}`,
      });

      const customer_id = customerRes.data.customer_id;

      // Step 2: Create order
      const orderRes = await axiosInstance.post("/orders", {
        customer_id,
        handled_by: Number(user?.user_id || user?.id),
        order_type: orderType,
        status: "pending",
        total_amount: Number(total.toFixed(2)),
        order_timestamp: formatDateTime(new Date()), // ✅ now "2025-09-07T14:23:31"
        expiry_timestamp: formatDateTime(new Date(Date.now() + 60 * 60 * 1000)),
        order_source: "Counter",
      });

      const order_id = orderRes.data.order_id;

      // Step 3: Create payment
      await axiosInstance.post("/payments", {
        order_id,
        amount_paid: Number(amountTendered || total),
        payment_method: paymentMethod,
        payment_status: "completed",
        payment_timestamp: formatDateTime(new Date()), // ✅ ISO8601 with "T"
      });

      clearCart();
      alert("Checkout successful!");
      navigate(-1);
    } catch (err) {
      console.error("Checkout error:", err);
      console.error("Server response:", err.response?.data);
      alert(
        "Checkout failed: " +
          (err.response?.data?.message || "Please check your inputs.")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            placeholder="Table Number (if dine-in)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          <div>
            <label className="block mb-1 text-sm font-medium">Order Type</label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Dine-in</SelectItem>
                <SelectItem value="takeout">Takeout</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex items-center justify-between border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <span className="text-lg font-semibold flex-1 text-center">
              Total: ₱{total.toFixed(2)}
            </span>
            <Button onClick={handleCheckout}>Confirm</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
