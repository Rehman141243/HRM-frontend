"use client";


import axiosInstance from "@/lib/axiosInstance";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  RefreshCw,

  BarChart3,
 
  AlertCircle,

} from "lucide-react";

import  { fmtDate, fmtTime, StatusBadge, todayDateStr } from "@/components/common/common";;


export default function HRAttendanceDailyTab() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(todayDateStr());
  const [department, setDepartment] = useState("");
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { date };
      if (department) params.department = department;
      const res = await axiosInstance.get("/attendance/reports/daily", { params });
      setReport(res.data?.data ?? null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load daily report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-sm w-36" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department (optional)</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" className="h-9 text-sm w-40" />
            </div>
            <Button size="sm" onClick={fetchReport} disabled={loading} className="h-9">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <BarChart3 className="h-4 w-4 mr-1.5" />}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Employees", value: report.summary?.total_employees ?? 0, color: "text-blue-600", bg: "bg-blue-500/10" },
              { label: "Present",         value: report.summary?.present ?? 0,         color: "text-emerald-600", bg: "bg-emerald-500/10" },
              { label: "Absent",          value: report.summary?.absent ?? 0,          color: "text-red-600", bg: "bg-red-500/10" },
              { label: "On Leave",        value: report.summary?.on_leave ?? 0,        color: "text-amber-600", bg: "bg-amber-500/10" },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl border border-border/50 p-4 ${item.bg}`}>
                <div className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Employee Attendance — {fmtDate(report.date)}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[380px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Check In</TableHead>
                      <TableHead className="text-xs">Check Out</TableHead>
                      <TableHead className="text-xs">Hours</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(report.records ?? []).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">No records for this date.</TableCell></TableRow>
                    ) : (
                      (report.records ?? []).map((r, idx) => (
                        <TableRow key={r.id ?? idx}>
                          <TableCell className="text-sm font-medium">
                            {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : r.employee_id}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.employee?.department ?? "—"}</TableCell>
                          <TableCell className="tabular-nums text-xs">{fmtTime(r.check_in_time)}</TableCell>
                          <TableCell className="tabular-nums text-xs">{fmtTime(r.check_out_time)}</TableCell>
                          <TableCell className="tabular-nums text-xs">{r.duration_hours ? `${r.duration_hours}h` : "—"}</TableCell>
                          <TableCell><StatusBadge status={r.status} /></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}