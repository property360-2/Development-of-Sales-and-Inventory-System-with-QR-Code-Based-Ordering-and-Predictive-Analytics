import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Using basic table styling instead
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Edit,
  Plus,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InventoryManagement = () => {
  // Sample inventory data (in real app, fetch from backend)
  const [inventory, setInventory] = useState([
    {
      id: 1,
      item: "Chicken (kg)",
      category: "Meat",
      stock: 15,
      minStock: 20,
      maxStock: 50,
      unit: "kg",
      lastUpdated: "2025-10-04",
    },
    {
      id: 2,
      item: "Pork (kg)",
      category: "Meat",
      stock: 8,
      minStock: 15,
      maxStock: 40,
      unit: "kg",
      lastUpdated: "2025-10-03",
    },
    {
      id: 3,
      item: "Rice (kg)",
      category: "Grain",
      stock: 45,
      minStock: 30,
      maxStock: 100,
      unit: "kg",
      lastUpdated: "2025-10-04",
    },
    {
      id: 4,
      item: "Vegetables Mix",
      category: "Vegetables",
      stock: 5,
      minStock: 10,
      maxStock: 25,
      unit: "kg",
      lastUpdated: "2025-10-02",
    },
    {
      id: 5,
      item: "Cooking Oil (L)",
      category: "Condiments",
      stock: 12,
      minStock: 8,
      maxStock: 20,
      unit: "L",
      lastUpdated: "2025-10-04",
    },
    {
      id: 6,
      item: "Soy Sauce (L)",
      category: "Condiments",
      stock: 6,
      minStock: 5,
      maxStock: 15,
      unit: "L",
      lastUpdated: "2025-10-03",
    },
    {
      id: 7,
      item: "Sugar (kg)",
      category: "Sweeteners",
      stock: 18,
      minStock: 10,
      maxStock: 30,
      unit: "kg",
      lastUpdated: "2025-10-04",
    },
    {
      id: 8,
      item: "Soft Drinks (bottles)",
      category: "Beverages",
      stock: 45,
      minStock: 30,
      maxStock: 100,
      unit: "pcs",
      lastUpdated: "2025-10-04",
    },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editItem, setEditItem] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    item: "",
    category: "",
    stock: "",
    minStock: "",
    maxStock: "",
    unit: "kg",
  });

  const categories = [
    "all",
    "Meat",
    "Grain",
    "Vegetables",
    "Condiments",
    "Sweeteners",
    "Beverages",
  ];

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.item
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, categoryFilter]);

  // Calculate alerts
  const alerts = useMemo(() => {
    return {
      lowStock: inventory.filter((item) => item.stock <= item.minStock),
      outOfStock: inventory.filter((item) => item.stock === 0),
      overStock: inventory.filter((item) => item.stock >= item.maxStock),
    };
  }, [inventory]);

  // Get stock status
  const getStockStatus = (item) => {
    if (item.stock === 0) return "out";
    if (item.stock <= item.minStock) return "low";
    if (item.stock >= item.maxStock) return "over";
    return "normal";
  };

  const getStatusBadge = (status) => {
    const variants = {
      out: { variant: "destructive", label: "Out of Stock" },
      low: { variant: "destructive", label: "Low Stock" },
      over: { variant: "secondary", label: "Overstock" },
      normal: { variant: "outline", label: "Normal" },
    };
    return variants[status];
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      item: item.item,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      unit: item.unit,
    });
  };

  // Handle save
  const handleSave = () => {
    if (editItem) {
      setInventory(
        inventory.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                ...formData,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
      setEditItem(null);
    } else {
      const newItem = {
        id: Math.max(...inventory.map((i) => i.id)) + 1,
        ...formData,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setInventory([...inventory, newItem]);
      setShowAddDialog(false);
    }
    setFormData({
      item: "",
      category: "",
      stock: "",
      minStock: "",
      maxStock: "",
      unit: "kg",
    });
  };

  // Calculate stock level percentage
  const getStockPercentage = (item) => {
    return ((item.stock / item.maxStock) * 100).toFixed(0);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-700">
                  {alerts.outOfStock.length}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-orange-700">
                  {alerts.lowStock.length}
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Items</p>
                <p className="text-3xl font-bold text-blue-700">
                  {inventory.length}
                </p>
              </div>
              <Package className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Item</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-left p-2 font-medium">Current Stock</th>
                  <th className="text-left p-2 font-medium">Stock Level</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Last Updated</th>
                  <th className="text-right p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  const percentage = getStockPercentage(item);
                  const badgeProps = getStatusBadge(status);

                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{item.item}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">
                        <span className="font-semibold">{item.stock}</span>{" "}
                        {item.unit}
                        <span className="text-xs text-gray-500 ml-1">
                          / {item.maxStock} {item.unit}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                status === "out"
                                  ? "bg-red-500"
                                  : status === "low"
                                  ? "bg-orange-500"
                                  : status === "over"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={badgeProps.variant}>
                          {badgeProps.label}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {item.lastUpdated}
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-8">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {alerts.lowStock.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Items Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200"
                >
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.stock} {item.unit} | Minimum:{" "}
                      {item.minStock} {item.unit}
                    </p>
                  </div>
                  <Badge variant="destructive">Order Soon</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Dialog */}
      <Dialog
        open={!!editItem || showAddDialog}
        onOpenChange={() => {
          setEditItem(null);
          setShowAddDialog(false);
          setFormData({
            item: "",
            category: "",
            stock: "",
            minStock: "",
            maxStock: "",
            unit: "kg",
          });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
                placeholder="e.g., Chicken (kg)"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c !== "all")
                    .map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="pack">pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Stock</Label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Max Stock</Label>
                <Input
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStock: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditItem(null);
                setShowAddDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
