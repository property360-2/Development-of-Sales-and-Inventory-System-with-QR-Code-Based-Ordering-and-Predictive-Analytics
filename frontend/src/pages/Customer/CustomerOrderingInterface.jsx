import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const QROrderingInterface = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderReference, setOrderReference] = useState("");

  // Get table number from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");
    if (table) setTableNumber(table);
  }, []);

  // Sample menu items (would come from API)
  const menuItems = [
    {
      id: 1,
      name: "Chicken Adobo",
      price: 120,
      category: "food",
      description: "Classic Filipino chicken adobo",
      available: true,
    },
    {
      id: 2,
      name: "Sinigang na Baboy",
      price: 150,
      category: "food",
      description: "Sour pork soup",
      available: true,
    },
    {
      id: 3,
      name: "Kare-Kare",
      price: 180,
      category: "food",
      description: "Oxtail in peanut sauce",
      available: true,
    },
    {
      id: 4,
      name: "Iced Tea",
      price: 35,
      category: "beverages",
      description: "Fresh brewed iced tea",
      available: true,
    },
    {
      id: 5,
      name: "Mango Shake",
      price: 65,
      category: "beverages",
      description: "Fresh mango smoothie",
      available: true,
    },
    {
      id: 6,
      name: "Halo-Halo",
      price: 85,
      category: "dessert",
      description: "Filipino shaved ice dessert",
      available: true,
    },
    {
      id: 7,
      name: "Leche Flan",
      price: 70,
      category: "dessert",
      description: "Creamy caramel custard",
      available: true,
    },
    {
      id: 8,
      name: "Lumpia",
      price: 45,
      category: "snack",
      description: "Filipino spring rolls",
      available: true,
    },
  ];

  const categories = ["all", "food", "beverages", "dessert", "snack"];

  const filteredMenu =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item) => {
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    // Generate order reference
    const ref = `QR-${tableNumber}-${Date.now()}`;
    setOrderReference(ref);

    // In real app, would call API:
    // await axiosInstance.post('/customers', {
    //   customer_name: customerName || 'Guest',
    //   table_number: tableNumber,
    //   order_reference: ref
    // });

    // Show confirmation
    setOrderSubmitted(true);

    // Clear cart after 3 seconds
    setTimeout(() => {
      setCart([]);
      setCustomerName("");
      setOrderSubmitted(false);
    }, 3000);
  };

  const formatMoney = (amount) => `₱${Number(amount).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍽️ Restaurant Menu
          </h1>
          <p className="text-gray-600">Scan, Order, Enjoy!</p>
          {tableNumber && (
            <Badge variant="outline" className="mt-2">
              Table {tableNumber}
            </Badge>
          )}
        </div>

        {/* Customer Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Your name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Table #"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-24"
                disabled={
                  !!new URLSearchParams(window.location.search).get("table")
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.category}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {formatMoney(item.price)}
                      </Badge>
                    </div>

                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Order</span>
                  <Badge variant="default">{cartCount} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {cart.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 pb-3 border-b"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatMoney(item.price)} each
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 ml-1"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatMoney(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatMoney(cartTotal)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={cart.length === 0 || !tableNumber}
                  onClick={handleSubmitOrder}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Submit Order
                </Button>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 text-xs text-blue-800">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Payment at Counter</p>
                      <p className="mt-1">
                        Your order will be prepared once you pay at the cashier.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={orderSubmitted} onOpenChange={setOrderSubmitted}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-6 h-6" />
              Order Submitted!
            </DialogTitle>
            <DialogDescription>
              Your order has been received. Please proceed to the cashier to
              complete payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Order Reference
              </p>
              <p className="text-2xl font-bold font-mono">{orderReference}</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <UtensilsCrossed className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Proceed to the cashier counter</li>
                  <li>Show this reference number</li>
                  <li>Complete payment</li>
                  <li>Wait for your order to be prepared</li>
                </ol>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                This dialog will close automatically in 3 seconds
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QROrderingInterface;
