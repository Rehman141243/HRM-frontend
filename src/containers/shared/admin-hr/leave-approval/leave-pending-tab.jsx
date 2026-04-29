"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/data-table";

import { getPendingColumns } from "./leave-approval-columns";

export default function PendingTab({
  role,
  filters = {},
  onClearFilters,
  onLeaveTypeChange,
  onSortOrderChange,
  refreshKey,
  onActionSuccess,
}) {
  const {
    statusFilter,
    managerStatusFilter,
    hrStatusFilter,
    leaveTypeFilter,
    employeeIdFilter,
    startDateFilter,
    endDateFilter,
    sortOrder,
  } = filters;

  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(10);
  const [pendingPagination, setPendingPagination] = useState({});

  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState(null);

  const pendingPageRef = useRef(1);
  const pendingPageSizeRef = useRef(10);

  const resetPendingPage = () => {
    pendingPageRef.current = 1;
    setPendingPage(1);
  };

  const buildPendingParams = useCallback(
    (page = pendingPageRef.current, limit = pendingPageSizeRef.current) => {
      const params = { page, limit, sortOrder };

      if (statusFilter !== "all") params.status = statusFilter;
      if (managerStatusFilter !== "all") params.manager_status = managerStatusFilter;
      if (hrStatusFilter !== "all") params.hr_status = hrStatusFilter;
      if (leaveTypeFilter !== "all") params.leave_type = leaveTypeFilter;
      if (employeeIdFilter?.trim()) params.employee_id = employeeIdFilter.trim();
      if (startDateFilter) params.start_date = startDateFilter;
      if (endDateFilter) params.end_date = endDateFilter;

      if (role === "manager") {
        if (params.status === undefined) params.status = "pending";
        if (params.manager_status === undefined) params.manager_status = "pending";
      }

      if (role === "hr") {
        if (params.status === undefined) params.status = "pending";
        if (params.manager_status === undefined) params.manager_status = "approved";
        if (params.hr_status === undefined) params.hr_status = "pending";
      }

      return params;
    },
    [
      role,
      statusFilter,
      managerStatusFilter,
      hrStatusFilter,
      leaveTypeFilter,
      employeeIdFilter,
      startDateFilter,
      endDateFilter,
      sortOrder,
    ]
  );

  const fetchPending = useCallback(
    async (page = pendingPageRef.current, limit = pendingPageSizeRef.current) => {
      setPendingLoading(true);
      setError(null);
      try {
        const params = buildPendingParams(page, limit);
        const endpoint = role === "employee" ? "/leave/my" : "/leaves";
        const res = await axiosInstance.get(endpoint, { params });
        setPending(res.data?.leaves ?? []);
        setPendingPagination(res.data?.pagination ?? {});
      } catch {
        setError("Unable to load leave requests.");
        setPending([]);
        setPendingPagination({});
      } finally {
        setPendingLoading(false);
      }
    },
    [role, buildPendingParams]
  );

  useEffect(() => {
    fetchPending(1, pendingPageSizeRef.current);
  }, [fetchPending, refreshKey]);

  const handleAction = async (id, action, reason = "") => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      const endpoint =
        role === "manager"
          ? `/leave/${id}/manager-action`
          : `/leave/${id}/hr-action`;

      await axiosInstance.patch(endpoint, {
        action,
        ...(action === "rejected" ? { rejection_reason: reason } : {}),
      });

      let message = `Leave request ${action}`;
      if (role === "manager" && action === "approved") {
        message = "Leave approved and forwarded to HR for final decision.";
      }

      setSuccess(message);
      setRejectDialogId(null);
      setRejectionReason("");
      onActionSuccess?.();
      await fetchPending(pendingPageRef.current, pendingPageSizeRef.current);
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${action} leave request.`);
    } finally {
      setActionId(null);
    }
  };

  const retryPending = () =>
    fetchPending(pendingPageRef.current, pendingPageSizeRef.current);

  const onPendingPageChange = (nextPage) => {
    const pageNumber = nextPage + 1;
    pendingPageRef.current = pageNumber;
    setPendingPage(pageNumber);
    fetchPending(pageNumber, pendingPageSizeRef.current);
  };

  const onPendingPageSizeChange = (nextPageSize) => {
    pendingPageSizeRef.current = nextPageSize;
    setPendingPageSize(nextPageSize);
    pendingPageRef.current = 1;
    setPendingPage(1);
    fetchPending(1, nextPageSize);
  };

  const pendingColumns = getPendingColumns({
    role,
    actionId,
    onApprove: (id) => handleAction(id, "approved"),
    onRejectOpen: (id) => setRejectDialogId(id),
  });

  const totalPending = pendingPagination.total ?? pending.length ?? 0;

  const toolbar = (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Select
          value={sortOrder}
          onValueChange={(value) => {
            onSortOrderChange?.(value);
            resetPendingPage();
          }}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={retryPending} disabled={pendingLoading}>
          <RefreshCw className={`h-4 w-4 ${pendingLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" variant="outline" onClick={onClearFilters} disabled={pendingLoading}>
          Reset
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select
          value={leaveTypeFilter}
          onValueChange={(value) => {
            onLeaveTypeChange?.(value);
            resetPendingPage();
          }}
        >
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="Leave type" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="all">All Leave Types</SelectItem>
            <SelectItem value="full_day">Full Day</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="short_leave">Short Leave</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-4">
          <Button size="sm" onClick={retryPending} disabled={pendingLoading}>
            Apply Filters
          </Button>
          <Button size="sm" variant="outline" onClick={onClearFilters} disabled={pendingLoading}>
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={retryPending}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Dialog
        open={!!rejectDialogId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogId(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-105">
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
              onClick={() => handleAction(rejectDialogId, "rejected", rejectionReason)}
            >
              {!!actionId && <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toolbar}

      <DataTable
        data={pending}
        columns={pendingColumns}
        page={pendingPage - 1}
        pageSize={pendingPageSize}
        total={totalPending}
        setPage={onPendingPageChange}
        setPageSize={onPendingPageSizeChange}
        pagination
        columnsBtn={false}
        isLoading={pendingLoading}
        loadingText="Loading leave requests…"
        noDataText="No results"
      />
    </div>
  );
}
