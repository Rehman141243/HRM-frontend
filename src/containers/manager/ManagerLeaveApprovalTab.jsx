"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  History,
  Clock,
} from "lucide-react";

import { fmtDate, StatusBadge } from "@/components/common/common";
import { DataTablePagination } from "@/components/common/data-table-pagination";

// ─── Pending columns ──────────────────────────────────────────────────────────
function usePendingColumns({ actionId, onApprove, onRejectOpen }) {
  return useMemo(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => {
          const emp = row.original.employee;
          return emp ? (
            <div>
              <p className="text-sm font-medium">{`${emp.first_name} ${emp.last_name}`}</p>
              {emp.designation && (
                <p className="text-xs text-muted-foreground">{emp.designation}</p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "leave_type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-xs">{getValue()?.replace(/_/g, " ")}</span>
        ),
      },
      {
        accessorKey: "start_date",
        header: "From",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
        ),
      },
      {
        accessorKey: "end_date",
        header: "To",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
        ),
      },
      {
        accessorKey: "total_days",
        header: "Days",
        cell: ({ getValue }) => (
          <span className="text-xs tabular-nums">{getValue() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground max-w-[120px] truncate block">
            {getValue() || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                disabled={actionId === l.id}
                onClick={() => onApprove(l.id)}
              >
                {actionId === l.id ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <ThumbsUp className="h-3 w-3" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-red-500/40 text-red-600 hover:bg-red-500/10"
                onClick={() => onRejectOpen(l.id)}
              >
                <ThumbsDown className="h-3 w-3" />
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [actionId, onApprove, onRejectOpen]
  );
}

// ─── History columns ──────────────────────────────────────────────────────────
const historyColumns = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const emp = row.original.employee;
      return emp ? (
        <div>
          <p className="text-sm font-medium">{`${emp.first_name} ${emp.last_name}`}</p>
          {emp.designation && (
            <p className="text-xs text-muted-foreground">{emp.designation}</p>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "leave_type",
    header: "Type",
    cell: ({ getValue }) => (
      <span className="text-xs">{getValue()?.replace(/_/g, " ")}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "From",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
    ),
  },
  {
    accessorKey: "end_date",
    header: "To",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
    ),
  },
  {
    accessorKey: "total_days",
    header: "Days",
    cell: ({ getValue }) => (
      <span className="text-xs tabular-nums">{getValue() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground max-w-[120px] truncate block">
        {getValue() || "—"}
      </span>
    ),
  },
  {
    accessorKey: "manager_status",
    header: "Mgr Decision",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
  {
    accessorKey: "hr_status",
    header: "HR Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
  {
    accessorKey: "status",
    header: "Final",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
];

// ─── Reusable DataTable shell ─────────────────────────────────────────────────
function LeaveDataTable({ table, columns, loading, emptyMessage }) {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground py-8 text-sm"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ManagerLeaveApprovalTab() {
  const user = getUser();
  if (user?.designation !== "manager") return null;

  // Pending state
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPagination, setPendingPagination] = useState({});

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({});
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Action state
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState(null);

  const fetchPending = useCallback(async (p = 1) => {
    setPendingLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/leaves", {
        params: { page: p, limit: 10, status: "pending", manager_status: "pending" },
      });
      setPending(res.data?.leaves ?? []);
      setPendingPagination(res.data?.pagination ?? {});
    } catch {
      setError("Unable to load leave requests.");
      setPending([]);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (p = 1) => {
    setHistoryLoading(true);
    setError(null);
    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        axiosInstance.get("/leaves", {
          params: { page: p, limit: 5, manager_status: "approved" },
        }),
        axiosInstance.get("/leaves", {
          params: { page: p, limit: 5, manager_status: "rejected" },
        }),
      ]);

      const merged = [
        ...(approvedRes.data?.leaves ?? []),
        ...(rejectedRes.data?.leaves ?? []),
      ].sort(
        (a, b) =>
          new Date(b.updated_at ?? b.submitted_at) -
          new Date(a.updated_at ?? a.submitted_at)
      );

      setHistory(merged);
      const ap = approvedRes.data?.pagination ?? {};
      const rp = rejectedRes.data?.pagination ?? {};
      setHistoryPagination({
        total: (ap.total ?? 0) + (rp.total ?? 0),
        totalPages: Math.max(ap.totalPages ?? 1, rp.totalPages ?? 1),
        page: p,
      });
      setHistoryLoaded(true);
    } catch {
      setError("Unable to load history.");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(1);
  }, [fetchPending]);

  const handleTabChange = (val) => {
    if (val === "history" && !historyLoaded) fetchHistory(1);
  };

  const handleManagerAction = async (id, action, reason = "") => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.patch(`/leave/${id}/manager-action`, {
        action,
        ...(action === "rejected" ? { rejection_reason: reason } : {}),
      });
      setSuccess(
        action === "approved"
          ? "Leave approved — forwarded to HR for final decision."
          : "Leave request rejected."
      );
      setRejectDialogId(null);
      setRejectionReason("");
      await fetchPending(pendingPage);
      if (historyLoaded) fetchHistory(historyPage);
    } catch (e) {
      setError(
        e.response?.data?.message || `Failed to ${action} leave request.`
      );
    } finally {
      setActionId(null);
    }
  };

  const pendingColumns = usePendingColumns({
    actionId,
    onApprove: (id) => handleManagerAction(id, "approved"),
    onRejectOpen: (id) => setRejectDialogId(id),
  });

  const pendingTotalPages = pendingPagination.totalPages ?? pendingPagination.pages ?? 1;
  const historyTotalPages = historyPagination.totalPages ?? historyPagination.pages ?? 1;

  const pendingTablePagination = { pageIndex: pendingPage - 1, pageSize: 10 };
  const historyTablePagination = { pageIndex: historyPage - 1, pageSize: 10 };

  const pendingTable = useReactTable({
    data: pending,
    columns: pendingColumns,
    pageCount: pendingTotalPages,
    state: { pagination: pendingTablePagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pendingTablePagination) : updater;
      const newPage = next.pageIndex + 1;
      setPendingPage(newPage);
      fetchPending(newPage);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const historyTable = useReactTable({
    data: history,
    columns: historyColumns,
    pageCount: historyTotalPages,
    state: { pagination: historyTablePagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(historyTablePagination) : updater;
      const newPage = next.pageIndex + 1;
      setHistoryPage(newPage);
      fetchHistory(newPage);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 mt-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar / Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Leave Approvals
          </h3>
          <p className="text-sm text-muted-foreground">
            Review pending requests and view your decision history
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            fetchPending(pendingPage);
            if (historyLoaded) fetchHistory(historyPage);
          }}
          disabled={pendingLoading || historyLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${
              pendingLoading || historyLoading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectDialogId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogId(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectionReason.trim() || !!actionId}
              onClick={() =>
                handleManagerAction(rejectDialogId, "rejected", rejectionReason)
              }
            >
              {!!actionId && (
                <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
              )}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="pending" onValueChange={handleTabChange}>
        <TabsList className="h-9">
          <TabsTrigger value="pending" className="gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Pending
            {pending.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-medium">
                {pendingPagination.total ?? pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Pending tab */}
        <TabsContent value="pending" className="space-y-3 mt-3">
          <LeaveDataTable
            table={pendingTable}
            columns={pendingColumns}
            loading={pendingLoading}
            emptyMessage="No pending leave requests awaiting your approval."
          />
          <DataTablePagination table={pendingTable} />
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="space-y-3 mt-3">
          <LeaveDataTable
            table={historyTable}
            columns={historyColumns}
            loading={historyLoading}
            emptyMessage="No history yet."
          />
          <DataTablePagination table={historyTable} />
        </TabsContent>
      </Tabs>
    </div>
  );
}