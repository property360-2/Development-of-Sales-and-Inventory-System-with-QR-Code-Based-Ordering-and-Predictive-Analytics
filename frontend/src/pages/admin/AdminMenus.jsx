// src/pages/admin/AdminMenus.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Clipboard,
} from "lucide-react";

/* --------------------------- UI primitives (same style) --------------------------- */

const Input = ({ className = "", ...props }) => (
  <input
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 " +
      className
    }
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 " +
      className
    }
    {...props}
  />
);

const Select = ({ className = "", ...props }) => (
  <select
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 " +
      className
    }
    {...props}
  />
);

const Button = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  const variants = {
    default:
      "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-600",
    outline:
      "border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-50",
    danger:
      "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:hover:bg-red-600",
    success:
      "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:hover:bg-green-600",
    ghost: "hover:bg-gray-100 text-gray-700",
  };
  return (
    <button
      className={
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition " +
        variants[variant] +
        " " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const SkeletonCell = () => (
  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
);

const TableSkeleton = ({ rows = 6, cols = 6 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: cols }).map((__, c) => (
          <td key={c} className="border border-gray-200 px-3 py-2">
            <SkeletonCell />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ------------------------------ validation ------------------------------ */

function validateMenu(payload) {
  const errors = {};
  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (payload.price == null || Number.isNaN(Number(payload.price))) {
    errors.price = "Price must be a number.";
  } else if (Number(payload.price) < 0) {
    errors.price = "Price cannot be negative.";
  }
  if (!payload.category || payload.category.trim().length < 1) {
    errors.category = "Category is required.";
  }
  return errors;
}

/* ------------------------------ AdminMenus (updated) ------------------------------ */

export default function AdminMenus() {
  const queryClient = useQueryClient();

  // state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const formRef = useRef(null);
  const [formErrors, setFormErrors] = useState({});

  // fetch paginated menus
  const fetchMenusPage = async ({ queryKey }) => {
    const [_key, { page, perPage, search }] = queryKey;
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("search", search);
    const res = await axiosInstance.get(`/menus?${params.toString()}`);
    return res.data; // Laravel paginator object expected
  };

  const {
    data: pageData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["menus-page", { page, perPage, search }],
    queryFn: fetchMenusPage,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    placeholderData: () => ({
      data: [],
      current_page: page,
      last_page: page,
      total: 0,
    }),
  });

  const pageItems = pageData?.data ?? [];
  const currentPage = pageData?.current_page ?? page;
  const lastPage = pageData?.last_page ?? page;

  /* ------------------ Mutations with optimistic updates ------------------ */

  // CREATE
  const createMenu = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/menus", payload);
      return res.data;
    },
    onMutate: async (payload) => {
      setFormErrors({});
      await queryClient.cancelQueries({
        queryKey: ["menus-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "menus-page",
        { page, perPage, search },
      ]);

      // client validation
      const errs = validateMenu(payload);
      if (Object.keys(errs).length) {
        setFormErrors(errs);
        throw new Error("validation");
      }

      const optimisticMenu = {
        ...payload,
        menu_id: `tmp_${Date.now()}`,
        created_at: new Date().toISOString(),
        availability_status: payload.availability_status ?? true,
      };

      queryClient.setQueryData(
        ["menus-page", { page, perPage, search }],
        (old) => {
          if (!old)
            return {
              data: [optimisticMenu],
              current_page: 1,
              last_page: 1,
              total: 1,
            };
          return {
            ...old,
            data: [optimisticMenu, ...old.data],
            total: (old.total ?? old.data.length) + 1,
          };
        }
      );

      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["menus-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create menu"
      );
    },
    onSuccess: () => {
      toast.success("Menu created");
      setFormOpen(false);
      setEditing(null);
      setFormErrors({});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menus-page"] });
    },
  });

  // UPDATE
  const updateMenu = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(`/menus/${payload.menu_id}`, payload);
      return res.data;
    },
    onMutate: async (payload) => {
      setFormErrors({});
      await queryClient.cancelQueries({
        queryKey: ["menus-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "menus-page",
        { page, perPage, search },
      ]);

      const errs = validateMenu(payload);
      if (Object.keys(errs).length) {
        setFormErrors(errs);
        throw new Error("validation");
      }

      queryClient.setQueryData(
        ["menus-page", { page, perPage, search }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((m) =>
              m.menu_id === payload.menu_id ? { ...m, ...payload } : m
            ),
          };
        }
      );

      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["menus-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update menu"
      );
    },
    onSuccess: () => {
      toast.success("Menu updated");
      setFormOpen(false);
      setEditing(null);
      setFormErrors({});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menus-page"] });
    },
  });

  // DELETE
  const deleteMenu = useMutation({
    mutationFn: async (menuId) => {
      await axiosInstance.delete(`/menus/${menuId}`);
      return menuId;
    },
    onMutate: async (menuId) => {
      await queryClient.cancelQueries({
        queryKey: ["menus-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "menus-page",
        { page, perPage, search },
      ]);

      queryClient.setQueryData(
        ["menus-page", { page, perPage, search }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((m) => m.menu_id !== menuId),
            total: Math.max(0, (old.total ?? old.data.length) - 1),
          };
        }
      );

      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["menus-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete menu"
      );
    },
    onSuccess: () => {
      toast.success("Menu deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menus-page"] });
    },
  });

  /* -------------------- form defaults & handlers -------------------- */

  const defaultFormValues = useMemo(
    () => ({
      name: editing?.name ?? "",
      price: editing?.price ?? "",
      category: editing?.category ?? "",
      availability_status: editing?.availability_status ?? true,
      // For description & product_details we will use placeholders instead of default values
      description_placeholder: editing?.description ?? "",
      product_details_placeholder: editing?.product_details ?? "",
    }),
    [editing]
  );

  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
  }, [editing]);

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (menu) => {
    setEditing(menu);
    setFormErrors({});
    setFormOpen(true);
  };

  const openView = (menu) => {
    setViewItem(menu);
    setViewOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      description: String(fd.get("description") || ""), // may be empty — handle below
      price: parseFloat(String(fd.get("price") || "0")),
      category: String(fd.get("category") || "").trim(),
      availability_status:
        String(fd.get("availability_status") || "true") === "true",
      product_details: String(fd.get("product_details") || ""),
    };

    // If editing and description/product_details left blank, keep existing values (do not overwrite)
    if (editing) {
      if (!payload.description) delete payload.description;
      if (!payload.product_details) delete payload.product_details;
      payload.menu_id = editing.menu_id;
      updateMenu.mutate({ ...editing, ...payload });
    } else {
      // creation: description/product_details can be blank (allowed)
      createMenu.mutate(payload);
    }

    // reset native form (we close on success; keeping reset here for safety)
    // e.currentTarget.reset();
  };

  const askDelete = (id) => {
    if (!confirm("Delete this menu item? This action cannot be undone."))
      return;
    deleteMenu.mutate(id);
  };

  
  /* -------------------- UI render -------------------- */

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Menus</h2>
          <p className="text-sm text-gray-500">
            Manage product items. View more to read full description & details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
         
          <Button variant="success" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Menu
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search name/category…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <Select
          value={perPage}
          onChange={(e) => {
            setPage(1);
            setPerPage(Number(e.target.value));
          }}
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2">
          <Badge color="blue">Cached</Badge>
          {isFetching ? (
            <Badge color="yellow">Refreshing…</Badge>
          ) : (
            <Badge color="green">Fresh</Badge>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm text-gray-600">
            Total: <b>{pageData?.total ?? 0}</b>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="border-b px-3 py-3">ID</th>
              <th className="border-b px-3 py-3">Name</th>
              <th className="border-b px-3 py-3">Price</th>
              <th className="border-b px-3 py-3">Category</th>
              <th className="border-b px-3 py-3">Availability</th>
              <th className="border-b px-3 py-3">Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : pageItems.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-gray-500"
                >
                  No menu items found.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {pageItems.map((m) => (
                <tr
                  key={m.menu_id}
                  className="text-sm even:bg-gray-50 hover:bg-gray-100"
                >
                  <td className="border-b px-3 py-2 align-top">{m.menu_id}</td>
                  <td className="border-b px-3 py-2 align-top font-medium">
                    {m.name}
                  </td>
                  <td className="border-b px-3 py-2 align-top">
                    ₱{Number(m.price).toFixed(2)}
                  </td>
                  <td className="border-b px-3 py-2 align-top">{m.category}</td>
                  <td className="border-b px-3 py-2 align-top">
                    {m.availability_status ? (
                      <Badge color="green">Available</Badge>
                    ) : (
                      <Badge color="red">Not available</Badge>
                    )}
                  </td>
                  <td className="border-b px-3 py-2 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => openView(m)}>
                        <FileText className="h-4 w-4" />
                        View More
                      </Button>
                      <Button variant="outline" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => askDelete(m.menu_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <b>{pageData?.from ?? (currentPage - 1) * perPage + 1}</b> –{" "}
          <b>
            {pageData?.to ??
              Math.min(currentPage * perPage, pageData?.total ?? 0)}
          </b>{" "}
          of <b>{pageData?.total ?? 0}</b>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-gray-600">
            Page <b>{currentPage}</b> of <b>{lastPage}</b>
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={currentPage >= lastPage}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setFormErrors({});
        }}
        title={editing ? "Edit Menu" : "Add Menu"}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Name
              </label>
              <Input
                name="name"
                defaultValue={defaultFormValues.name}
                placeholder="e.g., Cheeseburger"
                required
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Price
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultFormValues.price}
                placeholder="e.g., 150.00"
                required
              />
              {formErrors.price && (
                <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Category
              </label>
              <Input
                name="category"
                defaultValue={defaultFormValues.category}
                placeholder="e.g., Food / Drinks"
                required
              />
              {formErrors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.category}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Availability
              </label>
              <Select
                name="availability_status"
                defaultValue={
                  defaultFormValues.availability_status ? "true" : "false"
                }
              >
                <option value="true">Available</option>
                <option value="false">Not available</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              {/* placeholder shows existing description; leaving blank won't overwrite */}
              <Textarea
                name="description"
                placeholder={defaultFormValues.description_placeholder}
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Product Details
              </label>
              {/* placeholder shows existing product details; leaving blank won't overwrite */}
              <Textarea
                name="product_details"
                placeholder={defaultFormValues.product_details_placeholder}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={editing ? "default" : "success"}
              disabled={createMenu.isLoading || updateMenu.isLoading}
            >
              {(createMenu.isLoading || updateMenu.isLoading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View More Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={viewItem ? viewItem.name : "Details"}
      >
        {viewItem ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <h4 className="text-xs text-gray-500">Name</h4>
                <p className="text-sm font-medium">{viewItem.name}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Price</h4>
                <p className="text-sm">₱{Number(viewItem.price).toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Category</h4>
                <p className="text-sm">{viewItem.category}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Availability</h4>
                <p className="text-sm">
                  {viewItem.availability_status ? "Available" : "Not available"}
                </p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs text-gray-500">Description</h4>
                <p className="text-sm text-gray-700">
                  {viewItem.description || "—"}
                </p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs text-gray-500">Product Details</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {viewItem.product_details || "—"}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-gray-500">Raw</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(JSON.stringify(viewItem, null, 2))
                          .then(() => toast.success("Copied raw JSON"));
                      }}
                    >
                      <Clipboard className="h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
                <pre className="mt-2 max-h-56 overflow-auto rounded border border-gray-100 bg-gray-50 p-3 text-xs whitespace-pre-wrap">
                  {JSON.stringify(viewItem, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
      </Modal>
    </div>
  );
}
