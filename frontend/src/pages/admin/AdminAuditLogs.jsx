// ayusin yung audit trail sa backend, tangina hirap i-fetch sa frontend AHHAAHAHAH , dapat di ko na ginawang raw eh
// src/pages/admin/AdminAuditLogs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // fetch logs
  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", page, perPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/audit-logs?page=${page}&per_page=${perPage}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const logs = data?.data ?? [];
  const meta = data;

  // search + filters (client-side)
  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.user?.name?.toLowerCase().includes(q) ||
        log.user?.role?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "all" || log.user?.role?.toLowerCase() === roleFilter;

      const matchesAction =
        actionFilter === "all" ||
        log.action.toLowerCase().startsWith(actionFilter);

      return matchesSearch && matchesRole && matchesAction;
    });
  }, [logs, debounced, roleFilter, actionFilter]);

  if (isLoading) return <p className="p-4">Loading audit logs…</p>;
  if (error) return <p className="p-4">Error fetching audit logs.</p>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by user or action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Role Filter */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="cashier">Cashier</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Filter */}
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((log) => (
            <TableRow key={log.log_id}>
              <TableCell>{log.log_id}</TableCell>
              <TableCell>{log.user?.name ?? "—"}</TableCell>
              <TableCell>{log.user?.role ?? "—"}</TableCell>
              <TableCell className="max-w-[400px] truncate">
                {log.action}
              </TableCell>
              <TableCell>
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                No audit logs found.
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
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={meta.current_page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
