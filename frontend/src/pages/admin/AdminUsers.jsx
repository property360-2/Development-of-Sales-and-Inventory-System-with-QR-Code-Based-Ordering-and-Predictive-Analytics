// to do:  add an eye icon where a user can see more about the menu whenever he hover or clicked it

// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";

/* ---------------------------
   Add / Edit User Modal
--------------------------- */
function UserModal({ isOpen, onClose, initialData, onSubmit }) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Cashier",
    contact_number: "",
  });

  useEffect(() => {
    if (isEdit) {
      setFormData({
        name: initialData.name ?? "",
        username: initialData.username ?? "",
        password: "",
        role: initialData.role ?? "Cashier",
        contact_number: initialData.contact_number ?? "",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "Cashier",
        contact_number: "",
      });
    }
  }, [isEdit, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };

    // If editing and password is blank, remove it
    if (isEdit && !payload.password) {
      delete payload.password;
    }

    // If editing and username is unchanged, remove it
    if (isEdit && payload.username === initialData.username) {
      delete payload.username;
    }

    onSubmit(payload);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
        <Dialog.Title className="mb-4 text-lg font-bold">
          {isEdit ? "Edit User" : "Add User"}
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Full name"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
            required
          />
          <Input
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData((s) => ({ ...s, username: e.target.value }))
            }
            required
          />

          <Input
            type="password"
            placeholder={isEdit ? "Password (leave blank to keep)" : "Password"}
            value={formData.password}
            onChange={(e) =>
              setFormData((s) => ({ ...s, password: e.target.value }))
            }
            {...(isEdit ? {} : { required: true })}
          />

          <Select
            value={formData.role} // <-- this should always reflect current role
            onValueChange={(value) =>
              setFormData((s) => ({ ...s, role: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Cashier">Cashier</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Contact number (optional)"
            value={formData.contact_number}
            onChange={(e) =>
              setFormData((s) => ({ ...s, contact_number: e.target.value }))
            }
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="submit">
              {isEdit ? "Save Changes" : "Add User"}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/* ---------------------------
   Confirm Delete Modal
--------------------------- */
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, targetName }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed left-1/2 top-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
        <Dialog.Title className="mb-4 text-lg font-bold">
          Confirm Delete
        </Dialog.Title>
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">&quot;{targetName}&quot;</span>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/* ---------------------------
   AdminUsers Page
--------------------------- */
export default function AdminUsers() {
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const queryClient = useQueryClient();

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // query
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, perPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/users?page=${page}&per_page=${perPage}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.data ?? [];
  const meta = data;

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q);
      const matchesRole =
        roleFilter === "all" || !roleFilter ? true : u.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, debounced, roleFilter]);

  /* ---------------------------
     Mutations (must be above return!)
  --------------------------- */
  const addUser = useMutation({
    mutationFn: (payload) => axiosInstance.post("/users", payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAddOpen(false);
      toast.success(`"${variables.name}" has been added!`);
      setPage(1);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "Failed to add user.";
      toast.error(msg);
    },
  });

  const editUser = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.put(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditData(null);
      toast.success(`"${variables.data.name}" has been updated!`);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "Failed to update user.";
      toast.error(msg);
    },
  });

  const deleteUser = useMutation({
    mutationFn: ({ id }) => axiosInstance.delete(`/users/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteData(null);
      toast.success(`"${variables.name}" has been deleted!`);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "Failed to delete user.";
      toast.error(msg);
    },
  });

  if (isLoading) return <p className="p-4">Loading users…</p>;
  if (error) return <p className="p-4">Error fetching users.</p>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setAddOpen(true)}>Add User</Button>
      </div>

      {/* Search + Role Filter */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Cashier">Cashier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.user_id}>
              <TableCell>{u.user_id}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.contact_number ?? "—"}</TableCell>
              <TableCell>
                {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => setEditData(u)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteData({ id: u.user_id, name: u.name })}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-sm text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {meta && (
        <div className="mt-4 flex items-center justify-between">
          <p>
            Page {meta.current_page} of {meta.last_page} (Total: {meta.total})
          </p>

          <div className="flex items-center gap-4">
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                setPerPage(Number(v));
                setPage(1);
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

            <div className="flex gap-2">
              <Button
                disabled={meta.current_page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {addOpen && (
        <UserModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={(payload) => addUser.mutate(payload)}
        />
      )}

      {editData && (
        <UserModal
          isOpen={!!editData}
          initialData={editData}
          onClose={() => setEditData(null)}
          onSubmit={(payload) =>
            editUser.mutate({ id: editData.user_id, data: payload })
          }
        />
      )}

      {deleteData && (
        <ConfirmDeleteModal
          isOpen={!!deleteData}
          targetName={deleteData.name}
          onClose={() => setDeleteData(null)}
          onConfirm={() =>
            deleteUser.mutate({ id: deleteData.id, name: deleteData.name })
          }
        />
      )}
    </div>
  );
}
