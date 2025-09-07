import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSStore } from "../../../stores/usePOSStore";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartDrawer() {
  const navigate = useNavigate();

  const cart = usePOSStore((s) => s.cart);
  const cartOpen = usePOSStore((s) => s.cartOpen);
  const setCartOpen = usePOSStore((s) => s.setCartOpen);
  const updateCartQty = usePOSStore((s) => s.updateCartQty);
  const removeFromCart = usePOSStore((s) => s.removeFromCart);
  const cartTotal = usePOSStore((s) => s.cartTotal);
  const cartCount = usePOSStore((s) => s.cartCount);

  const itemsTotal = useMemo(() => cartTotal().toFixed(2), [cart, cartTotal]);

  const goCheckout = () => {
    setCartOpen(false);
    navigate("/cashier/checkout"); // ✅ fixed path
  };

  return (
    <>
      {/* Full panel for desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Cart</h3>
          <span className="text-sm text-muted-foreground">
            {cartCount()} items
          </span>
        </div>

        <Separator className="mb-2" />

        <ScrollArea className="max-h-[40vh] pr-2">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.menu_id}-${item.name}`}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ₱{Number(item.price).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateCartQty(item.menu_id, -1)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-6 text-center">{item.qty}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateCartQty(item.menu_id, 1)}
                  >
                    <Plus />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.menu_id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <Separator className="mt-2 mb-3" />

        <div className="flex items-center justify-between">
          <div className="font-semibold">Total:</div>
          <div className="font-bold">₱{itemsTotal}</div>
        </div>

        <Button
          className="mt-3 w-full"
          disabled={!cart.length}
          onClick={goCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>

      {/* Mobile floating button + Drawer */}
      <Drawer open={cartOpen} onOpenChange={setCartOpen}>
        <DrawerTrigger asChild>
          <Button className="lg:hidden fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg">
            <ShoppingCart />
            {/* Badge like an exponent */}
            {cartCount() > 0 && (
              <span className="absolute -top-1 -right-1 text-[11px] font-bold bg-red-500 text-white rounded-full px-[6px] py-[1px] leading-none">
                {cartCount()}
              </span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cart</DrawerTitle>
            <DrawerDescription>
              Review your items before checkout.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <ScrollArea className="max-h-[50vh] pr-2">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.menu_id}-${item.name}`}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ₱{Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQty(item.menu_id, -1)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-6 text-center">{item.qty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQty(item.menu_id, 1)}
                      >
                        <Plus />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.menu_id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>

            <Separator className="mt-3 mb-3" />

            <div className="flex items-center justify-between">
              <div className="font-semibold">Total:</div>
              <div className="font-bold">₱{itemsTotal}</div>
            </div>

            <DrawerFooter className="px-0">
              <Button disabled={!cart.length} onClick={goCheckout}>
                Proceed to Checkout
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
