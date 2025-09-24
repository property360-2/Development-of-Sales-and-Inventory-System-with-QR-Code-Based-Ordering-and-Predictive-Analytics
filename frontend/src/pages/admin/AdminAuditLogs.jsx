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
import { Button } from "@/components/ui/button";

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [page, setPage] = useState(1);
  const perPage = 20; // frontend pagination size

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ✅ Fetch all logs (plain array, no .data wrapper)
  const {
    data: logs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/audit-logs");
      // console.log("Audit logs response:", res.data); // 👀 debug
      return res.data ?? [];
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
  });

  // ✅ Client-side filters
  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    const now = new Date();

    return logs.filter((log) => {
      const matchesSearch =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        log.user?.name?.toLowerCase().includes(q) ||
        log.user?.role?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "all" || log.user?.role?.toLowerCase() === roleFilter;

      const matchesAction =
        actionFilter === "all" ||
        log.action?.toLowerCase().startsWith(actionFilter);

      // ✅ Date filter
      const ts = log.timestamp ? new Date(log.timestamp) : null;
      let matchesDate = true;

      if (dateFilter !== "all" && ts) {
        const diffDays = (now - ts) / (1000 * 60 * 60 * 24);

        switch (dateFilter) {
          case "today":
            matchesDate = ts.toDateString() === now.toDateString();
            break;
          case "3days":
            matchesDate = diffDays <= 3;
            break;
          case "7days":
            matchesDate = diffDays <= 7;
            break;
          case "30days":
            matchesDate = diffDays <= 30;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesRole && matchesAction && matchesDate;
    });
  }, [logs, debounced, roleFilter, actionFilter, dateFilter]);

  // ✅ Frontend pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debounced, roleFilter, actionFilter, dateFilter]);

  if (isLoading) return <p className="p-4">Loading audit logs…</p>;
  if (error) return <p className="p-4">Error fetching audit logs.</p>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      {/* Filters */}
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

        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="3days">Last 3 Days</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
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
          {paginated.map((log) => (
            <TableRow key={log.log_id}>
              <TableCell>{log.log_id}</TableCell>
              <TableCell>{log.user?.name ?? "—"}</TableCell>
              <TableCell>{log.user?.role ?? "—"}</TableCell>
              <TableCell className="max-w-[400px] truncate">
                {log.action}
              </TableCell>
              <TableCell>
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </TableCell>
            </TableRow>
          ))}

          {paginated.length === 0 && (
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
