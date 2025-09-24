// frontend/src/pages/cashier/components/MenuGrid.jsx
import React, { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { usePOSStore } from "../../../stores/usePOSStore";
import { Search } from "lucide-react";

const CATEGORIES = ["all", "food", "beverages", "dessert", "snack"];

const MenuCard = React.memo(function MenuCard({ item, onAdd }) {
  return (
    <Card className="rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <CardContent className="flex flex-col items-center p-4">
        <div className="text-center">
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.category}</div>
          <div className="mt-2 font-bold text-primary">
            ₱{Number(item.price).toFixed(2)}
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={() => onAdd(item)}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
});

export default function MenuGrid() {
  const addToCart = usePOSStore((s) => s.addToCart);
  const search = usePOSStore((s) => s.search);
  const selectedCategory = usePOSStore((s) => s.selectedCategory);
  const setSearch = usePOSStore((s) => s.setSearch);
  const setSelectedCategory = usePOSStore((s) => s.setSelectedCategory);

  const handleAdd = useCallback((item) => addToCart(item), [addToCart]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const res = await axiosInstance.get("/menus");
      return res.data ?? [];
    },
  });

  const menus = data ?? [];
  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const byCat =
        selectedCategory === "all" || m.category === selectedCategory;
      const bySearch =
        !search || m.name?.toLowerCase().includes(search.toLowerCase());
      return byCat && bySearch;
    });
  }, [menus, search, selectedCategory]);

  if (isLoading) return <p>Loading menus...</p>;
  if (error) return <p>Error loading menus</p>;

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-60" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-36">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredMenus.map((m) => (
          <MenuCard key={m.menu_id ?? m.id} item={m} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  );
}
