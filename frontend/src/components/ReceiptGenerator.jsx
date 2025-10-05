import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, X } from "lucide-react";

export default function ReceiptGenerator({ order, onClose }) {
  const receiptRef = useRef(null);

  if (!order) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "PRINT", "height=600,width=400");
    if (!printWindow) {
      alert("Please allow popups to print receipt");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order.order_id}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              max-width: 300px;
              margin: 0 auto;
              padding: 10px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
            }
            .header p {
              margin: 2px 0;
            }
            .section {
              margin: 10px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .items {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              border-top: 2px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  const formatMoney = (amount) => `₱${Number(amount).toFixed(2)}`;
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const items = order.items || order.order_items || [];
  const customer = order.customer || {};
  const payment = order.payments?.[0] || {};

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt - Order #{order.order_id}</DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="bg-white p-6 rounded-lg border"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-dashed pb-4 mb-4">
            <h1 className="text-xl font-bold">🍽️ Restaurant POS</h1>
            <p className="text-sm">123 Main Street, City</p>
            <p className="text-sm">Tel: (123) 456-7890</p>
            <p className="text-sm">VAT Reg TIN: 000-000-000-000</p>
          </div>

          {/* Order Info */}
          <div className="text-sm space-y-1 mb-4">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span className="font-bold">{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>
                {formatDate(order.order_timestamp || order.created_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{customer.customer_name || "Guest"}</span>
            </div>
            {customer.table_number && (
              <div className="flex justify-between">
                <span>Table:</span>
                <span>{customer.table_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className="capitalize">
                {order.order_type || "dine-in"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Order Source:</span>
              <span>{order.order_source || "COUNTER"}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="mb-4">
            <h3 className="font-bold text-sm mb-2">ITEMS</h3>
            {items.map((item, index) => (
              <div key={index} className="text-sm mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {item.menu?.name || item.name || "Item"}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    {item.quantity} x {formatMoney(item.price)}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(item.quantity * item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatMoney(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge:</span>
              <span>₱0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span>₱0.00</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>{formatMoney(order.total_amount)}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Payment Info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-medium capitalize">
                {payment.payment_method || "Cash"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>
                {formatMoney(payment.amount_paid || order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>
                {formatMoney(
                  Math.max(
                    0,
                    (payment.amount_paid || order.total_amount) -
                      order.total_amount
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-medium capitalize">
                {payment.payment_status || "Completed"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs mt-6 pt-4 border-t-2 border-dashed">
            <p className="font-bold mb-1">Thank you for dining with us!</p>
            <p>Please come again</p>
            <p className="mt-2">
              {customer.order_reference || `REF-${order.order_id}`}
            </p>
            <p className="mt-2 text-gray-500">
              Powered by Restaurant POS System
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
