import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Search, Eye } from "lucide-react";
import * as HoverCard from "@radix-ui/react-hover-card"; // 👈 import HoverCard

// -----------------------
// Menu Add/Edit Modal
// -----------------------
function MenuModal({ isOpen, onClose, initialData, onSubmit }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      price: "",
      category: "",
      availability_status: true,
      product_details: "",
    }
  );

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <Dialog.Title className="text-lg font-bold mb-4">
          {initialData ? "Edit Menu" : "Add Menu"}
        </Dialog.Title>

        <form
          id="menu-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-2"
        >
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
          {/* Category (Select instead of Input) */}
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
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Product Details"
            value={formData.product_details}
            onChange={(e) =>
              setFormData({ ...formData, product_details: e.target.value })
            }
          />

          {/* Availability */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={formData.availability_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availability_status: e.target.checked,
                })
              }
            />
            Available
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="submit">
              {initialData ? "Save Changes" : "Add Menu"}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
function ViewMenuModal({ isOpen, onClose, menu }) {
  if (!menu) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <Dialog.Title className="text-lg font-bold mb-4">
          Menu Details
        </Dialog.Title>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {menu.name}
          </p>
          <p>
            <span className="font-semibold">Category:</span> {menu.category}
          </p>
          <p>
            <span className="font-semibold">Price:</span> ₱{menu.price}
          </p>
          <p>
            <span className="font-semibold">Available:</span>{" "}
            {menu.availability_status ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {menu.description || "—"}
          </p>
          <p>
            <span className="font-semibold">Details:</span>{" "}
            {menu.product_details || "—"}
          </p>
          <p>
            <span className="font-semibold">Last time updated:</span>{" "}
            {menu.updated_at
              ? new Date(menu.updated_at).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
// -----------------------
// Confirm Delete Modal
// -----------------------
function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[350px]">
        <Dialog.Title className="text-lg font-bold mb-4">
          Confirm Delete
        </Dialog.Title>
        <p>Are you sure you want to delete this menu item?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// -----------------------
// AdminMenus Component
// -----------------------
export default function AdminMenus() {
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [viewData, setViewData] = useState(null);

  const queryClient = useQueryClient();

  // -----------------------
  // Fetch menus with pagination
  // -----------------------
  const { data, isLoading, error } = useQuery({
    queryKey: ["menus", page, perPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/menus?page=${page}&per_page=${perPage}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const menus = data?.data || [];
  const meta = data;
  // -----------------------
  // Debounce search
  // -----------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredMenus = menus?.filter(
    (menu) =>
      (menu.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        menu.category.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (categoryFilter === "all" ||
        categoryFilter === "" ||
        menu.category === categoryFilter)
  );

  // -----------------------
  // Mutations (with fixed toast)
  // -----------------------
  const addMenuMutation = useMutation({
    mutationFn: (newMenu) => axiosInstance.post("/menus", newMenu),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setAddOpen(false);
      toast.success(`"${res.data.name}" has been added!`);
    },
    onError: () => toast.error("Failed to add menu."),
  });

  const editMenuMutation = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.put(`/menus/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setEditData(null);
      toast.success(`"${res.data.name}" has been updated!`);
    },
    onError: () => toast.error("Failed to update menu."),
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/menus/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setDeleteData(null);
      toast.success(`Menu "${deleteData?.name}" has been deleted!`);
    },
    onError: () => toast.error("Failed to delete menu."),
  });

  if (isLoading) return <p>Loading menus...</p>;
  if (error) return <p>Error fetching menus</p>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Menu List</h1>
        <Button onClick={() => setAddOpen(true)}>Add Menu Item</Button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative w-1/3">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // add padding-left para di mag-overlap sa icon
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="beverages">Beverages</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMenus?.map((menu) => (
            <TableRow key={menu.menu_id}>
              <TableCell>{menu.menu_id}</TableCell>
              <TableCell>{menu.name}</TableCell>
              <TableCell>{menu.category}</TableCell>
              <TableCell>{menu.price}</TableCell>
              <TableCell>{menu.availability_status ? "Yes" : "No"}</TableCell>
              <TableCell className="flex gap-2">
                {/* 👁 Eye button with hover + click */}
                <HoverCard.Root>
                  <HoverCard.Trigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewData(menu)} // full modal on click
                    >
                      <Eye size={16} />
                    </Button>
                  </HoverCard.Trigger>
                  <HoverCard.Content
                    className="rounded-lg border bg-white p-3 shadow-md w-64"
                    side="top"
                    align="center"
                  >
                    <p className="text-xs text-gray-600">
                      {menu.description || "No description"}
                    </p>
                    <p className="text-xs">
                      Last update:{" "}
                      {menu.updated_at
                        ? new Date(menu.updated_at).toLocaleString("en-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </p>
                  </HoverCard.Content>
                </HoverCard.Root>

                <Button size="sm" onClick={() => setEditData(menu)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteData(menu)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {meta && (
        <div className="flex justify-between items-center mt-4">
          <p>
            Page {meta.current_page} of {meta.last_page} (Total: {meta.total})
          </p>

          <div className="flex items-center gap-4">
            {/* Page Size Dropdown */}
            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1); // reset to first page
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>

            {/* Prev/Next */}
            <div className="flex gap-2">
              <Button
                disabled={meta.current_page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {viewData && (
        <ViewMenuModal
          isOpen={!!viewData}
          onClose={() => setViewData(null)}
          menu={viewData}
        />
      )}

      {/* Modals (unchanged) */}
      {addOpen && (
        <MenuModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={(data) => addMenuMutation.mutate(data)}
        />
      )}
      {editData && (
        <MenuModal
          isOpen={!!editData}
          initialData={editData}
          onClose={() => setEditData(null)}
          onSubmit={(data) =>
            editMenuMutation.mutate({ id: editData.menu_id, data })
          }
        />
      )}
      {deleteData && (
        <ConfirmDeleteModal
          isOpen={!!deleteData}
          onClose={() => setDeleteData(null)}
          onConfirm={() => deleteMenuMutation.mutate(deleteData.menu_id)}
        />
      )}
    </div>
  );
}
