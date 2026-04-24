// app/admin/leave-management/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Eye, MessageSquare } from "lucide-react";
import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../shift-management/admin-shift";


export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "approved" or "rejected"
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const LIMIT = 10;

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/leaves", {
        params: {
          page,
          limit: LIMIT,
          status: statusFilter,
        },
      });
      setLeaves(data.leaves || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleManagerAction = async (leaveId, action) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = { action }; // action must be "approved" or "rejected"
      if (action === "rejected" && rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }
      
      await axiosInstance.patch(`/leave/${leaveId}/manager-action`, payload);
      setSuccess(`Leave request ${action} successfully`);
      setActionDialogOpen(false);
      setRejectionReason("");
      setSelectedLeave(null);
      loadLeaves();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} leave request`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHRAction = async (leaveId, action) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = { action }; // action must be "approved" or "rejected"
      if (action === "rejected" && rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }
      
      await axiosInstance.patch(`/leave/${leaveId}/hr-action`, payload);
      setSuccess(`Leave request ${action} successfully`);
      setActionDialogOpen(false);
      setRejectionReason("");
      setSelectedLeave(null);
      loadLeaves();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} leave request`);
    } finally {
      setSubmitting(false);
    }
  };

  const openActionDialog = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action); // "approved" or "rejected"
    setRejectionReason("");
    setActionDialogOpen(true);
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      full_day: "Full Day",
      half_day: "Half Day",
      short_leave: "Short Leave",
    };
    return labels[type] || type;
  };

  const getLeaveDetails = (leave) => {
    if (leave.leave_type === "full_day") {
      return `${leave.start_date} → ${leave.end_date}`;
    }
    if (leave.leave_type === "half_day") {
      return `${leave.start_date} (${leave.half_day_type === "morning" ? "Morning" : "Evening"})`;
    }
    if (leave.leave_type === "short_leave") {
      return `${leave.start_date} (${leave.start_time}–${leave.end_time})`;
    }
    return leave.start_date;
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={6} /></div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No leave requests found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-3 text-left font-medium">Employee</th>
                      <th className="py-3 text-left font-medium">Type</th>
                      <th className="py-3 text-left font-medium">Duration</th>
                      <th className="py-3 text-left font-medium">Reason</th>
                      <th className="py-3 text-left font-medium">Manager Status</th>
                      <th className="py-3 text-left font-medium">HR Status</th>
                      <th className="py-3 text-left font-medium">Final Status</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="border-b border-border/40 last:border-0">
                        <td className="py-3">
                          <div className="font-medium">
                            {leave.employee?.first_name} {leave.employee?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {leave.employee?.designation}
                          </div>
                        </td>
                        <td className="py-3">{getLeaveTypeLabel(leave.leave_type)}</td>
                        <td className="py-3 text-xs">{getLeaveDetails(leave)}</td>
                        <td className="py-3 text-xs max-w-[200px] truncate">
                          {leave.reason || "—"}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={leave.manager_status} />
                        </td>
                        <td className="py-3">
                          <StatusBadge status={leave.hr_status} />
                        </td>
                        <td className="py-3">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {leave.status === "pending" && leave.manager_status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600"
                                  onClick={() => openActionDialog(leave, "approved")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => openActionDialog(leave, "rejected")}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {leave.manager_status === "approved" && leave.hr_status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600"
                                  onClick={() => openActionDialog(leave, "approved")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => openActionDialog(leave, "rejected")}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Submitted by {selectedLeave?.employee?.first_name} {selectedLeave?.employee?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-muted-foreground">Leave Type</Label>
                  <p className="font-medium">{getLeaveTypeLabel(selectedLeave.leave_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{getLeaveDetails(selectedLeave)}</p>
                </div>
                {selectedLeave.leave_type === "full_day" && (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Total Days</Label>
                      <p className="font-medium">{selectedLeave.total_days} days</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Hours</Label>
                      <p className="font-medium">{selectedLeave.total_hours} hours</p>
                    </div>
                  </>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="text-sm mt-1 p-2 rounded-md bg-muted/40">
                  {selectedLeave.reason || "No reason provided"}
                </p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Manager Status:</span>
                  <StatusBadge status={selectedLeave.manager_status} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">HR Status:</span>
                  <StatusBadge status={selectedLeave.hr_status} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Final Status:</span>
                  <StatusBadge status={selectedLeave.status} />
                </div>
              </div>
              {selectedLeave.rejection_reason && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm mt-1 p-2 rounded-md bg-red-500/10 text-red-600">
                    {selectedLeave.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approved"
                ? `Are you sure you want to approve leave request for ${selectedLeave?.employee?.first_name} ${selectedLeave?.employee?.last_name}?`
                : `Are you sure you want to reject leave request for ${selectedLeave?.employee?.first_name} ${selectedLeave?.employee?.last_name}?`}
            </DialogDescription>
          </DialogHeader>
          {actionType === "rejected" && (
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button
              variant={actionType === "approved" ? "default" : "destructive"}
              onClick={() => {
                if (selectedLeave) {
                  if (selectedLeave.manager_status === "pending") {
                    handleManagerAction(selectedLeave.id, actionType);
                  } else {
                    handleHRAction(selectedLeave.id, actionType);
                  }
                }
              }}
              disabled={submitting || (actionType === "rejected" && !rejectionReason)}
            >
              {submitting && <Spinner size={4} />}
              {actionType === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}