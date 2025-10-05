// frontend/src/pages/cashier/components/OrderDetailModal.jsx
import React, { useState } from "react";
import { usePOSStore } from "../../../stores/usePOSStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ReceiptGenerator from "../../../components/ReceiptGenerator";

export default function OrderDetailModal() {
  const viewOrder = usePOSStore((s) => s.viewOrder);
  const setViewOrder = usePOSStore((s) => s.setViewOrder);
  const [showReceipt, setShowReceipt] = useState(false);

  const open = Boolean(viewOrder);

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && setViewOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Review order items and totals.
            </DialogDescription>
          </DialogHeader>
          {!viewOrder ? null : (
            <div className="space-y-2">
              <div className="text-sm">
                <div>
                  <span className="font-medium">Order #:</span>{" "}
                  {viewOrder.order_id ?? viewOrder.id}
                </div>
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {viewOrder.customer?.customer_name ??
                    viewOrder.customer_name ??
                    "—"}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {viewOrder.status}
                </div>
              </div>
              <div className="border rounded p-2">
                {(viewOrder.order_items ?? viewOrder.items ?? []).map((it) => (
                  <div
                    key={`${it.menu_id}-${it.name}-${it.quantity}`}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>
                      {it.name ?? "Item"} x {it.quantity}
                    </span>
                    <span>
                      ₱{Number((it.price ?? 0) * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewOrder(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewOrder(null);
                    setShowReceipt(true);
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Generator */}
      <ReceiptGenerator
        order={showReceipt ? viewOrder : null}
        onClose={() => {
          setShowReceipt(false);
          setViewOrder(null);
        }}
      />
    </>
  );
}
