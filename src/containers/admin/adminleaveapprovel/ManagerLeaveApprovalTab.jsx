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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  ShieldCheck,
} from "lucide-react";

import { fmtDate, StatusBadge } from "@/components/common/common";
import { DataTablePagination } from "@/components/common/data-table-pagination";

// ─── Column definitions ────────────────────────────────────────────────────────
function useColumns({ actionId, onApprove, onRejectOpen }) {
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
              {emp.department && (
                <p className="text-xs text-muted-foreground">{emp.department}</p>
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
        accessorKey: "manager_status",
        header: "Mgr Status",
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const l = row.original;
          if (l.status !== "pending") {
            return (
              <span className="text-xs text-muted-foreground capitalize">{l.status}</span>
            );
          }
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

// ─── Toolbar ───────────────────────────────────────────────────────────────────
function LeaveTableToolbar({ statusFilter, onFilterChange, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Leave Management (Admin)
        </h3>
        <p className="text-sm text-muted-foreground">
          Full authority — approve or reject any pending leave request
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leaves</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AdminLeaveApprovalTab() {
  const user = getUser();
  if (user?.designation !== "admin") return null;

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLeaves = useCallback(
    async (p = 1, filter = statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: p, limit: 10 };
        if (filter !== "all") params.status = filter;
        const res = await axiosInstance.get("/leaves", { params });
        setLeaves(res.data?.leaves ?? []);
        setPagination(res.data?.pagination ?? {});
      } catch {
        setError("Unable to load leave requests.");
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  const handleAdminAction = async (id, action, reason = "") => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.patch(`/leave/${id}/hr-action`, {
        action,
        ...(action === "rejected" ? { rejection_reason: reason } : {}),
      });
      setSuccess(`Leave request ${action} successfully.`);
      setRejectDialogId(null);
      setRejectionReason("");
      await fetchLeaves(page);
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${action} leave request.`);
    } finally {
      setActionId(null);
    }
  };

  const columns = useColumns({
    actionId,
    onApprove: (id) => handleAdminAction(id, "approved"),
    onRejectOpen: (id) => setRejectDialogId(id),
  });

  const totalPages = pagination.totalPages ?? pagination.pages ?? 1;

  // Fake pagination object compatible with DataTablePagination
  const tablePagination = {
    pageIndex: page - 1,
    pageSize: 10,
  };

  const table = useReactTable({
    data: leaves,
    columns,
    pageCount: totalPages,
    state: { pagination: tablePagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(tablePagination) : updater;
      const newPage = next.pageIndex + 1;
      setPage(newPage);
      fetchLeaves(newPage);
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

      {/* Toolbar */}
      <LeaveTableToolbar
        statusFilter={statusFilter}
        onFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
          fetchLeaves(1, v);
        }}
        onRefresh={() => fetchLeaves(page)}
        loading={loading}
      />

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
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
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
                handleAdminAction(rejectDialogId, "rejected", rejectionReason)
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
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
                      No leave requests found.
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

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}