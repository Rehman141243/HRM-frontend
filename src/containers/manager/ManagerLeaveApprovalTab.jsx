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
  AlertTitle,
} from "@/components/ui/alert";


import {

  CheckCircle2,

  RefreshCw,

  AlertCircle,
 
  ThumbsUp,
  ThumbsDown,
  Building2,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge, fmtDate } from "@/components/common/common"





export default function ManagerLeaveApprovalTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogId, setRejectDialogId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchLeaves = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/leaves", {
        params: { page: p, limit: 10, status: "pending", manager_status: "pending" },
      });
      setLeaves(res.data?.leaves ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load leave requests.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(1); }, [fetchLeaves]);

  const handleManagerAction = async (id, action, reason = "") => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.patch(`/leave/${id}/manager-action`, {
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

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Pending Leave Approvals</h3>
          <p className="text-sm text-muted-foreground">Review and take action on leave requests</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => fetchLeaves(page)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8 text-sm">No pending leave requests.</TableCell></TableRow>
                ) : (
                  leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">
                        {l.employee ? `${l.employee.first_name} ${l.employee.last_name}` : "—"}
                        {l.employee?.designation && <div className="text-xs text-muted-foreground">{l.employee.designation}</div>}
                      </TableCell>
                      <TableCell className="text-xs">{l.leave_type?.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.start_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.end_date)}</TableCell>
                      <TableCell className="text-xs tabular-nums">{l.total_days ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{l.reason || "—"}</TableCell>
                      <TableCell><StatusBadge status={l.manager_status} /></TableCell>
                      <TableCell>
                        {l.manager_status === "pending" ? (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                              disabled={actionId === l.id}
                              onClick={() => handleManagerAction(l.id, "approved")}
                            >
                              {actionId === l.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
                              Approve
                            </Button>
                            <Dialog open={rejectDialogId === l.id} onOpenChange={(open) => { if (!open) { setRejectDialogId(null); setRejectionReason(""); } }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-500/40 text-red-600 hover:bg-red-500/10" onClick={() => setRejectDialogId(l.id)}>
                                  <ThumbsDown className="h-3 w-3" />Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                  <DialogTitle>Reject Leave Request</DialogTitle>
                                  <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 py-2">
                                  <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason…" rows={3} className="resize-none" />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => { setRejectDialogId(null); setRejectionReason(""); }}>Cancel</Button>
                                  <Button variant="destructive" disabled={!rejectionReason.trim() || actionId === l.id} onClick={() => handleManagerAction(l.id, "rejected", rejectionReason)}>
                                    {actionId === l.id && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}Confirm Reject
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : <StatusBadge status={l.manager_status} />}
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
