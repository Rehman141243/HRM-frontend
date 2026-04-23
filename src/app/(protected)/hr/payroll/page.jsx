'use client'
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  CreditCard, TrendingUp, Users, CheckCircle, Clock, DollarSign,
  RefreshCw, FileText, Plus, Search, ChevronLeft, ChevronRight,
  Banknote, Building2, UserCheck, AlertCircle, Download, Calendar,
  BarChart3, Percent, Hash, AlertTriangle, Info, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

/**
 * Role/Permission Matrix:
 *
 * The user object from /auth/signin may have these shapes:
 *   { role: "admin", ... }                          ← pure admin
 *   { role: "user", designation: "hr", ... }        ← HR manager
 *   { role: "user", designation: "manager", ... }   ← Manager
 *   { role: "user", designation: "employee", ... }  ← Employee
 *
 * Permissions:
 *   admin / hr   → full access (generate, approve, mark-paid, regenerate, create structures, view all)
 *   manager      → view all payrolls (search by employee), view own payroll, view own structure — NO write
 *   employee     → view own payroll + own salary structure ONLY
 */
const getPermissions = (user) => {
  // role can be "admin" or "user"
  const role = (user.role || "").toLowerCase();
  // designation is set for role="user" accounts: "hr", "manager", "employee"
  const designation = (user.designation || "").toLowerCase();

  const isAdmin = role === "admin";
  const isHr = !isAdmin && designation === "hr";
  const isManager = !isAdmin && designation === "manager";
  const isEmployee = !isAdmin && !isHr && !isManager; // fallback = employee
  const isAdminOrHr = isAdmin || isHr;

  // Derive a stable employee_id for "my" queries
  // Auth service may expose it as employee_id, employeeId, or id
  const selfEmployeeId = user.employee_id || user.employeeId || user.id || null;

  return {
    isAdmin, isHr, isManager, isEmployee, isAdminOrHr,
    selfEmployeeId,
    canViewAllPayrolls: isAdminOrHr || isManager,
    canGeneratePayroll: isAdminOrHr,
    canApprovePayroll: isAdminOrHr,
    canMarkPaid: isAdminOrHr,
    canRegeneratePayroll: isAdminOrHr,
    canViewAllStructures: isAdminOrHr,
    canCreateStructure: isAdminOrHr,
    canViewOwnPayroll: true,
    canViewOwnStructure: true,
    roleLabel: isAdmin ? "Administrator" : isHr ? "HR Manager" : isManager ? "Manager" : "Employee",
  };
};

// ─── Format Helpers ───────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtPKR = (n) => `PKR ${fmt(n)}`;
const fmtNum = (n, fallback = "—") => (n === null || n === undefined) ? fallback : String(n);

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Data Normalization ───────────────────────────────────────────────────────
/**
 * Normalize a payroll DB row into a consistent shape for the UI.
 * The DB stores computed data in flat columns + snapshot columns.
 * We map everything to a stable UI contract.
 */
const normalizePayroll = (row) => {
  if (!row) return null;
  const summary = row.summary_snapshot || {};
  const earnings = row.earnings_breakdown || {};
  const deductions = row.deductions_breakdown || {};

  // Tax amount from deductions breakdown
  const taxAmount = deductions?.tax?.amount ?? 0;
  const nonTaxItems = (deductions?.items || []).filter(d => d && d.name && !String(d.name).toLowerCase().includes("tax"));
  const nonTaxTotal = nonTaxItems.reduce((s, d) => s + Number(d.amount || 0), 0);

  return {
    id: row.id,
    status: row.status,
    employee: row.employee || {},
    period: {
      month: row.month,
      year: row.year,
      start_date: row.period_snapshot?.start_date || null,
      end_date: row.period_snapshot?.end_date || null,
      working_days: row.total_days ?? summary.total_days ?? null,
    },
    attendance: {
      present_days: row.present_days ?? summary.present_days ?? null,
      paid_leaves: row.paid_leaves ?? summary.paid_leaves ?? null,
      unpaid_leaves: row.unpaid_leaves ?? summary.unpaid_leaves ?? null,
      payable_days: row.payable_days ?? summary.payable_days ?? null,
      overtime_hours: row.overtime_hours ?? summary.overtime_hours ?? null,
      late_arrivals: summary.late_arrivals ?? null,
      late_penalty_days: summary.late_penalty_days ?? null,
      proration_factor_percent: summary.proration_factor_percent ?? null,
    },
    totals: {
      basic_salary: row.basic_salary ?? 0,
      allowances_total: row.allowances_total ?? 0,
      bonuses_total: row.bonuses_total ?? 0,
      overtime_amount: row.overtime_amount ?? 0,
      gross_salary: row.gross_salary ?? 0,
      deductions_total: row.deductions_total ?? 0,
      net_salary: row.net_salary ?? 0,
      tax_amount: taxAmount,
      non_tax_deductions_total: nonTaxTotal,
      per_day_salary: null, // not stored in flat row
    },
    components: {
      allowances: earnings.allowances || [],
      bonuses: earnings.bonuses || [],
      deductions: nonTaxItems,
      overtime: earnings.overtime || null,
    },
    earningsBreakdown: earnings,
    deductionsBreakdown: deductions,
    summarySnapshot: summary,
    // Raw row preserved for any edge case
    _raw: row,
  };
};

