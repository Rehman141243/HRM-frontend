"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

// ─── shadcn/ui imports ─────────────────────────────────────────────────────
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Alert,
  AlertDescription,

} from "@/components/ui/alert";


import {

  CheckCircle2,

  RefreshCw,
 
  AlertCircle,

  ThumbsUp,
  ThumbsDown,

} from "lucide-react";

import { fmtDate,  StatusBadge,} from "@/components/common/common";








export default function HRLeaveApprovalTab() {
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

  const fetchLeaves = useCallback(async (p = 1, filter = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 10 };
      if (filter === "pending_hr") {
        params.manager_status = "approved";
        params.hr_status = "pending";
      } else if (filter !== "all") {
        params.status = filter;
      }
      const res = await axiosInstance.get("/leaves", { params });
      setLeaves(res.data?.leaves ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load leave requests.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLeaves(1); }, [fetchLeaves]);

  const handleHRAction = async (id, action, reason = "") => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.patch(`/leave/${id}/hr-action`, {
        action,
        ...(action === "rejected" ? { rejection_reason: reason } : {}),
      });
      setSuccess(`Leave request ${action} by HR successfully.`);
      setRejectDialogId(null);
      setRejectionReason("");
      await fetchLeaves(page);
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${action} leave request.`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold">Leave Management (HR)</h3>
          <p className="text-sm text-muted-foreground">Final approval authority for all leave requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); fetchLeaves(1, v); }}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leaves</SelectItem>
              <SelectItem value="pending_hr">Pending HR Action</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => fetchLeaves(page)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead><TableHead>Type</TableHead>
                  <TableHead>From</TableHead><TableHead>To</TableHead>
                  <TableHead>Days</TableHead><TableHead>Mgr Status</TableHead>
                  <TableHead>HR Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">No leave requests found.</TableCell></TableRow>
                ) : (
                  leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">
                        {l.employee ? `${l.employee.first_name} ${l.employee.last_name}` : "—"}
                        {l.employee?.department && <div className="text-xs text-muted-foreground">{l.employee.department}</div>}
                      </TableCell>
                      <TableCell className="text-xs">{l.leave_type?.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.start_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.end_date)}</TableCell>
                      <TableCell className="text-xs tabular-nums">{l.total_days ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={l.manager_status} /></TableCell>
                      <TableCell><StatusBadge status={l.hr_status} /></TableCell>
                      <TableCell>
                        {l.manager_status === "approved" && l.hr_status === "pending" ? (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10" disabled={actionId === l.id} onClick={() => handleHRAction(l.id, "approved")}>
                              {actionId === l.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}Approve
                            </Button>
                            <Dialog open={rejectDialogId === l.id} onOpenChange={(open) => { if (!open) { setRejectDialogId(null); setRejectionReason(""); } }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-500/40 text-red-600 hover:bg-red-500/10" onClick={() => setRejectDialogId(l.id)}>
                                  <ThumbsDown className="h-3 w-3" />Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader><DialogTitle>Reject Leave Request</DialogTitle><DialogDescription>Provide a reason for rejection.</DialogDescription></DialogHeader>
                                <div className="space-y-3 py-2">
                                  <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason…" rows={3} className="resize-none" />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => { setRejectDialogId(null); setRejectionReason(""); }}>Cancel</Button>
                                  <Button variant="destructive" disabled={!rejectionReason.trim() || actionId === l.id} onClick={() => handleHRAction(l.id, "rejected", rejectionReason)}>
                                    {actionId === l.id && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}Confirm Reject
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {l.manager_status !== "approved" ? "Awaiting manager" : "Processed"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {(pagination.totalPages ?? pagination.pages ?? 1) > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{pagination.total} total</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetchLeaves(p); }}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= (pagination.totalPages ?? pagination.pages ?? 1)} onClick={() => { const p = page + 1; setPage(p); fetchLeaves(p); }}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
