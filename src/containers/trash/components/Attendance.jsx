"use client";
import React, { useCallback, useEffect, useState } from "react";

import axiosInstance from "@/lib/axiosInstance";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  LogIn,
  LogOut,

  CheckCircle2,
  XCircle,
  RefreshCw,

  Briefcase,

  AlertCircle,
 
} from "lucide-react";
import { calcDuration, fmtTime, StatusBadge,fmtDate  } from "../common/page";
export default function AttendanceTab() {
    const [status, setStatus] = useState(null);
    const [myShift, setMyShift] = useState(null);
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [notes, setNotes] = useState("");
    const [page, setPage] = useState(1);
    const [liveTime, setLiveTime] = useState(new Date());
  
    useEffect(() => {
      const t = setInterval(() => setLiveTime(new Date()), 1000);
      return () => clearInterval(t);
    }, []);
  
    // GET /attendance/status → { success, message, data: { punch_status, check_in_time, check_out_time, status, ... } }
    const fetchStatus = useCallback(async () => {
      try {
        const res = await axiosInstance.get("/attendance/status");
        setStatus(res.data?.data ?? null);
      } catch (e) {
        console.error("Status fetch failed", e);
        setStatus(null);
      }
    }, []);
  
    // GET /attendance/assignments/me → { success, message, data: Assignment[], pagination }
    // Assignment shape: { id, assigned_from, assigned_to, is_active, shift: { id, name, start_time, end_time, duration_hours }, employee: {...} }
    const fetchMyShift = useCallback(async () => {
      try {
        const res = await axiosInstance.get("/attendance/assignments/me", {
          params: { limit: 1, is_active: true },
        });
        // data is an array of assignment objects; each has a nested shift object
        const items = res.data?.data ?? [];
        setMyShift(items[0] ?? null);
      } catch (e) {
        console.error("Shift fetch failed", e);
        setMyShift(null);
      }
    }, []);
  
    // GET /attendance/reports/me → { success, data: { records: [], summary: {}, pagination: {} } }
    const fetchRecords = useCallback(async (p = 1) => {
      try {
        const res = await axiosInstance.get("/attendance/reports/me", {
          params: { page: p, limit: 10 },
        });
        // Backend returns data.data.records and data.pagination (or data.data.pagination)
        const payload = res.data?.data ?? {};
        setRecords(payload.records ?? []);
        // pagination may be at top level or nested
        setPagination(res.data?.pagination ?? payload.pagination ?? {});
      } catch (e) {
        console.error("Records fetch failed", e);
        setRecords([]);
      }
    }, []);
  
    const loadAll = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.allSettled([fetchStatus(), fetchMyShift(), fetchRecords(page)]);
      } finally {
        setLoading(false);
      }
    }, [fetchStatus, fetchMyShift, fetchRecords, page]);
  
    useEffect(() => { loadAll(); }, [loadAll]);
  
    // POST /attendance/check-in → { success, message, data: AttendanceRecord }
    const handleCheckIn = async () => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await axiosInstance.post("/attendance/check-in", {
          ...(notes ? { notes } : {}),
        });
        setSuccess("Checked in successfully!");
        setNotes("");
        await fetchStatus();
        await fetchRecords(page);
      } catch (e) {
        setError(e.response?.data?.message || "Check-in failed. Please try again.");
      } finally {
        setActionLoading(false);
      }
    };
  
    // POST /attendance/check-out → { success, message, data: AttendanceRecord }
    const handleCheckOut = async () => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await axiosInstance.post("/attendance/check-out", {
          ...(notes ? { notes } : {}),
        });
        setSuccess("Checked out successfully!");
        setNotes("");
        await fetchStatus();
        await fetchRecords(page);
      } catch (e) {
        setError(e.response?.data?.message || "Check-out failed. Please try again.");
      } finally {
        setActionLoading(false);
      }
    };
  
    // punch_status: "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT"
    const punchStatus = status?.punch_status;
    const canCheckIn  = !punchStatus || punchStatus === "NOT_CHECKED_IN" || punchStatus === "CHECKED_OUT";
    const canCheckOut = punchStatus === "CHECKED_IN";
  
    const clockStr = liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr  = liveTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
    // The shift info lives on the assignment object: myShift.shift
    const shiftInfo = myShift?.shift ?? null;
  
    return (
      <div className="space-y-4">
        {success && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
  
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* ── Punch Card ── */}
          <Card className="lg:col-span-2 border-dashed border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Today's Punch</CardTitle>
                <div className={`h-2.5 w-2.5 rounded-full transition-colors ${canCheckOut ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
              </div>
              {shiftInfo && (
                <CardDescription className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {shiftInfo.name} · {shiftInfo.start_time}–{shiftInfo.end_time}
                </CardDescription>
              )}
              {!shiftInfo && !loading && (
                <CardDescription className="text-amber-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No shift assigned. Please contact HR.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live clock */}
              <div className="text-center py-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-3xl font-bold tabular-nums tracking-tight font-mono">{clockStr}</div>
                <div className="text-xs text-muted-foreground mt-1">{dateStr}</div>
              </div>
  
              {/* Today's punch summary */}
              {!loading && status && (
                <div className="flex items-center justify-between text-sm rounded-lg bg-muted/30 px-3 py-2.5 border border-border/40">
                  <div className="space-y-0.5">
                    {status.check_in_time && (
                      <div className="text-xs text-muted-foreground">
                        In: <span className="font-medium text-foreground">{fmtTime(status.check_in_time)}</span>
                        {status.check_out_time && (
                          <> · Out: <span className="font-medium text-foreground">{fmtTime(status.check_out_time)}</span></>
                        )}
                      </div>
                    )}
                    {status.check_in_time && status.check_out_time && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {calcDuration(status.check_in_time, status.check_out_time)}
                      </div>
                    )}
                    {!status.check_in_time && (
                      <div className="text-xs text-muted-foreground">Not checked in yet</div>
                    )}
                  </div>
                  <StatusBadge status={status.punch_status || status.status} />
                </div>
              )}
  
              {!loading && !status && (
                <div className="flex items-center rounded-lg bg-amber-500/10 px-3 py-2.5 border border-amber-500/20">
                  <span className="text-xs text-amber-700 dark:text-amber-400">Unable to load status. Please refresh.</span>
                </div>
              )}
  
              {loading && <Skeleton className="h-12 w-full rounded-lg" />}
  
              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="punch-notes" className="text-xs text-muted-foreground">Notes (optional)</Label>
                <Textarea
                  id="punch-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note…"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
  
              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || actionLoading || loading}
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                >
                  {actionLoading && canCheckIn
                    ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                    : <LogIn className="h-4 w-4 mr-1.5" />}
                  Check In
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!canCheckOut || actionLoading || loading}
                  variant="outline"
                  className="border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                >
                  {actionLoading && canCheckOut
                    ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                    : <LogOut className="h-4 w-4 mr-1.5" />}
                  Check Out
                </Button>
              </div>
  
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={loadAll}
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh status
              </Button>
            </CardContent>
          </Card>
  
          {/* ── History Card ── */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Attendance History</CardTitle>
              <CardDescription>Recent check-in / check-out records</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Check In</TableHead>
                        <TableHead className="text-xs">Check Out</TableHead>
                        <TableHead className="text-xs">Hours</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                            No attendance records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        records.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs text-muted-foreground">{fmtDate(r.date)}</TableCell>
                            <TableCell className="tabular-nums text-xs">{fmtTime(r.check_in_time)}</TableCell>
                            <TableCell className="tabular-nums text-xs">{fmtTime(r.check_out_time)}</TableCell>
                            <TableCell className="tabular-nums text-xs text-muted-foreground">
                              {r.duration_hours ? `${r.duration_hours}h` : "—"}
                            </TableCell>
                            <TableCell><StatusBadge status={r.status} /></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
  
              {(pagination.pages ?? 0) > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} · {pagination.total} records
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs px-2"
                      disabled={page <= 1}
                      onClick={() => { const p = page - 1; setPage(p); fetchRecords(p); }}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs px-2"
                      disabled={page >= pagination.pages}
                      onClick={() => { const p = page + 1; setPage(p); fetchRecords(p); }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }