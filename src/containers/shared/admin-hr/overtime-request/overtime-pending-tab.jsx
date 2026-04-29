"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import { getPendingOvertimeColumns } from "./overtime-request-columns";

export default function OvertimePendingTab({ role, refreshKey, onActionSuccess }) {

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({});

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [rejectDialogId, setRejectDialogId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pageRef = useRef(1);
  const pageSizeRef = useRef(10);

  const fetchPending = useCallback(
    async (pageNum = pageRef.current, limit = pageSizeRef.current) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: pageNum, limit, status: "pending" };
        const res = await axiosInstance.get("/attendance/overtime-requests", { params });
        setPending(res.data?.data ?? []);
        setPagination(res.data?.pagination ?? {});
      } catch {
        setError("Unable to load pending overtime requests.");
        setPending([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPending(1, pageSizeRef.current);
  }, [fetchPending, refreshKey]);

  const handleApprove = async (id) => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      const r = (role || "").toLowerCase();
      if (r === "manager") {
        await axiosInstance.patch(`/attendance/overtime-requests/${id}/manager-action`, { action: "approve" });
      } else if (r === "hr") {
        await axiosInstance.patch(`/attendance/overtime-requests/${id}/hr-action`, { action: "approve" });
      } else {
        await axiosInstance.put(`/attendance/overtime-requests/${id}/approve`);
      }
      setSuccess("Overtime request approved successfully!");
      onActionSuccess?.();
      fetchPending(pageRef.current, pageSizeRef.current);
    } catch {
      setError("Failed to approve overtime request.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      const r = (role || "").toLowerCase();
      if (r === "manager") {
        await axiosInstance.patch(`/attendance/overtime-requests/${id}/manager-action`, {
          action: "reject",
          rejection_reason: reason || "",
        });
      } else if (r === "hr") {
        await axiosInstance.patch(`/attendance/overtime-requests/${id}/hr-action`, {
          action: "reject",
          rejection_reason: reason || "",
        });
      } else {
        await axiosInstance.put(`/attendance/overtime-requests/${id}/reject`, {
          reason: reason || "",
        });
      }
      setSuccess("Overtime request rejected successfully!");
      setRejectDialogId(null);
      setRejectReason("");
      onActionSuccess?.();
      fetchPending(pageRef.current, pageSizeRef.current);
    } catch {
      setError("Failed to reject overtime request.");
    } finally {
      setActionId(null);
    }
  };

  const onPageChange = (nextPage) => {
    const pageNumber = nextPage + 1;
    pageRef.current = pageNumber;
    setPage(pageNumber);
    fetchPending(pageNumber, pageSizeRef.current);
  };

  const onPageSizeChange = (nextPageSize) => {
    pageSizeRef.current = nextPageSize;
    setPageSize(nextPageSize);
    pageRef.current = 1;
    setPage(1);
    fetchPending(1, nextPageSize);
  };

  const retryFetch = () => fetchPending(pageRef.current, pageSizeRef.current);
  const total = pagination.total ?? pending.length ?? 0;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={retryFetch}>
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
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Overtime Request</DialogTitle>
            <DialogDescription>Provide a reason for rejection (optional).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!actionId}
              onClick={() => handleReject(rejectDialogId, rejectReason)}
            >
              {!!actionId && <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableToolbar
        total={total}
        rightSlot={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={retryFetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
      />

      <DataTable
        data={pending}
        columns={getPendingOvertimeColumns({
          role: role?.toLowerCase(),
          actionId,
          onApprove: handleApprove,
          onRejectOpen: (id) => setRejectDialogId(id),
        })}
        page={page - 1}
        pageSize={pageSize}
        total={total}
        setPage={onPageChange}
        setPageSize={onPageSizeChange}
        columnsBtn={false}
        isLoading={loading}
        loadingText="Loading pending overtime requests…"
        emptyText="No pending overtime requests."
      />
    </div>
  );
}