const normalizeSalaryStructure = (s) => {
  if (!s) return null;
  return {
    ...s,
    allowance_total: s.allowance_total ??
      (s.allowances || []).reduce((sum, a) => sum + Number(a.amount ?? a.value ?? 0), 0),
    deduction_total: s.deduction_total ??
      (s.deductions || []).reduce((sum, d) => sum + Number(d.amount ?? d.value ?? 0), 0),
  };
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    draft: { cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", icon: <Clock className="w-3 h-3" /> },
    processed: { cls: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800", icon: <CheckCircle className="w-3 h-3" /> },
    paid: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", icon: <Banknote className="w-3 h-3" /> },
  };
  const { cls, icon } = cfg[status] || cfg.draft;
  return (
    <Badge variant="outline" className={cn("gap-1 font-semibold text-xs px-2 py-0.5 tracking-wide", cls)}>
      {icon}
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </Badge>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, variant = "default" }) {
  const variantCls = {
    default: "bg-card border",
    amber: "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30",
    sky: "bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/30",
    emerald: "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30",
  };
  const iconCls = {
    default: "text-primary bg-primary/10",
    amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    sky: "text-sky-600 bg-sky-100 dark:bg-sky-900/30",
    emerald: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  };
  return (
    <Card className={cn("shadow-none", variantCls[variant])}>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 truncate">{label}</p>
            <p className="text-xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground mt-1 truncate">{sub}</p>}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg shrink-0", iconCls[variant])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value, mono = false, highlight, indent = false }) {
  return (
    <div className={cn("flex justify-between items-center py-1.5 border-b border-border/40 last:border-0", indent && "pl-4")}>
      <span className={cn("text-sm text-muted-foreground", indent && "text-xs")}>{label}</span>
      <span className={cn(
        "text-sm font-semibold",
        mono && "font-mono tabular-nums",
        highlight === "green" && "text-emerald-600 dark:text-emerald-400",
        highlight === "red" && "text-red-600 dark:text-red-400",
        highlight === "primary" && "text-primary",
        highlight === "muted" && "text-muted-foreground font-normal",
        indent && "text-xs text-muted-foreground font-normal",
      )}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{children}</p>
    </div>
  );
}

// ─── Payroll Detail Modal ─────────────────────────────────────────────────────
function PayrollDetailModal({ payroll, open, onClose, perms, onApprove, onMarkPaid, onRegenerate, onPayslip, actionLoading }) {
  if (!payroll) return null;
  const { employee: emp, period, attendance, totals, components } = payroll;
  const lateRule = payroll.summarySnapshot?.late_penalty_rule || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              {emp.first_name} {emp.last_name} — {MONTH_SHORT[(period.month || 1) - 1]} {period.year}
            </span>
            <StatusBadge status={payroll.status} />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto max-h-[calc(92vh-130px)]">
          <div className="px-6 py-5 space-y-6">

            {/* Employee + Period */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <SectionTitle icon={UserCheck}>Employee</SectionTitle>
                <div className="bg-muted/30 rounded-lg px-3 py-1">
                  <FieldRow label="Name" value={`${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"} />
                  <FieldRow label="Designation" value={emp.designation || "—"} highlight="muted" />
                  <FieldRow label="Department" value={emp.department || "—"} highlight="muted" />
                </div>
              </div>
              <div>
                <SectionTitle icon={Calendar}>Pay Period</SectionTitle>
                <div className="bg-muted/30 rounded-lg px-3 py-1">
                  <FieldRow label="Period" value={`${period.start_date || "—"} → ${period.end_date || "—"}`} highlight="muted" />
                  <FieldRow label="Working Days" value={fmtNum(period.working_days)} />
                  <FieldRow label="Payable Days" value={fmtNum(attendance.payable_days)} highlight="primary" />
                  <FieldRow label="Proration" value={attendance.proration_factor_percent != null ? `${attendance.proration_factor_percent}%` : "—"} highlight="muted" />
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div>
              <SectionTitle icon={BarChart3}>Attendance Summary</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Present", value: fmtNum(attendance.present_days), variant: "emerald" },
                  { label: "Paid Leave", value: fmtNum(attendance.paid_leaves), variant: "sky" },
                  { label: "Unpaid Leave", value: fmtNum(attendance.unpaid_leaves), variant: "amber" },
                  { label: "Overtime hrs", value: fmtNum(attendance.overtime_hours), variant: "default" },
                  { label: "Late Arrivals", value: fmtNum(attendance.late_arrivals), variant: attendance.late_arrivals > 0 ? "amber" : "default" },
                  { label: "Late Penalty Days", value: fmtNum(attendance.late_penalty_days), variant: attendance.late_penalty_days > 0 ? "amber" : "default" },
                ].map(({ label, value, variant }) => (
                  <div key={label} className={cn(
                    "rounded-lg p-2.5 text-center border",
                    variant === "emerald" && "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30",
                    variant === "sky" && "bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/30",
                    variant === "amber" && "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30",
                    variant === "default" && "bg-muted/40 border-border/40",
                  )}>
                    <p className="text-lg font-bold tabular-nums">{value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {lateRule.late_count_for_unpaid_day && (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Late penalty rule: every {lateRule.late_count_for_unpaid_day} late arrivals = 1 unpaid day
                  {lateRule.applied_unpaid_days_from_late > 0 && ` · ${lateRule.applied_unpaid_days_from_late} applied`}
                </p>
              )}
            </div>

            <Separator />

            {/* Earnings */}
            <div>
              <SectionTitle icon={TrendingUp}>Earnings</SectionTitle>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20 rounded-lg px-4 py-1">
                <FieldRow label="Basic Salary" value={fmtPKR(totals.basic_salary)} mono />
                <FieldRow
                  label={`Allowances (${(components.allowances || []).length})`}
                  value={fmtPKR(totals.allowances_total)}
                  mono
                  highlight="green"
                />
                {(components.allowances || []).map((a, i) => (
                  <FieldRow key={i} label={`↳ ${a.name}`} value={fmtPKR(a.amount)} mono indent />
                ))}
                <FieldRow
                  label={`Bonuses (${(components.bonuses || []).length})`}
                  value={fmtPKR(totals.bonuses_total)}
                  mono
                  highlight="green"
                />
                {(components.bonuses || []).map((b, i) => (
                  <FieldRow key={i} label={`↳ ${b.name}${!b.eligible ? " (ineligible)" : ""}`} value={fmtPKR(b.amount)} mono indent />
                ))}
                {components.overtime && (
                  <>
                    <FieldRow label="Overtime Pay" value={fmtPKR(totals.overtime_amount)} mono />
                    {totals.overtime_amount > 0 && components.overtime && (
                      <FieldRow
                        label={`↳ ${components.overtime.hours}h × PKR ${fmt(components.overtime.hourly_rate)} × ${components.overtime.rate_multiplier}x`}
                        value=""
                        indent
                      />
                    )}
                  </>
                )}
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold">Gross Salary</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtPKR(totals.gross_salary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <SectionTitle icon={Percent}>Deductions</SectionTitle>
              <div className="bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 rounded-lg px-4 py-1">
                <FieldRow label="Tax" value={fmtPKR(totals.tax_amount)} mono highlight="red" />
                {payroll.deductionsBreakdown?.tax && (
                  <FieldRow
                    label={`↳ Mode: ${payroll.deductionsBreakdown.tax.mode || "—"}`}
                    value={payroll.deductionsBreakdown.tax.applicable_rate != null ? `${payroll.deductionsBreakdown.tax.applicable_rate}% rate` : ""}
                    indent
                  />
                )}
                {(components.deductions || []).map((d, i) => (
                  <FieldRow key={i} label={d.name} value={fmtPKR(d.amount)} mono />
                ))}
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold">Total Deductions</span>
                  <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400 tabular-nums">-{fmtPKR(totals.deductions_total)}</span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-primary rounded-xl px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-1">Net Salary</p>
                <p className="text-primary-foreground text-3xl font-bold tabular-nums">{fmtPKR(totals.net_salary)}</p>
                <p className="text-primary-foreground/50 text-xs mt-1">{MONTH_NAMES[(period.month || 1) - 1]} {period.year}</p>
              </div>
              <Banknote className="w-12 h-12 text-primary-foreground/20" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {perms.canApprovePayroll && payroll.status === "draft" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => onApprove(payroll.id)} disabled={actionLoading}>
                  <CheckCircle className="w-3.5 h-3.5" />Approve
                </Button>
              )}
              {perms.canMarkPaid && payroll.status === "processed" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => onMarkPaid(payroll.id)} disabled={actionLoading}>
                  <Banknote className="w-3.5 h-3.5" />Mark as Paid
                </Button>
              )}
              {perms.canRegeneratePayroll && payroll.status === "draft" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={actionLoading}>
                      <RefreshCw className="w-3.5 h-3.5" />Regenerate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Regenerate Payroll?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the current draft and recalculate from scratch using fresh attendance, leave, and overtime data. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onRegenerate(payroll.id)}>
                        Yes, Regenerate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onPayslip(payroll.id)} disabled={actionLoading}>
                <Download className="w-3.5 h-3.5" />Download Payslip
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Generate Payroll Modal ───────────────────────────────────────────────────
function GenerateModal({ open, onClose, onGenerate, loading }) {
  const now = new Date();
  const [form, setForm] = useState({
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    employee_id: "",
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setInput = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />Generate Payroll
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Month</Label>
              <Select value={form.month} onValueChange={set("month")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Year</Label>
              <Input className="h-9" type="number" min="2000" max="2100" value={form.year} onChange={setInput("year")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Employee ID
              <span className="text-muted-foreground font-normal ml-1">(leave blank for all)</span>
            </Label>
            <Input className="h-9" placeholder="UUID — leave empty for bulk run" value={form.employee_id} onChange={setInput("employee_id")} />
          </div>
          {!form.employee_id && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2.5 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Bulk run will generate payroll for all employees with active salary structures.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={loading} onClick={() => onGenerate(form)}>
              {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating…</> : <><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Generate</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Salary Structure Detail Modal ───────────────────────────────────────────
function SalaryStructureModal({ structure, open, onClose }) {
  if (!structure) return null;
  const emp = structure.employee || {};
  const s = normalizeSalaryStructure(structure);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="w-4 h-4 text-primary" />
            Salary Structure
            <Badge variant="outline" className={cn("text-xs ml-1",
              s.is_active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}>
              {s.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-68px)]">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <SectionTitle icon={UserCheck}>Employee</SectionTitle>
                <div className="bg-muted/30 rounded-lg px-3 py-1">
                  <FieldRow label="Name" value={`${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"} />
                  <FieldRow label="Designation" value={emp.designation || "—"} highlight="muted" />
                  <FieldRow label="Department" value={emp.department || "—"} highlight="muted" />
                  <FieldRow label="Currency" value={s.currency || "PKR"} highlight="muted" />
                  <FieldRow label="Effective From" value={s.effective_from || "—"} highlight="muted" />
                </div>
              </div>
              <div>
                <SectionTitle icon={DollarSign}>Salary Totals</SectionTitle>
                <div className="bg-muted/30 rounded-lg px-3 py-1">
                  <FieldRow label="Basic Salary" value={fmtPKR(s.basic_salary)} mono highlight="primary" />
                  <FieldRow label="Total Allowances" value={fmtPKR(s.allowance_total)} mono highlight="green" />
                  <FieldRow label="Total Deductions" value={fmtPKR(s.deduction_total)} mono highlight="red" />
                </div>
              </div>
            </div>

            {(s.allowances || []).length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionTitle icon={TrendingUp}>Allowances</SectionTitle>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20 rounded-lg px-4 py-1">
                    {s.allowances.map((a, i) => (
                      <FieldRow key={i} label={a.name}
                        value={a.type === "percentage"
                          ? `${a.value}% of ${(a.basis || "basic_salary").replace("_", " ")}`
                          : fmtPKR(a.value)}
                        mono />
                    ))}
                  </div>
                </div>
              </>
            )}

            {(s.deductions || []).length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionTitle icon={Percent}>Deductions</SectionTitle>
                  <div className="bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 rounded-lg px-4 py-1">
                    {s.deductions.map((d, i) => (
                      <FieldRow key={i} label={d.name}
                        value={d.type === "percentage"
                          ? `${d.value}% of ${(d.basis || "gross_salary").replace("_", " ")}`
                          : fmtPKR(d.value)}
                        mono />
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div>
              <SectionTitle>Linked Policies</SectionTitle>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Attendance", val: s.attendance_policy?.name || (s.attendance_policy_id ? "Linked" : null) },
                  { label: "Overtime", val: s.overtime_policy?.name || (s.overtime_policy_id ? "Linked" : null) },
                  { label: "Tax", val: s.tax_policy?.name || (s.tax_policy_id ? "Linked" : null) },
                  { label: "Bonus", val: s.bonus_policy?.name || (s.bonus_policy_id ? "Linked" : null) },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-muted/40 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">{label}</p>
                    <p className={cn("text-sm font-semibold", val ? "text-foreground" : "text-muted-foreground/40")}>
                      {val || "Not linked"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Structure Modal ───────────────────────────────────────────────────
function CreateStructureModal({ open, onClose, onCreate, loading }) {
  const [form, setForm] = useState({
    employee_id: "", basic_salary: "", currency: "PKR", name: "",
    attendance_policy_id: "", overtime_policy_id: "",
    tax_policy_id: "", bonus_policy_id: "",
    effective_from: new Date().toISOString().split("T")[0],
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.employee_id.trim()) return toast.error("Employee ID is required");
    if (!form.basic_salary || isNaN(parseFloat(form.basic_salary))) return toast.error("Valid basic salary is required");
    if (!form.attendance_policy_id.trim()) return toast.error("Attendance policy ID is required");
    if (!form.overtime_policy_id.trim()) return toast.error("Overtime policy ID is required");
    if (!form.tax_policy_id.trim()) return toast.error("Tax policy ID is required");

    const payload = {
      ...form,
      basic_salary: parseFloat(form.basic_salary),
      allowances: [],
      deductions: [],
    };
    if (!payload.bonus_policy_id) delete payload.bonus_policy_id;
    if (!payload.name) delete payload.name;
    onCreate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Plus className="w-4 h-4 text-primary" />New Salary Structure
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-68px)]">
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Employee ID <span className="text-destructive">*</span></Label>
              <Input className="h-9" placeholder="Employee UUID" value={form.employee_id} onChange={set("employee_id")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Structure Name</Label>
              <Input className="h-9" placeholder="e.g., Senior Engineer Package" value={form.name} onChange={set("name")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Basic Salary <span className="text-destructive">*</span></Label>
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={form.basic_salary} onChange={set("basic_salary")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Currency</Label>
                <Input className="h-9" value={form.currency} onChange={set("currency")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Effective From</Label>
              <Input className="h-9" type="date" value={form.effective_from} onChange={set("effective_from")} />
            </div>
            <Separator />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Policy IDs</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "attendance_policy_id", label: "Attendance Policy", required: true },
                { key: "overtime_policy_id", label: "Overtime Policy", required: true },
                { key: "tax_policy_id", label: "Tax Policy", required: true },
                { key: "bonus_policy_id", label: "Bonus Policy", required: false },
              ].map(({ key, label, required }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {label} {required ? <span className="text-destructive">*</span> : <span className="text-muted-foreground font-normal">(optional)</span>}
                  </Label>
                  <Input className="h-9" placeholder="UUID" value={form[key]} onChange={set(key)} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 pb-1">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" disabled={loading} onClick={handleSubmit}>
                {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Creating…</> : "Create Structure"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon = AlertCircle, message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}

// ─── Payroll Table ────────────────────────────────────────────────────────────
function PayrollTable({ data, loading, emptyMsg, onSelect, pagination, page, onPageChange }) {
  return (
    <Card className="border shadow-none overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
              {["Employee", "Period", "Working", "Payable", "Gross", "Deductions", "Net Salary", "Status", ""].map(h => (
                <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap py-3">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0 border-0">
                  <EmptyState icon={RefreshCw} message="Loading payrolls…" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0 border-0">
                  <EmptyState message={emptyMsg || "No payrolls found."} />
                </TableCell>
              </TableRow>
            ) : data.map((p, i) => {
              const n = normalizePayroll(p);
              const { employee: emp, period, attendance, totals } = n;
              return (
                <TableRow key={p.id || i} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => onSelect(n)}>
                  <TableCell className="py-3">
                    <div className="font-semibold text-sm leading-tight">{emp.first_name} {emp.last_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {MONTH_SHORT[(period.month || 1) - 1]} {period.year}
                  </TableCell>
                  <TableCell className="text-sm text-center tabular-nums text-muted-foreground">{fmtNum(period.working_days)}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums font-bold text-primary">{fmtNum(attendance.payable_days)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums text-muted-foreground">{fmtPKR(totals.gross_salary)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">-{fmtPKR(totals.deductions_total)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums font-bold">{fmtPKR(totals.net_salary)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onSelect(n)}>View</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <span className="text-xs text-muted-foreground">{pagination.total} record{pagination.total !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">Page {page} of {pagination.pages}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page >= pagination.pages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ showEmployeeSearch, perms, onSearch, employeeSearch, setEmployeeSearch,
  filterStatus, setFilterStatus, filterMonth, setFilterMonth, filterYear, setFilterYear, onApply }) {
  return (
    <div className="flex flex-wrap gap-2.5 items-end">
      {showEmployeeSearch && perms.canViewAllPayrolls && (
        <div className="flex-1 min-w-[200px] max-w-xs space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee ID</Label>
          <div className="flex gap-1.5">
            <Input className="h-8 text-sm"
              placeholder="Search by UUID…"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={onSearch}>
              <Search className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Month</Label>
        <Select value={filterMonth || "all"} onValueChange={(v) => setFilterMonth(v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Year</Label>
        <Input className="h-8 w-20 text-sm" type="number" min="2000" max="2100" value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)} />
      </div>
      <Button size="sm" className="h-8" onClick={onApply}>Apply</Button>
    </div>
  );
}


// ─── Debug Banner (shows current user/perms — remove in production) ──────────
function DebugBanner({ user, perms }) {
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shadow-md"
          onClick={() => setShow(true)}>
          <Info className="w-3 h-3" />Debug
        </Button>
      </div>
    );
  }
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-lg shadow-xl p-4 text-xs max-w-sm w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Auth Debug</span>
        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setShow(false)}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-1 font-mono">
        <div><span className="text-muted-foreground">role:</span> <span className="text-primary font-bold">{user.role || "(none)"}</span></div>
        <div><span className="text-muted-foreground">designation:</span> <span className="text-primary font-bold">{user.designation || "(none)"}</span></div>
        <div><span className="text-muted-foreground">employee_id:</span> <span className="text-primary font-bold">{user.employee_id || user.employeeId || user.id || "(none)"}</span></div>
        <div><span className="text-muted-foreground">selfEmployeeId:</span> <span className="text-primary font-bold">{perms.selfEmployeeId || "(none)"}</span></div>
        <Separator className="my-2" />
        <div><span className="text-muted-foreground">isAdmin:</span> {String(perms.isAdmin)}</div>
        <div><span className="text-muted-foreground">isHr:</span> {String(perms.isHr)}</div>
        <div><span className="text-muted-foreground">isManager:</span> {String(perms.isManager)}</div>
        <div><span className="text-muted-foreground">isEmployee:</span> {String(perms.isEmployee)}</div>
        <Separator className="my-2" />
        <div><span className="text-muted-foreground">canGenerate:</span> {String(perms.canGeneratePayroll)}</div>
        <div><span className="text-muted-foreground">canViewAll:</span> {String(perms.canViewAllPayrolls)}</div>
        <div><span className="text-muted-foreground">canCreateStruct:</span> {String(perms.canCreateStructure)}</div>
      </div>
      <div className="mt-2 pt-2 border-t">
        <p className="text-[10px] text-muted-foreground">Full user object in console</p>
        <Button size="sm" variant="outline" className="h-6 text-[10px] mt-1" onClick={() => console.log("USER:", user, "PERMS:", perms)}>
          Log to Console
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PayrollService() {
  const user = getUser();
  const perms = getPermissions(user);

  // Default tab: employees go to "mine", others to "payrolls"
  const defaultTab = perms.isEmployee ? "mine" : "payrolls";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Data state per tab
  const [allPayrolls, setAllPayrolls] = useState([]);
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [structures, setStructures] = useState([]);

  // Pagination per tab (shared state, reset on tab change)
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState(""); // committed search

  // Modals
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCreateStructure, setShowCreateStructure] = useState(false);

  // ── API Calls ──────────────────────────────────────────────────────────────

  const buildParams = useCallback(() => {
    const params = { page, limit: 10 };
    if (filterStatus) params.status = filterStatus;
    if (filterMonth) params.month = filterMonth;
    if (filterYear) params.year = filterYear;
    return params;
  }, [page, filterStatus, filterMonth, filterYear]);

  // My payroll — calls /payroll/me
  const fetchMyPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/payroll/me", { params: buildParams() });
      const d = res.data;
      if (d.payroll) {
        setMyPayrolls([d.payroll]);
        setPagination({ total: 1, pages: 1 });
      } else {
        setMyPayrolls(d.payrolls || []);
        setPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to fetch your payrolls");
    } finally { setLoading(false); }
  }, [buildParams]);

  // All payrolls by employee ID — calls /payroll/:employeeId
  const fetchPayrollsByEmployee = useCallback(async (empId) => {
    const id = empId || employeeFilter;
    if (!id) { setAllPayrolls([]); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/payroll/${id}`, { params: buildParams() });
      const d = res.data;
      if (d.payroll) {
        setAllPayrolls([d.payroll]);
        setPagination({ total: 1, pages: 1 });
      } else {
        setAllPayrolls(d.payrolls || []);
        setPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to fetch payrolls");
    } finally { setLoading(false); }
  }, [employeeFilter, buildParams]);

  // Salary structures (admin/hr: all, others: own)
  const fetchStructures = useCallback(async () => {
    setLoading(true);
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get("/salary-structures", { params: { page, limit: 10 } });
        setStructures(res.data.salary_structures || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      } else {
        // manager / employee: fetch own structure
        const empId = perms.selfEmployeeId;
        if (!empId) {
          toast.error("Could not determine your employee ID. Please contact HR.");
          setStructures([]);
          return;
        }
        const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
        // API returns { salary_structure: {...} } or the object directly
        const s = res.data?.salary_structure || res.data;
        setStructures(s && s.id ? [s] : []);
        setPagination({ total: 1, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        toast.error(e.response?.data?.message || "Failed to fetch salary structures");
      } else {
        setStructures([]);
      }
    } finally { setLoading(false); }
  }, [page, perms.canViewAllStructures, perms.selfEmployeeId]);

  // Trigger fetches on tab / filter changes
  useEffect(() => {
    if (activeTab === "mine") fetchMyPayrolls();
    else if (activeTab === "payrolls" && employeeFilter) fetchPayrollsByEmployee(employeeFilter);
    else if (activeTab === "payrolls" && !employeeFilter) { setAllPayrolls([]); setLoading(false); }
    else if (activeTab === "structures") fetchStructures();
  }, [activeTab, page, filterStatus, filterMonth, filterYear]);

  const handleSearch = () => {
    const id = employeeSearch.trim();
    if (!id) return toast.error("Enter an Employee ID to search");
    setEmployeeFilter(id);
    setPage(1);
    fetchPayrollsByEmployee(id);
  };

  const handleApplyFilter = () => {
    setPage(1);
    if (activeTab === "mine") fetchMyPayrolls();
    else if (activeTab === "payrolls" && employeeFilter) fetchPayrollsByEmployee(employeeFilter);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setPagination({ total: 0, pages: 1 });
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleGenerate = async (form) => {
    setActionLoading(true);
    try {
      const payload = { month: Number(form.month), year: Number(form.year) };
      if (form.employee_id.trim()) payload.employee_id = form.employee_id.trim();
      await axiosInstance.post("/payroll/generate", payload);
      toast.success("Payroll generated successfully!");
      setShowGenerate(false);
      // Refresh current view
      if (activeTab === "payrolls" && employeeFilter) fetchPayrollsByEmployee(employeeFilter);
      else if (activeTab === "mine") fetchMyPayrolls();
    } catch (e) {
      toast.error(e.response?.data?.message || "Payroll generation failed");
    } finally { setActionLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/approve`);
      toast.success("Payroll approved and moved to Processed.");
      setSelectedPayroll(null);
      if (activeTab === "mine") fetchMyPayrolls();
      else if (employeeFilter) fetchPayrollsByEmployee(employeeFilter);
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    } finally { setActionLoading(false); }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/mark-paid`);
      toast.success("Payroll marked as Paid.");
      setSelectedPayroll(null);
      if (activeTab === "mine") fetchMyPayrolls();
      else if (employeeFilter) fetchPayrollsByEmployee(employeeFilter);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to mark as paid");
    } finally { setActionLoading(false); }
  };

  const handleRegenerate = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/regenerate`);
      toast.success("Payroll regenerated from scratch.");
      setSelectedPayroll(null);
      if (employeeFilter) fetchPayrollsByEmployee(employeeFilter);
      else if (activeTab === "mine") fetchMyPayrolls();
    } catch (e) {
      toast.error(e.response?.data?.message || "Regeneration failed");
    } finally { setActionLoading(false); }
  };

  const handlePayslip = async (id) => {
    try {
      const res = await axiosInstance.get(`/payslip/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Payslip downloaded.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to download payslip");
    }
  };

  const handleCreateStructure = async (payload) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/salary-structures", payload);
      toast.success("Salary structure created!");
      setShowCreateStructure(false);
      fetchStructures();
    } catch (e) {
      toast.error(e.response?.data?.message || "Creation failed");
    } finally { setActionLoading(false); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const currentList = activeTab === "mine" ? myPayrolls : allPayrolls;
  const stats = {
    total: currentList.length,
    draft: currentList.filter(p => p.status === "draft").length,
    processed: currentList.filter(p => p.status === "processed").length,
    paid: currentList.filter(p => p.status === "paid").length,
    totalNet: currentList.reduce((s, p) => s + Number(p.net_salary || 0), 0),
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Payroll</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{perms.roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {perms.canGeneratePayroll && (
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowGenerate(true)}>
                <TrendingUp className="w-3.5 h-3.5" />Generate Payroll
              </Button>
            )}
            {perms.canCreateStructure && activeTab === "structures" && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowCreateStructure(true)}>
                <Plus className="w-3.5 h-3.5" />New Structure
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-5 h-9">
            {perms.canViewAllPayrolls && (
              <TabsTrigger value="payrolls" className="text-xs gap-1.5 h-full">
                <Users className="w-3.5 h-3.5" />All Payrolls
              </TabsTrigger>
            )}
            <TabsTrigger value="mine" className="text-xs gap-1.5 h-full">
              <UserCheck className="w-3.5 h-3.5" />My Payroll
            </TabsTrigger>
            <TabsTrigger value="structures" className="text-xs gap-1.5 h-full">
              <Building2 className="w-3.5 h-3.5" />
              {perms.canViewAllStructures ? "Salary Structures" : "My Structure"}
            </TabsTrigger>
          </TabsList>

          {/* ── All Payrolls (admin/hr/manager) ── */}
          {perms.canViewAllPayrolls && (
            <TabsContent value="payrolls" className="mt-0 space-y-4">
              <FilterBar
                showEmployeeSearch
                perms={perms}
                onSearch={handleSearch}
                employeeSearch={employeeSearch}
                setEmployeeSearch={setEmployeeSearch}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                filterYear={filterYear} setFilterYear={setFilterYear}
                onApply={handleApplyFilter}
              />
              {allPayrolls.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  <StatCard label="Records" value={stats.total} icon={FileText} />
                  <StatCard label="Draft" value={stats.draft} icon={Clock} variant="amber" />
                  <StatCard label="Processed" value={stats.processed} icon={CheckCircle} variant="sky" />
                  <StatCard label="Paid" value={stats.paid} sub={fmtPKR(stats.totalNet)} icon={DollarSign} variant="emerald" />
                </div>
              )}
              <PayrollTable
                data={allPayrolls}
                loading={loading}
                emptyMsg={employeeFilter
                  ? `No payrolls found for employee ${employeeFilter}.`
                  : "Enter an Employee UUID above and click the search button to view payrolls."}
                onSelect={setSelectedPayroll}
                pagination={pagination}
                page={page}
                onPageChange={setPage}
              />
            </TabsContent>
          )}

          {/* ── My Payroll ── */}
          <TabsContent value="mine" className="mt-0 space-y-4">
            <FilterBar
              showEmployeeSearch={false}
              perms={perms}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterMonth={filterMonth} setFilterMonth={setFilterMonth}
              filterYear={filterYear} setFilterYear={setFilterYear}
              onApply={handleApplyFilter}
            />
            {myPayrolls.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Records" value={stats.total} icon={FileText} />
                <StatCard label="Draft" value={stats.draft} icon={Clock} variant="amber" />
                <StatCard label="Processed" value={stats.processed} icon={CheckCircle} variant="sky" />
                <StatCard label="Paid" value={stats.paid} sub={fmtPKR(stats.totalNet)} icon={DollarSign} variant="emerald" />
              </div>
            )}
            <PayrollTable
              data={myPayrolls}
              loading={loading}
              emptyMsg="No payroll records found for your account."
              onSelect={setSelectedPayroll}
              pagination={pagination}
              page={page}
              onPageChange={setPage}
            />
          </TabsContent>

          {/* ── Salary Structures ── */}
          <TabsContent value="structures" className="mt-0 space-y-4">
            {perms.canCreateStructure && (
              <div className="flex justify-end">
                <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowCreateStructure(true)}>
                  <Plus className="w-3.5 h-3.5" />New Salary Structure
                </Button>
              </div>
            )}
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                      {["Employee", "Structure", "Basic Salary", "Allowances", "Deductions", "Currency", "Status", ""].map(h => (
                        <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading…" /></TableCell></TableRow>
                    ) : structures.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={Building2} message="No salary structures found." /></TableCell></TableRow>
                    ) : structures.map((s, i) => {
                      const ns = normalizeSalaryStructure(s);
                      const emp = ns.employee || {};
                      return (
                        <TableRow key={ns.id || i} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setSelectedStructure(ns)}>
                          <TableCell className="py-3">
                            <div className="font-semibold text-sm leading-tight">{emp.first_name} {emp.last_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{ns.name || "—"}</TableCell>
                          <TableCell className="text-sm font-mono tabular-nums font-bold text-primary">{fmtPKR(ns.basic_salary)}</TableCell>
                          <TableCell className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{fmtPKR(ns.allowance_total)}</TableCell>
                          <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">{fmtPKR(ns.deduction_total)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{ns.currency || "PKR"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs font-semibold",
                              ns.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground border-border"
                            )}>
                              {ns.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedStructure(ns)}>View</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <span className="text-xs text-muted-foreground">{pagination.total} structure{pagination.total !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">Page {page} of {pagination.pages}</span>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Debug (remove in production) ── */}
      <DebugBanner user={user} perms={perms} />

      {/* ── Modals ── */}
      <PayrollDetailModal
        payroll={selectedPayroll}
        open={!!selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
        perms={perms}
        onApprove={handleApprove}
        onMarkPaid={handleMarkPaid}
        onRegenerate={handleRegenerate}
        onPayslip={handlePayslip}
        actionLoading={actionLoading}
      />
      <SalaryStructureModal
        structure={selectedStructure}
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
      />
      <GenerateModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
        loading={actionLoading}
      />
      <CreateStructureModal
        open={showCreateStructure}
        onClose={() => setShowCreateStructure(false)}
        onCreate={handleCreateStructure}
        loading={actionLoading}
      />
    </div>
  );
}