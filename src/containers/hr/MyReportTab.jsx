"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Skeleton } from "@/components/ui/skeleton";

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
import { Progress } from "@/components/ui/progress";


import {

  RefreshCw,

  BarChart3,

  AlertCircle,
 
} from "lucide-react";
import { fmtDate, fmtTime, getUserRole, StatusBadge, todayDateStr } from "@/components/common/common";
import { useCallback, useEffect, useState } from "react";






export default function MyReportTab() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end_date: todayDateStr(),
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/attendance/reports/me", {
        params: { ...filters, page: 1, limit: 100 },
      });
      setReport(res.data?.data ?? null);
    } catch (e) {
      setError("Unable to load attendance report. Please try again later.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary = report?.summary;
  const summaryItems = summary ? [
    { label: "Present",  value: summary.present,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Absent",   value: summary.absent,   color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10" },
    { label: "On Leave", value: summary.on_leave, color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10" },
    { label: "Hours",    value: summary.total_worked_hours ? `${summary.total_worked_hours}h` : "0h", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  ] : [];

  const presentPercent = summary?.present && summary?.total_records
    ? Math.round((summary.present / summary.total_records) * 100) : 0;

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="h-9 text-sm w-36 " />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="h-9 text-sm w-36" />
            </div>
            <Button size="sm" onClick={fetchReport} disabled={loading} className="h-9">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <BarChart3 className="h-4 w-4 mr-1.5 dark:text-white" />}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryItems.map((item) => (
              <div key={item.label} className={`rounded-xl border border-border/50 p-4 ${item.bg}`}>
                <div className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-sm font-bold tabular-nums">{presentPercent}%</span>
              </div>
              <Progress value={presentPercent} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                {summary.present} out of {summary.total_records} working days
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Detailed Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <ScrollArea className="h-[340px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Check In</TableHead>
                    <TableHead className="text-xs">Check Out</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Shift</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!report?.records?.length ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No records in this period.</TableCell></TableRow>
                  ) : (
                    report.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs text-muted-foreground">{fmtDate(r.date)}</TableCell>
                        <TableCell className="tabular-nums text-xs">{fmtTime(r.check_in_time)}</TableCell>
                        <TableCell className="tabular-nums text-xs">{fmtTime(r.check_out_time)}</TableCell>
                        <TableCell className="tabular-nums text-xs text-muted-foreground">
                          {r.duration_hours ? `${r.duration_hours}h` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.shift?.name ?? "—"}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
