"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { MONTH_NAMES, StatusBadge, fmtNum, fmtPKR, normalizePayroll } from "@/components/modal-components/modalcomponents";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";

export default function PayrollDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const payrollId = params?.id;
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  const employeeUserId = useMemo(
    () => user?.employee_id ?? null,
    [user]
  );
  console.log("Employee User ID:", employeeUserId);

  useEffect(() => {
    if (!payrollId || !employeeUserId) return;
    setLoading(true);
    setError(null);
    setPayroll(null);
    axiosInstance.get(`/payroll/${employeeUserId}`)
      .then(res => {
        const payrolls = Array.isArray(res.data?.payrolls) ? res.data.payrolls : [];
        const found = payrolls.find(p => String(p.id) === String(payrollId));
        if (found) {
          setPayroll(normalizePayroll(found));
        } else {
          setError("Payroll details not found.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Payroll details not found.");
        setLoading(false);
      });
  }, [payrollId, employeeUserId]);

  const taxAmount = useMemo(() => payroll?.totals?.tax_amount ?? 0, [payroll]);

  if (loading) {
    return (
      <Card className="mt-4 border-border/60 shadow-sm">
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Loading payroll details...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !payroll) {
    return (
      <Card className="mt-4 border-border/60 shadow-sm">
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">{error || "Payroll details not found."}</p>
          <Button variant="outline" onClick={() => router.push("/employee/payroll")}>Back to Payroll</Button>
        </CardContent>
      </Card>
    );
  }

  const emp = payroll.employee || {};
  const period = payroll.period || {};
  const attendance = payroll.attendance || {};
  const totals = payroll.totals || {};

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-start gap-4">
         <Button variant="outline" className="gap-2" onClick={() => router.push("/employee/payroll")}> 
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>

          <h2 className="text-2xl font-semibold tracking-tight">Payroll Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {MONTH_NAMES[(period.month || 1) - 1]} {period.year}
          </p>
        </div>

      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Employee</p>
            <p className="text-sm font-medium mt-1">{`${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1"><StatusBadge status={payroll.status} /></div>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Period</p>
            <p className="text-sm font-medium mt-1">{period.start_date || "—"} to {period.end_date || "—"}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Working Days</p>
            <p className="text-sm font-medium mt-1">{fmtNum(period.working_days)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Present Days" value={fmtNum(attendance.present_days)} />
            <Row label="Paid Leaves" value={fmtNum(attendance.paid_leaves)} />
            <Row label="Unpaid Leaves" value={fmtNum(attendance.unpaid_leaves)} />
            <Row label="Payable Days" value={fmtNum(attendance.payable_days)} />
            <Row label="Late Arrivals" value={fmtNum(attendance.late_arrivals)} />
            <Row label="Proration" value={attendance.proration_factor_percent != null ? `${attendance.proration_factor_percent}%` : "—"} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salary Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Basic Salary" value={fmtPKR(totals.basic_salary)} />
            <Row label="Allowances" value={fmtPKR(totals.allowances_total)} />
            <Row label="Bonuses" value={fmtPKR(totals.bonuses_total)} />
            <Row label="Gross Salary" value={fmtPKR(totals.gross_salary)} />
            <Row label="Tax" value={fmtPKR(taxAmount)} />
            <Row label="Total Deductions" value={fmtPKR(totals.deductions_total)} />
            <div className="pt-2 mt-2 border-t">
              <Row label="Net Salary" value={fmtPKR(totals.net_salary)} bold />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating sticky back button */}
      <Button
        variant="outline"
        className="fixed bottom-6 left-6 z-50 gap-2 shadow-md bg-background/90 hover:bg-background"
        onClick={() => router.push("/employee/payroll")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Payroll
      </Button>
    </div>
  );
}

function Row({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
