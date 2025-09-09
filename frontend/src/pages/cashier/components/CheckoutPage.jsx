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
  const { cart, cartTotal, clearCart } = usePOSStore();
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

  const formatDateTime = (date) => date.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss

  const handleCheckout = async () => {
    try {
      console.log("🔄 Starting checkout...");

      // ✅ 1. Create customer
      const customerData = {
        customer_name: customerName || "Test Customer",
        table_number: tableNumber || "N/A",
        order_reference: `REF-${Date.now()}`,
      };
      console.log("Creating customer with data:", customerData);

      const customerRes = await axiosInstance.post("/customers", customerData);
      console.log("Customer API response:", customerRes.data);

      const customerId =
        Number(customerRes.data?.customer_id) ||
        Number(customerRes.data?.data?.customer_id) ||
        Number(customerRes.data?.customer?.customer_id);

      if (!customerId) throw new Error("No customer_id returned from API");
      console.log("✅ Customer created with ID:", customerId);

      // ✅ 2. Create order
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
        ), // +1h
        order_source: "Counter",
      };
      console.log("Creating order with data:", orderData);

      const orderRes = await axiosInstance.post("/orders", orderData);
      console.log("Order API response:", orderRes.data);

      const orderId =
        Number(orderRes.data?.order_id) ||
        Number(orderRes.data?.data?.order_id) ||
        Number(orderRes.data?.order?.order_id);

      if (!orderId) throw new Error("No order_id returned from API");
      console.log("✅ Order created with ID:", orderId);

      // ✅ 3. Create payment
      const paymentData = {
        order_id: orderId,
        amount_paid: total,
        payment_method: paymentMethod,
        payment_status: "completed",
        payment_timestamp: formatDateTime(now),
      };
      console.log("Creating payment with data:", paymentData);

      const paymentRes = await axiosInstance.post("/payments", paymentData);
      console.log("Payment API response:", paymentRes.data);

      // ✅ 4. Clear cart and navigate
      if (typeof clearCart === "function") {
        clearCart();
      } else {
        console.warn("⚠️ clearCart is not defined in POS store.");
      }

      console.log("🎉 Checkout complete!");
      navigate("/orders"); // Redirect to orders page
    } catch (err) {
      console.error("Checkout error:", err);
      console.log("Server response:", err.response?.data);
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
            <Button onClick={handleCheckout} disabled={cart.length === 0}>
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
