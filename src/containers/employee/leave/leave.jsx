"use client";


import axiosInstance from "@/lib/axiosInstance";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,

} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";


import {

  CheckCircle2,

  RefreshCw,

  CalendarPlus,

  AlertCircle,

} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtDate } from "@/components/common/common";
import { getLeaveColumns, leaveTypeLabel } from "./leave-columns";





export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Plan changed");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const [form, setForm] = useState({
    leave_type: "full_day",
    start_date: "",
    end_date: "",
    reason: "",
    half_day_type: "morning",
    start_time: "",
    end_time: "",
  });

  const fetchLeaves = useCallback(async (p = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/leave/my", {
        params: {
          page: p + 1,
          limit: size,
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          sortOrder,
        },
      });

      const payload = res.data?.data ?? res.data ?? {};
      setLeaves(payload?.leaves ?? payload?.records ?? []);
      setPagination(payload?.pagination ?? {});
    } catch (e) {
      setError("Unable to load leave requests. Please try again later.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize, statusFilter, sortOrder]);

  useEffect(() => { fetchLeaves(0, pageSize); }, [fetchLeaves, pageSize]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = { leave_type: form.leave_type };
      if (form.leave_type === "full_day") {
        payload.start_date = form.start_date;
        payload.end_date   = form.end_date || form.start_date;
      } else {
        payload.leave_date = form.start_date;
      }
      if (form.leave_type === "half_day") payload.half_day_type = form.half_day_type;
      if (form.leave_type === "short_leave") {
        payload.start_time = form.start_time;
        payload.end_time   = form.end_time;
      }
      if (form.reason) payload.reason = form.reason;

      await axiosInstance.post("/leave/apply", payload);
      setSuccess("Leave request submitted successfully!");
      setForm({ leave_type: "full_day", start_date: "", end_date: "", reason: "", half_day_type: "morning", start_time: "", end_time: "" });
      setDialogOpen(false);
      setPage(0);
      await fetchLeaves(0, pageSize);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = useCallback((leave) => {
    if (!leave?.id) return;
    setLeaveToCancel(leave);
    setCancelReason("Plan changed");
    setCancelDialogOpen(true);
  }, []);

  const handleConfirmCancelLeave = useCallback(async () => {
    if (!leaveToCancel?.id) return;

    const reason = cancelReason.trim() || "Plan changed";

    setCancellingId(leaveToCancel.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await axiosInstance.patch(`/leave/${leaveToCancel.id}/cancel`, {
        cancel_reason: reason,
      });
      setSuccess(res.data?.message || "Leave cancelled successfully");
      setCancelDialogOpen(false);
      setLeaveToCancel(null);
      await fetchLeaves(page, pageSize);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to cancel leave request.");
    } finally {
      setCancellingId(null);
    }
  }, [cancelReason, fetchLeaves, leaveToCancel, page, pageSize]);

  const total = useMemo(() => {
    const rawTotal =
      pagination?.total ??
      pagination?.totalItems ??
      pagination?.total_items ??
      pagination?.count ??
      pagination?.itemCount ??
      pagination?.recordsTotal;

    let computedTotal = 0;

    if (typeof rawTotal === "number" && Number.isFinite(rawTotal)) {
      computedTotal = rawTotal;
    } else if (rawTotal !== null && rawTotal !== undefined) {
      const parsedTotal = Number(rawTotal);
      if (Number.isFinite(parsedTotal)) {
        computedTotal = parsedTotal;
      }
    }

    // Ensure total is at least as large as the visible records
    return Math.max(computedTotal, leaves.length);
  }, [pagination, leaves.length]);

  const filteredLeaves = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leaves;

    return leaves.filter((leave) => {
      const values = [
        leaveTypeLabel[leave.leave_type] || leave.leave_type,
        leave.reason || "",
        leave.status || "",
        fmtDate(leave.start_date),
        fmtDate(leave.end_date),
      ];
      return values.some((v) => String(v).toLowerCase().includes(term));
    });
  }, [leaves, search]);

  const columns = useMemo(
    () => getLeaveColumns({ onCancel: handleCancelLeave, cancellingId }),
    [handleCancelLeave, cancellingId]
  );

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setLeaveToCancel(null);
            setCancelReason("Plan changed");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Leave Request</DialogTitle>
            <DialogDescription>
              {leaveToCancel
                ? `This will cancel your ${leaveTypeLabel[leaveToCancel.leave_type] || leaveToCancel.leave_type} leave.`
                : "This action will cancel your leave request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label htmlFor="cancel-reason">Cancel reason</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason"
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelLeave}
              disabled={!cancelReason.trim() || cancellingId === leaveToCancel?.id}
            >
              {cancellingId === leaveToCancel?.id && <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Leave Requests</h3>
          <p className="text-sm text-muted-foreground">Manage and track your leave applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><CalendarPlus className="h-4 w-4" />Apply Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-120">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>Fill in the details to submit a new leave request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Leave Type</Label>
                <Select value={form.leave_type} onValueChange={(v) => setForm({ ...form, leave_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                    <SelectItem value="short_leave">Short Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={`grid gap-3 ${form.leave_type === "full_day" ? "grid-cols-2" : "grid-cols-1"}`}>
                <div className="space-y-1.5">
                  <Label>{form.leave_type === "full_day" ? "From Date" : "Date"}</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                {form.leave_type === "full_day" && (
                  <div className="space-y-1.5">
                    <Label>To Date</Label>
                    <Input type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                )}
              </div>
              {form.leave_type === "half_day" && (
                <div className="space-y-1.5">
                  <Label>Half Day Type</Label>
                  <Select value={form.half_day_type} onValueChange={(v) => setForm({ ...form, half_day_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.leave_type === "short_leave" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>End Time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Briefly describe the reason…" rows={3} className="resize-none" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !form.start_date ||
                  (form.leave_type === "short_leave" && (!form.start_time || !form.end_time))
                }
              >
                {submitting && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <TableToolbar
            placeholder="Search type, reason, status..."
            searchValue={search}
            onSearchChange={setSearch}
            total={total}
            className="mb-4"
            rightSlot={
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-35">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>

                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-35">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    avoidCollisions={false}
                  >
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{total}</span> requests
                </span>
              </div>
            }
          />

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <DataTable
              data={filteredLeaves}
              columns={columns}
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={(nextPage) => {
                setPage(nextPage);
                fetchLeaves(nextPage, pageSize);
              }}
              setPageSize={(nextSize) => {
                setPage(0);
                setPageSize(nextSize);
                fetchLeaves(0, nextSize);
              }}
              pagination
              columnsBtn={false}
              isLoading={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
