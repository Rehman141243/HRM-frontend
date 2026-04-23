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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Alert,
  AlertDescription,
 
} from "@/components/ui/alert";


import {

  CheckCircle2,
  RefreshCw,
  Shield,
  AlertCircle,

} from "lucide-react";
import { fmtDate, StatusBadge, todayDateStr } from "@/components/common/common";;
import { useCallback, useEffect, useState } from "react";










export default function ShiftRequestsTab() {
  const [requests, setRequests] = useState([]);

  const [shifts, setShifts] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    requested_shift_id: "",
    request_date: todayDateStr(),
    reason: "",
  });


  const fetchRequests = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/attendance/shift-requests/me", {
        params: { page: p, limit: 8 },
      });
      setRequests(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load shift requests. Please try again later.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchCurrentAssignment = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/attendance/assignments/me", {
        params: { is_active: true, limit: 1 },
      });
      const items = res.data?.data ?? [];
      setCurrentAssignment(items[0] ?? null);
    } catch (e) {
      setCurrentAssignment(null);
    }
  }, []);


  const fetchShifts = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/attendance/shifts/me", {
        params: { is_active: true },
      });
  
      setShifts(res.data?.data ?? []);
    } catch (e) {

      setShifts([]);
    }
  }, []);

  useEffect(() => {
    fetchRequests(1);
    fetchCurrentAssignment();
    fetchShifts();
  }, [fetchRequests, fetchCurrentAssignment, fetchShifts]);
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!currentAssignment?.shift?.id) {
        throw new Error("No active shift assignment found. Cannot submit shift change request.");
      }
      await axiosInstance.post("/attendance/shift-requests", {
        current_shift_id: currentAssignment.shift.id,
        requested_shift_id: form.requested_shift_id,
        request_date: form.request_date,
        ...(form.reason ? { reason: form.reason } : {}),
      });
      setSuccess("Shift change request submitted successfully!");
      setForm({ requested_shift_id: "", request_date: todayDateStr(), reason: "" });
      setDialogOpen(false);
      await fetchRequests(1);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to submit shift request.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out the currently assigned shift so employee can only request a different one
  const currentShiftId = currentAssignment?.shift?.id;
  const availableShifts = shifts.filter((s) => s.id !== currentShiftId);

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Shift Change Requests</h3>
          <p className="text-sm text-muted-foreground">
            Request a change to your assigned shift
            {currentAssignment?.shift && (
              <span className="ml-1 text-foreground/70">
                (current: <strong>{currentAssignment.shift.name}</strong> {currentAssignment.shift.start_time}–{currentAssignment.shift.end_time})
              </span>
            )}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" disabled={!currentAssignment}>
              <Shield className="h-4 w-4" />Request Shift Change
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Shift Change Request</DialogTitle>
              <DialogDescription>Select the shift you'd like to switch to.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Request Date</Label>
                <Input
                  type="date"
                  value={form.request_date}
                  onChange={(e) => setForm({ ...form, request_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Requested Shift</Label>
                {availableShifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    {shifts.length === 0
                      ? "Unable to load available shifts. Contact HR to change your shift."
                      : "No other active shifts available."}
                  </p>
                ) : (
                  <Select value={form.requested_shift_id} onValueChange={(v) => setForm({ ...form, requested_shift_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a shift…" /></SelectTrigger>
                    <SelectContent>
                      {availableShifts.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} · {s.start_time}–{s.end_time} ({s.duration_hours}h)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Why are you requesting this change?"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.requested_shift_id || !form.request_date || availableShifts.length === 0}
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
                  <TableHead>Request Date</TableHead>
                  <TableHead>From Shift</TableHead>
                  <TableHead>Requested Shift</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">No shift change requests found.</TableCell></TableRow>
                ) : (
                  requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.request_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.current_shift?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{r.requested_shift?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[130px] truncate">{r.reason || "—"}</TableCell>
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