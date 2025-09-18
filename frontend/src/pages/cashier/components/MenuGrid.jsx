// frontend/src/pages/cashier/components/MenuGrid.jsx
import React, { useMemo, useState, useCallback } from "react";
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

// ✅ Memoized Card Component
const MenuCard = React.memo(function MenuCard({ item, onAdd }) {
  return (
    <Card
      key={item.menu_id ?? item.id}
      className="rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
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
  const [page, setPage] = useState(1);
  const [perPage] = useState(24);

  const search = usePOSStore((s) => s.search);
  const selectedCategory = usePOSStore((s) => s.selectedCategory);
  const setSearch = usePOSStore((s) => s.setSearch);
  const setSelectedCategory = usePOSStore((s) => s.setSelectedCategory);

  // ✅ Stable callback to prevent re-renders
  const handleAdd = useCallback((item) => addToCart(item), [addToCart]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["menus", page, perPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/menus?page=${page}&per_page=${perPage}`
      );
      return res.data ?? {};
    },
    keepPreviousData: true,
  });

  const menus = data?.data ?? [];
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
      {/* Filters row */}
      <div className="flex items-center gap-3 mb-6 w-full max-w-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-60" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category select */}
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

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex justify-between mt-6">
          <Button
            disabled={!data.prev_page_url}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            variant="outline"
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {data.current_page} of {data.last_page}
          </span>
          <Button
            disabled={!data.next_page_url}
            onClick={() => setPage((p) => p + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
