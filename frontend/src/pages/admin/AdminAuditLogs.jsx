// src/pages/admin/AdminLogs.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  FileText,
  Download,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ------------------ UI primitives (same look & feel as Menus/Users) ------------------ */

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

const TableSkeleton = ({ rows = 6, cols = 7 }) => (
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
          className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl"
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

/* ------------------ helpers ------------------ */

const formatTimestamp = (ts) => {
  try {
    return ts ? new Date(ts).toLocaleString() : "—";
  } catch {
    return ts ?? "—";
  }
};

const csvFromArray = (arr) => {
  if (!arr.length) return "";
  const keys = Object.keys(arr[0]);
  const rows = [keys.join(",")].concat(
    arr.map((r) =>
      keys
        .map((k) => {
          const v = r[k] ?? "";
          return `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  );
  return rows.join("\n");
};

/* ------------------ Main component ------------------ */

export default function AdminLogs() {
  // server-side pagination parameters
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // client filters within current page
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const categories = [
    "All",
    "Auth",
    "User",
    "Menu",
    "Order",
    "Payment",
    "System",
  ];

  // ---------- query: list (paginated from backend) ----------
  const fetchLogsPage = async ({ queryKey }) => {
    const [_key, { page, perPage }] = queryKey;
    const params = new URLSearchParams();
    params.set("per_page", String(perPage));
    params.set("page", String(page));
    const res = await axiosInstance.get(`/audit-logs?${params.toString()}`);
    // controller returns Laravel paginator object: data, current_page, last_page, total
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
    queryKey: ["audit-logs-page", { page, perPage }],
    queryFn: fetchLogsPage,
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  // data normalization: map backend names to frontend-friendly ones
  const pageItems = useMemo(() => {
    const arr = (pageData?.data ?? []).map((l) => {
      // backend uses log_id, user relation (user: {user_id, name, role}), action, timestamp
      const id = l.log_id ?? l.id ?? Math.random().toString(36).slice(2, 8);
      const userObj = l.user ?? {};
      const user = userObj.name ?? userObj.username ?? "System";
      const action = l.action ?? l.description ?? "";
      const timestamp = l.timestamp ?? l.created_at ?? null;
      // infer category from action text if backend doesn't provide
      let inferredCategory = "System";
      const a = String(action).toLowerCase();
      if (a.includes("login") || a.includes("logout") || a.includes("auth"))
        inferredCategory = "Auth";
      else if (a.includes("user")) inferredCategory = "User";
      else if (a.includes("menu") || a.includes("product"))
        inferredCategory = "Menu";
      else if (a.includes("order")) inferredCategory = "Order";
      else if (a.includes("payment")) inferredCategory = "Payment";
      const details = l.details ?? l.meta ?? l.payload ?? l.data ?? "";
      return {
        id,
        user,
        action,
        category: l.category ?? inferredCategory,
        details,
        timestamp,
        raw: l,
        userObj,
      };
    });
    return arr;
  }, [pageData]);

  // ---------- frontend filters applied to current page items ----------
  const filtered = useMemo(() => {
    let arr = [...pageItems];
    if (category !== "All") arr = arr.filter((r) => r.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (r) =>
          String(r.action).toLowerCase().includes(s) ||
          String(r.user).toLowerCase().includes(s) ||
          String(r.details || "")
            .toLowerCase()
            .includes(s) ||
          String(r.id).toLowerCase().includes(s)
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      arr = arr.filter((r) =>
        r.timestamp ? new Date(r.timestamp) >= start : false
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      arr = arr.filter((r) =>
        r.timestamp ? new Date(r.timestamp) <= end : false
      );
    }
    return arr;
  }, [pageItems, category, search, startDate, endDate]);

  // ---------- detail fetch (server) ----------
  const {
    data: detailData,
    refetch: refetchDetail,
    isFetching: detailFetching,
  } = useQuery({
    queryKey: ["audit-log-detail", detailId],
    queryFn: async ({ queryKey }) => {
      const [_k, id] = queryKey;
      if (!id) return null;
      const res = await axiosInstance.get(`/audit-logs/${id}`);
      return res.data;
    },
    enabled: !!detailId,
    retry: 0,
  });

  useEffect(() => {
    if (detailOpen && detailId) {
      refetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailOpen, detailId]);

  // ---------- handlers ----------
  const handleRefresh = async () => {
    await toast.promise(refetch(), {
      loading: "Refreshing logs...",
      success: "Logs refreshed",
      error: "Failed to refresh",
    });
  };

  const openDetail = (id) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
  };

  const handleExportCurrentPageCSV = () => {
    const csvArray = pageItems.map((r) => ({
      id: r.id,
      user: r.user,
      action: r.action,
      category: r.category,
      details:
        typeof r.details === "object"
          ? JSON.stringify(r.details)
          : String(r.details),
      timestamp: r.timestamp,
    }));
    const csv = csvFromArray(csvArray);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-page-${page}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV (current page)");
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  // ---------- render ----------
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-sm text-gray-500">Loading logs...</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="border-b px-3 py-3">ID</th>
                <th className="border-b px-3 py-3">User</th>
                <th className="border-b px-3 py-3">Action</th>
                <th className="border-b px-3 py-3">Category</th>
                <th className="border-b px-3 py-3">Details</th>
                <th className="border-b px-3 py-3">Time</th>
                <th className="border-b px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <TableSkeleton rows={8} cols={7} />
          </table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-2">Audit Logs</h2>
        <div className="text-red-600">
          Error: {error?.message || "Failed to fetch logs"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-sm text-gray-500">
            System activity (server-side pagination). Use filters to refine
            current page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="default" onClick={handleExportCurrentPageCSV}>
            <Download className="h-4 w-4" />
            Export CSV (page)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex gap-2 flex-wrap items-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm ${
                category === c
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search action / user / details…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </Select>
          <div>
            <Badge color="blue">Total (server)</Badge>
            <span className="ml-2 text-sm text-gray-600">
              {pageData?.total ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="border-b px-3 py-3">ID</th>
              <th className="border-b px-3 py-3">User</th>
              <th className="border-b px-3 py-3">Action</th>
              <th className="border-b px-3 py-3">Category</th>
              <th className="border-b px-3 py-3">Details</th>
              <th className="border-b px-3 py-3">Time</th>
              <th className="border-b px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          {filtered.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-gray-500"
                >
                  No logs found on this page.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="text-sm even:bg-gray-50 hover:bg-gray-100"
                >
                  <td className="border-b px-3 py-2 align-top">{r.id}</td>
                  <td className="border-b px-3 py-2 align-top">{r.user}</td>
                  <td className="border-b px-3 py-2 align-top font-medium">
                    {r.action}
                  </td>
                  <td className="border-b px-3 py-2 align-top">
                    <Badge
                      color={
                        r.category === "Auth"
                          ? "yellow"
                          : r.category === "User"
                          ? "blue"
                          : r.category === "Menu"
                          ? "green"
                          : "gray"
                      }
                    >
                      {r.category}
                    </Badge>
                  </td>
                  <td className="border-b px-3 py-2 align-top text-sm text-gray-600 max-w-xs">
                    {typeof r.details === "string" ? (
                      r.details.length > 120 ? (
                        `${r.details.slice(0, 120)}…`
                      ) : (
                        r.details
                      )
                    ) : (
                      <pre className="whitespace-pre-wrap max-h-28 overflow-auto text-xs">
                        {JSON.stringify(r.details)}
                      </pre>
                    )}
                  </td>
                  <td className="border-b px-3 py-2 align-top">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(r.timestamp)}
                    </span>
                  </td>
                  <td className="border-b px-3 py-2 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openDetail(r.id)}
                      >
                        <FileText className="h-4 w-4" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleCopy(
                            typeof r.details === "object"
                              ? JSON.stringify(r.details, null, 2)
                              : String(r.details || "")
                          )
                        }
                      >
                        <Clipboard className="h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination (server) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <b>{pageData?.from ?? (page - 1) * perPage + 1}</b> –{" "}
          <b>
            {pageData?.to ?? Math.min(page * perPage, pageData?.total ?? 0)}
          </b>{" "}
          of <b>{pageData?.total ?? 0}</b>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          <span className="text-sm text-gray-600">
            Page <b>{page}</b> of <b>{pageData?.last_page ?? 1}</b>
          </span>

          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(pageData?.last_page ?? p + 1, p + 1))
            }
            disabled={page >= (pageData?.last_page ?? 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail modal: fetches full record from GET /audit-logs/{id} */}
      <Modal
        open={detailOpen}
        onClose={closeDetail}
        title={`Log ${detailId ?? ""}`}
      >
        {detailFetching && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {!detailFetching && detailData && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <h4 className="text-xs text-gray-500">User</h4>
                <p className="text-sm">
                  {detailData.user?.name ??
                    detailData.user?.username ??
                    "System"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Category</h4>
                <Badge color="gray">{detailData.category ?? "—"}</Badge>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs text-gray-500">Action</h4>
                <p className="font-medium">
                  {detailData.action ?? detailData.description ?? "—"}
                </p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-xs text-gray-500">Timestamp</h4>
                <p className="text-sm text-gray-600">
                  {formatTimestamp(
                    detailData.timestamp ?? detailData.created_at
                  )}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-gray-500">Details</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleCopy(JSON.stringify(detailData, null, 2))
                      }
                    >
                      <Clipboard className="h-4 w-4" /> Copy JSON
                    </Button>
                  </div>
                </div>

                <pre className="mt-2 max-h-64 overflow-auto rounded border border-gray-100 bg-gray-50 p-3 text-xs whitespace-pre-wrap">
                  {JSON.stringify(detailData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {!detailFetching && !detailData && (
          <div className="py-6 text-center text-gray-500">
            No detail available.
          </div>
        )}
      </Modal>
    </div>
  );
}
