import React from "react";
import { usePOSStore } from "../../../stores/usePOSStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";

export default function PaymentDialog() {
  const open = usePOSStore((s) => s.paymentDialogOpen);
  const setOpen = usePOSStore((s) => s.setPaymentDialogOpen);
  const paymentMethod = usePOSStore((s) => s.paymentMethod);
  const setPaymentMethod = usePOSStore((s) => s.setPaymentMethod);
  const navigate = useNavigate();

  const handleGoBack = () => {
    setOpen(false);
    navigate(-1); // ⬅️ go back one step in history
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription>Select how the customer pays.</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash">Cash</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">Card</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gcash" id="gcash" />
            <Label htmlFor="gcash">GCash</Label>
          </div>
        </RadioGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
