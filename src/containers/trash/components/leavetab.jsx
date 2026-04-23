"use client";


import axiosInstance from "@/lib/axiosInstance";


import { Badge } from "@/components/ui/badge";
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

  CalendarPlus,

  AlertCircle,

} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fmtDate, StatusBadge } from "../common/page";





export default function LeaveTab() {
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    leave_type: "full_day",
    start_date: "",
    end_date: "",
    reason: "",
    half_day_type: "morning",
    start_time: "",
    end_time: "",
  });

  const fetchLeaves = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/leave/my", { params: { page: p, limit: 8 } });
      setLeaves(res.data?.leaves ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load leave requests. Please try again later.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(1); }, [fetchLeaves]);

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
      await fetchLeaves(1);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const leaveTypeLabel = { full_day: "Full Day", half_day: "Half Day", short_leave: "Short Leave" };
  const totalPages = pagination.totalPages ?? pagination.pages ?? 1;

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Leave Requests</h3>
          <p className="text-sm text-muted-foreground">Manage and track your leave applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><CalendarPlus className="h-4 w-4" />Apply Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
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
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No leave requests found.</TableCell></TableRow>
                ) : (
                  leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium text-sm">{leaveTypeLabel[l.leave_type] || l.leave_type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.start_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.end_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{l.reason || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(l.submitted_at || l.created_at)}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{pagination.total} total requests</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetchLeaves(p); }}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => { const p = page + 1; setPage(p); fetchLeaves(p); }}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
