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

  Hourglass,
 
  AlertCircle,

} from "lucide-react";

import { fmtDate, StatusBadge, todayDateStr } from "@/components/common/common";
import  { useCallback, useEffect,useState } from "react";



export default function OvertimeTab() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    date: todayDateStr(),
    start_time: "",
    end_time: "",
    hours: "",
    reason: "",
  });

  // GET /attendance/overtime-requests/me → { success, data: [], pagination }
  const fetchRequests = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/attendance/overtime-requests/me", {
        params: { page: p, limit: 8 },
      });
      setRequests(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load overtime requests. Please try again later.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  // Auto-calculate hours from start/end time
  useEffect(() => {
    if (form.start_time && form.end_time) {
      const [sh, sm] = form.start_time.split(":").map(Number);
      const [eh, em] = form.end_time.split(":").map(Number);
      const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
      if (diff > 0) setForm((f) => ({ ...f, hours: diff.toFixed(2) }));
    }
  }, [form.start_time, form.end_time]);

  // POST /attendance/overtime-requests → validator: createOvertimeRequestSchema
  // Required: date (ISO), start_time (HH:MM), end_time (HH:MM), hours (positive number ≤ 24)
  // Validation: end_time must be greater than start_time (hasInvalidTimeRange check)
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.post("/attendance/overtime-requests", {
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        hours: parseFloat(form.hours),
        ...(form.reason ? { reason: form.reason } : {}),
      });
      setSuccess("Overtime request submitted successfully!");
      setForm({ date: todayDateStr(), start_time: "", end_time: "", hours: "", reason: "" });
      setDialogOpen(false);
      await fetchRequests(1);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit overtime request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Overtime Requests</h3>
          <p className="text-sm text-muted-foreground">Track and submit overtime claims</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Hourglass className="h-4 w-4" />Request Overtime</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Overtime Request</DialogTitle>
              <DialogDescription>Submit an overtime claim for approval.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Hours (auto-calculated)</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.01"
                  max="24"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="e.g. 2.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Describe the overtime work…"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.date || !form.start_time || !form.end_time || !form.hours || parseFloat(form.hours) <= 0}
              >
                {submitting && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}Submit
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
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">No overtime requests found.</TableCell></TableRow>
                ) : (
                  requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.date)}</TableCell>
                      <TableCell className="tabular-nums text-xs">{r.start_time} – {r.end_time}</TableCell>
                      <TableCell className="tabular-nums text-sm font-medium">{r.hours}h</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{r.reason || "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}