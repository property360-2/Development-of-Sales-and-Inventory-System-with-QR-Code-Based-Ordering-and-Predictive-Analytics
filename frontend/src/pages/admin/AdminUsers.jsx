// src/pages/admin/AdminUsers.jsx
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
  Download,
} from "lucide-react";

/* -------------------- UI primitives (match AdminMenus/AdminLogs) -------------------- */

const Input = ({ className = "", ...props }) => (
  <input
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

const Textarea = ({ className = "", ...props }) => (
  <textarea
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

const Modal = ({ open, onClose, title, children, size = "md" }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={
            "relative w-full rounded-2xl bg-white p-5 shadow-xl " +
            (size === "lg"
              ? "max-w-4xl"
              : size === "sm"
              ? "max-w-md"
              : "max-w-2xl")
          }
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

function validateUser(payload, isEdit = false) {
  const errors = {};
  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!isEdit) {
    if (!payload.username || payload.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    if (!payload.password || payload.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
  } else {
    if (payload.username && payload.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    if (
      payload.password &&
      payload.password.length > 0 &&
      payload.password.length < 6
    ) {
      errors.password = "New password must be at least 6 characters.";
    }
  }
  if (!payload.role || !["Admin", "Cashier"].includes(payload.role)) {
    errors.role = "Role must be Admin or Cashier.";
  }
  return errors;
}

/* ------------------------------ AdminUsers (full) ------------------------------ */

export default function AdminUsers() {
  const queryClient = useQueryClient();

  // UI state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // user object or null
  const formRef = useRef(null);
  const [formErrors, setFormErrors] = useState({});

  // view modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // --- fetch paged users ---
  const fetchUsersPage = async ({ queryKey }) => {
    const [_key, { page, perPage, search }] = queryKey;
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (search) params.set("search", search);
    const res = await axiosInstance.get(`/users?${params.toString()}`);
    // expected: Laravel paginator object
    return res.data;
  };

  const {
    data: pageData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["users-page", { page, perPage, search }],
    queryFn: fetchUsersPage,
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

  /* ------------------ MUTATIONS (optimistic) ------------------ */

  // CREATE
  const createUser = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/users", payload);
      return res.data;
    },
    onMutate: async (payload) => {
      setFormErrors({});
      await queryClient.cancelQueries({
        queryKey: ["users-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "users-page",
        { page, perPage, search },
      ]);

      // client validation
      const errs = validateUser(payload, false);
      if (Object.keys(errs).length) {
        setFormErrors(errs);
        throw new Error("validation");
      }

      // optimistic user with temp id
      const optimisticUser = {
        ...payload,
        user_id: `tmp_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["users-page", { page, perPage, search }],
        (old) => {
          if (!old)
            return {
              data: [optimisticUser],
              current_page: 1,
              last_page: 1,
              total: 1,
            };
          return {
            ...old,
            data: [optimisticUser, ...old.data],
            total: (old.total ?? old.data.length) + 1,
          };
        }
      );

      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["users-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create user"
      );
    },
    onSuccess: () => {
      toast.success("User created");
      setFormOpen(false);
      setEditing(null);
      setFormErrors({});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
    },
  });

  // UPDATE
  const updateUser = useMutation({
    mutationFn: async (payload) => {
      const id = payload.user_id;
      const body = { ...payload };
      delete body.user_id;
      const res = await axiosInstance.put(`/users/${id}`, body);
      return res.data;
    },
    onMutate: async (payload) => {
      setFormErrors({});
      await queryClient.cancelQueries({
        queryKey: ["users-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "users-page",
        { page, perPage, search },
      ]);

      // validation
      const errs = validateUser(payload, true);
      if (Object.keys(errs).length) {
        setFormErrors(errs);
        throw new Error("validation");
      }

      // optimistic update in current page
      queryClient.setQueryData(
        ["users-page", { page, perPage, search }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((u) =>
              u.user_id === payload.user_id ? { ...u, ...payload } : u
            ),
          };
        }
      );

      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["users-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update user"
      );
    },
    onSuccess: () => {
      toast.success("User updated");
      setFormOpen(false);
      setEditing(null);
      setFormErrors({});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
    },
  });

  // DELETE
  const deleteUser = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/users/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["users-page", { page, perPage, search }],
      });
      const previous = queryClient.getQueryData([
        "users-page",
        { page, perPage, search },
      ]);
      queryClient.setQueryData(
        ["users-page", { page, perPage, search }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((u) => u.user_id !== id),
            total: Math.max(0, (old.total ?? old.data.length) - 1),
          };
        }
      );
      return { previous };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(
          ["users-page", { page, perPage, search }],
          ctx.previous
        );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete user"
      );
    },
    onSuccess: () => {
      toast.success("User deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
    },
  });

  /* -------------------- form default values & handlers -------------------- */

  const defaultFormValues = useMemo(
    () => ({
      name: editing?.name ?? "",
      username: editing?.username ?? "",
      // password intentionally blank (placeholder used)
      password_placeholder: "", // not storing actual pw
      role: editing?.role ?? "Cashier",
      contact_number_placeholder: editing?.contact_number ?? "",
      created_at: editing?.created_at ?? null,
      updated_at: editing?.updated_at ?? null,
    }),
    [editing]
  );

  useEffect(() => {
    if (formRef.current) formRef.current.reset();
  }, [editing]);

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setFormErrors({});
    setFormOpen(true);
  };

  const openView = (user) => {
    setViewUser(user);
    setViewOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      username: String(fd.get("username") || "").trim(),
      password: String(fd.get("password") || ""),
      role: String(fd.get("role") || "Cashier"),
      contact_number: String(fd.get("contact_number") || "").trim(),
    };

    // If editing and password is blank, remove it from payload so backend won't overwrite
    if (editing && !payload.password) delete payload.password;

    if (editing) {
      updateUser.mutate({ ...editing, ...payload, user_id: editing.user_id });
    } else {
      createUser.mutate(payload);
    }
  };

  const askDelete = (id) => {
    setTargetDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!targetDeleteId) return;
    deleteUser.mutate(targetDeleteId, {
      onSettled: () => {
        setConfirmOpen(false);
        setTargetDeleteId(null);
      },
    });
  };
 
  /* -------------------- Render -------------------- */

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-sm text-gray-500">
            Manage system users. View More for full details & edit in modal.
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
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search name/username…"
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

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="border-b px-3 py-3">ID</th>
              <th className="border-b px-3 py-3">Name</th>
              <th className="border-b px-3 py-3">Username</th>
              <th className="border-b px-3 py-3">Role</th>
              <th className="border-b px-3 py-3">Contact</th>
              <th className="border-b px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : pageItems.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {pageItems.map((u) => (
                <tr
                  key={u.user_id}
                  className="text-sm even:bg-gray-50 hover:bg-gray-100"
                >
                  <td className="border-b px-3 py-2 align-top">{u.user_id}</td>
                  <td className="border-b px-3 py-2 align-top font-medium">
                    {u.name}
                  </td>
                  <td className="border-b px-3 py-2 align-top">{u.username}</td>
                  <td className="border-b px-3 py-2 align-top">{u.role}</td>
                  <td className="border-b px-3 py-2 align-top">
                    {u.contact_number ?? "—"}
                  </td>
                  <td className="border-b px-3 py-2 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => openView(u)}>
                        <FileText className="h-4 w-4" /> View More
                      </Button>
                      <Button variant="outline" onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => askDelete(u.user_id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
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

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setFormErrors({});
        }}
        title={editing ? "Edit User" : "Add User"}
        size="md"
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
                placeholder="Full name"
                required
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Username
              </label>
              <Input
                name="username"
                defaultValue={defaultFormValues.username}
                placeholder="username"
                required
              />
              {formErrors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Password{" "}
                {editing ? (
                  <span className="text-xs text-gray-500">
                    (leave blank to keep)
                  </span>
                ) : null}
              </label>
              <Input
                name="password"
                type="password"
                placeholder={editing ? "New password (optional)" : "Password"}
              />
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Role
              </label>
              <Select name="role" defaultValue={defaultFormValues.role}>
                <option value="Admin">Admin</option>
                <option value="Cashier">Cashier</option>
              </Select>
              {formErrors.role && (
                <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Contact Number
              </label>
              <Input
                name="contact_number"
                defaultValue={defaultFormValues.contact_number_placeholder}
                placeholder={
                  defaultFormValues.contact_number_placeholder || "09xxxxxxxxx"
                }
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
              disabled={createUser.isLoading || updateUser.isLoading}
            >
              {(createUser.isLoading || updateUser.isLoading) && (
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
        title={viewUser ? viewUser.name : "User Details"}
        size="md"
      >
        {viewUser ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <h4 className="text-xs text-gray-500">Name</h4>
                <p className="text-sm font-medium">{viewUser.name}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Username</h4>
                <p className="text-sm">{viewUser.username}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Role</h4>
                <Badge color={viewUser.role === "Admin" ? "yellow" : "blue"}>
                  {viewUser.role}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Contact</h4>
                <p className="text-sm">{viewUser.contact_number ?? "—"}</p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs text-gray-500">Created At</h4>
                <p className="text-sm text-gray-600">
                  {viewUser.created_at
                    ? new Date(viewUser.created_at).toLocaleString()
                    : "—"}
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
                          ?.writeText(JSON.stringify(viewUser, null, 2))
                          .then(() => toast.success("Copied raw JSON"));
                      }}
                    >
                      <Clipboard className="h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
                <pre className="mt-2 max-h-64 overflow-auto rounded border border-gray-100 bg-gray-50 p-3 text-xs whitespace-pre-wrap">
                  {JSON.stringify(viewUser, null, 2)}
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

      {/* Delete confirm modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm delete"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          This will permanently delete the user. Continue?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteUser.isLoading}
          >
            {deleteUser.isLoading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}{" "}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
