'use client'
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw, FileText, Plus, ChevronLeft, ChevronRight,
  Banknote, Building2, UserCheck, AlertCircle, Download, Calendar,
  BarChart3, Percent, AlertTriangle, Info, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";

// ─── Role/Permission Helpers ──────────────────────────────────────────────────
const getPermissions = (user) => {
  const role = (user?.role || "").toLowerCase();
  const designation = (user?.designation || "").toLowerCase();

  const isAdmin = role === "admin";
  const isHr = !isAdmin && designation === "hr";
  const isManager = !isAdmin && !isHr && designation === "manager";
  const isEmployee = !isAdmin && !isHr && !isManager;
  const isAdminOrHr = isAdmin || isHr;
  const selfEmployeeId = user?.employee_id || user?.employeeId || null;

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
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtPKR = (n) => `PKR ${fmt(n)}`;
const fmtNum = (n, fallback = "—") => (n === null || n === undefined) ? fallback : String(n);

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Data Normalization ───────────────────────────────────────────────────────
const normalizePayroll = (row) => {
  if (!row) return null;

  // Compact API response shape (nested period/attendance/totals/components)
  if (row.period && typeof row.period === "object" && row.attendance && row.totals && row.components) {
    const { period, attendance, totals, components, tax = {} } = row;
    const overtimeHint = totals.overtime_amount > 0
      ? { hours: attendance.overtime_hours, hourly_rate: null, rate_multiplier: null }
      : null;

    return {
      id: row.id,
      status: row.status,
      employee: row.employee || {},
      period: {
        month: period.month, year: period.year,
        start_date: period.start_date || null, end_date: period.end_date || null,
        working_days: period.working_days,
      },
      attendance: {
        present_days: attendance.present_days, paid_leaves: attendance.paid_leaves,
        unpaid_leaves: attendance.unpaid_leaves, payable_days: attendance.payable_days,
        overtime_hours: attendance.overtime_hours, late_arrivals: attendance.late_arrivals,
        late_penalty_days: attendance.late_penalty_days ?? null,
        proration_factor_percent: attendance.proration_factor_percent,
      },
      totals: {
        basic_salary: totals.basic_salary, allowances_total: totals.allowances_total,
        bonuses_total: totals.bonuses_total, overtime_amount: totals.overtime_amount,
        gross_salary: totals.gross_salary, deductions_total: totals.deductions_total,
        net_salary: totals.net_salary, tax_amount: totals.tax_amount ?? tax.amount ?? 0,
        non_tax_deductions_total: totals.non_tax_deductions_total ?? 0,
      },
      components: {
        allowances: components.allowances || [], bonuses: components.bonuses || [],
        deductions: components.deductions || [], overtime: overtimeHint,
      },
      tax,
      summarySnapshot: {},
      earningsBreakdown: { allowances: components.allowances || [], bonuses: components.bonuses || [] },
      deductionsBreakdown: {
        tax: { mode: tax.mode, applicable_rate: tax.rate, amount: tax.amount ?? 0 },
        items: components.deductions || [],
      },
      _raw: row,
    };
  }

  // Raw flat DB row fallback
  const summary = row.summary_snapshot || {};
  const earnings = row.earnings_breakdown || {};
  const deductions = row.deductions_breakdown || {};
  const taxAmount = deductions?.tax?.amount ?? 0;
  const nonTaxItems = (deductions?.items || []).filter(
    (d) => d && d.name && !String(d.name).toLowerCase().includes("tax")
  );
  return {
    id: row.id, status: row.status, employee: row.employee || {},
    period: {
      month: row.month, year: row.year,
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
      basic_salary: row.basic_salary ?? 0, allowances_total: row.allowances_total ?? 0,
      bonuses_total: row.bonuses_total ?? 0, overtime_amount: row.overtime_amount ?? 0,
      gross_salary: row.gross_salary ?? 0, deductions_total: row.deductions_total ?? 0,
      net_salary: row.net_salary ?? 0, tax_amount: taxAmount,
      non_tax_deductions_total: nonTaxItems.reduce((s, d) => s + Number(d.amount || 0), 0),
    },
    components: {
      allowances: earnings.allowances || [], bonuses: earnings.bonuses || [],
      deductions: nonTaxItems, overtime: earnings.overtime || null,
    },
    tax: deductions?.tax || {}, summarySnapshot: summary,
    earningsBreakdown: earnings, deductionsBreakdown: deductions, _raw: row,
  };
};

const normalizeSalaryStructure = (s) => {
  if (!s) return null;
  return {
    ...s,
    allowance_total: s.allowance_total ?? (s.allowances || []).reduce((sum, a) => sum + Number(a.amount ?? a.value ?? 0), 0),
    deduction_total: s.deduction_total ?? (s.deductions || []).reduce((sum, d) => sum + Number(d.amount ?? d.value ?? 0), 0),
  };
};

// ─── Payslip HTML Generator ───────────────────────────────────────────────────
const buildPayslipHtml = (payroll) => {
  const { employee: emp, period, attendance, totals, components, tax, deductionsBreakdown } = payroll;
  const fullMonth = MONTH_NAMES[(period.month || 1) - 1];
  const fmtA = (n) => `PKR ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const allowanceRows = (components.allowances || []).map((a) => `<tr><td class="sub">↳ ${a.name || "Allowance"}</td><td class="sub-amt">${fmtA(a.amount)}</td></tr>`).join("");
  const bonusRows = (components.bonuses || []).map((b) => `<tr><td class="sub">↳ ${b.name || "Bonus"}${b.eligible === false ? " <em>(ineligible)</em>" : ""}</td><td class="sub-amt">${fmtA(b.amount)}</td></tr>`).join("");
  const deductionRows = (components.deductions || []).filter((d) => d && d.name && !String(d.name).toLowerCase().includes("tax")).map((d) => `<tr><td>${d.name}</td><td class="amt">${fmtA(d.amount)}</td></tr>`).join("");
  const taxObj = tax && tax.mode ? tax : deductionsBreakdown?.tax || {};
  const taxNote = taxObj.mode ? `<div class="tax-note">Mode: ${taxObj.mode}${taxObj.applicable_rate != null ? ` · Rate: ${taxObj.applicable_rate}%` : ""}</div>` : "";
  const overtimeRow = totals.overtime_amount > 0 ? `<tr><td>Overtime Pay</td><td class="amt">${fmtA(totals.overtime_amount)}</td></tr>` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Payslip — ${emp.first_name || ""} ${emp.last_name || ""} — ${fullMonth} ${period.year || ""}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#f0f0f0}.page{max-width:820px;margin:30px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)}.hdr{background:#0f172a;color:#fff;padding:28px 36px;display:flex;justify-content:space-between;align-items:flex-start}.hdr h1{font-size:22px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}.hdr .sub{font-size:12px;opacity:.6}.hdr .badge{background:rgba(255,255,255,.15);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600}.hdr .right{text-align:right}.hdr .dates{font-size:11px;opacity:.5;margin-top:6px}.body{padding:28px 36px}.section{margin-bottom:24px}.stitle{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#666;border-bottom:1px solid #e8e8e8;padding-bottom:6px;margin-bottom:14px}.agrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.acard{background:#f8fafc;border:1px solid #e8ecf0;border-radius:8px;padding:12px;text-align:center}.acard .n{font-size:20px;font-weight:700;color:#0f172a}.acard .l{font-size:10px;color:#888;margin-top:3px;text-transform:uppercase;letter-spacing:.5px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}table{width:100%;border-collapse:collapse}table th{background:#f8fafc;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;padding:8px 10px;text-align:left}table td{padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:13px}table tr:last-child td{border-bottom:none}td.amt{text-align:right;font-family:monospace;font-weight:600}td.sub{color:#999;font-size:11px;padding-left:22px}td.sub-amt{text-align:right;font-family:monospace;font-size:11px;color:#999}.totrow td{font-weight:700;background:#f8fafc;font-size:14px}.tax-note{font-size:10px;color:#999;margin-top:8px;padding:4px 8px;background:#fafafa;border-radius:4px}.net{background:#0f172a;color:#fff;border-radius:10px;padding:22px 28px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.net .l{font-size:10px;opacity:.5;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}.net .a{font-size:30px;font-weight:700;font-family:monospace}.net .icon{font-size:48px;opacity:.2}.footer{text-align:center;color:#bbb;font-size:11px;padding:16px 36px 24px;border-top:1px solid #f0f0f0;margin-top:4px}@media print{body{background:#fff}.page{margin:0;border-radius:0;box-shadow:none}}</style></head>
<body><div class="page"><div class="hdr"><div><h1>${emp.first_name || ""} ${emp.last_name || ""}</h1><div class="sub">${emp.designation || ""}${emp.department ? " · " + emp.department : ""}</div></div><div class="right"><div class="badge">${fullMonth} ${period.year || ""}</div><div class="dates">${period.start_date || "—"} → ${period.end_date || "—"}</div></div></div>
<div class="body"><div class="section"><div class="stitle">Attendance Summary</div><div class="agrid"><div class="acard"><div class="n">${fmtNum(period.working_days)}</div><div class="l">Working Days</div></div><div class="acard"><div class="n">${fmtNum(attendance.payable_days)}</div><div class="l">Payable Days</div></div><div class="acard"><div class="n">${fmtNum(attendance.present_days)}</div><div class="l">Present</div></div><div class="acard"><div class="n">${fmtNum(attendance.paid_leaves)}</div><div class="l">Paid Leave</div></div><div class="acard"><div class="n">${fmtNum(attendance.unpaid_leaves)}</div><div class="l">Unpaid Leave</div></div><div class="acard"><div class="n">${fmtNum(attendance.late_arrivals)}</div><div class="l">Late Arrivals</div></div><div class="acard"><div class="n">${fmtNum(attendance.overtime_hours)}</div><div class="l">Overtime hrs</div></div><div class="acard"><div class="n">${attendance.proration_factor_percent != null ? attendance.proration_factor_percent + "%" : "—"}</div><div class="l">Proration</div></div></div></div>
<div class="grid2"><div class="section"><div class="stitle">Earnings</div><table><tr><th>Component</th><th style="text-align:right">Amount</th></tr><tr><td>Basic Salary</td><td class="amt">${fmtA(totals.basic_salary)}</td></tr><tr><td>Allowances</td><td class="amt">${fmtA(totals.allowances_total)}</td></tr>${allowanceRows}<tr><td>Bonuses</td><td class="amt">${fmtA(totals.bonuses_total)}</td></tr>${bonusRows}${overtimeRow}<tr class="totrow"><td>Gross Salary</td><td class="amt">${fmtA(totals.gross_salary)}</td></tr></table></div>
<div class="section"><div class="stitle">Deductions</div><table><tr><th>Component</th><th style="text-align:right">Amount</th></tr><tr><td>Tax</td><td class="amt">${fmtA(totals.tax_amount)}</td></tr>${deductionRows}<tr class="totrow"><td>Total Deductions</td><td class="amt">− ${fmtA(totals.deductions_total)}</td></tr></table>${taxNote}</div></div>
<div class="net"><div><div class="l">Net Salary — ${fullMonth} ${period.year || ""}</div><div class="a">${fmtA(totals.net_salary)}</div></div><div class="icon">💳</div></div></div>
<div class="footer">System-generated payslip · For queries contact HR · Generated ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</div></div>
<script>window.onload = () => window.print();</script></body></html>`;
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
      {icon}{status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
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
          {Icon && <div className={cn("p-2 rounded-lg shrink-0", iconCls[variant])}><Icon className="w-4 h-4" /></div>}
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
        "text-sm font-semibold", mono && "font-mono tabular-nums",
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

// ─── Employee Name Search (reusable) ─────────────────────────────────────────
// Hits GET /employee?search=&limit=8 and lets user pick by name
function EmployeeSearchInput({ label, value, onChange, onClear, placeholder = "Search employee by name…" }) {
  const [query, setQuery] = useState(value ? `${value.first_name || ""} ${value.last_name || ""}`.trim() : "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sync display when value cleared externally
  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await axiosInstance.get("/employee", { params: { search: query.trim(), limit: 8, page: 1 } });
        setResults(res.data.employees ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (emp) => {
    onChange(emp);
    setQuery(`${emp.first_name || ""} ${emp.last_name || ""}`.trim());
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
          <Input
            className="h-8 text-sm pl-8 pr-8"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) clear(); }}
            autoComplete="off"
          />
          {(query || value) && (
            <button onClick={clear} className="absolute right-2 text-muted-foreground hover:text-foreground z-10">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {open && (
          <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg overflow-hidden min-w-[240px]">
            {busy && <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>}
            {!busy && results.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No employees found.</div>}
            {!busy && results.map((emp) => (
              <button key={emp.id} onClick={() => pick(emp)}
                className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-0">
                <div className="text-sm font-medium">{emp.first_name} {emp.last_name}</div>
                <div className="text-xs text-muted-foreground">{emp.designation || "—"}{emp.department ? ` · ${emp.department}` : ""}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {value && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ {value.first_name} {value.last_name}{value.designation ? ` · ${value.designation}` : ""}
        </p>
      )}
    </div>
  );
}

// Larger variant for modals (h-9 input)
function EmployeeSearchInputLg({ label, value, onChange, onClear, placeholder = "Search employee by name…", required }) {
  const [query, setQuery] = useState(value ? `${value.first_name || ""} ${value.last_name || ""}`.trim() : "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!value) setQuery(""); }, [value]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await axiosInstance.get("/employee", { params: { search: query.trim(), limit: 8, page: 1 } });
        setResults(res.data.employees ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (emp) => {
    onChange(emp);
    setQuery(`${emp.first_name || ""} ${emp.last_name || ""}`.trim());
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
          <Input
            className="h-9 text-sm pl-8 pr-8"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) clear(); }}
            autoComplete="off"
          />
          {(query || value) && (
            <button onClick={clear} className="absolute right-2 text-muted-foreground hover:text-foreground z-10">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {open && (
          <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg overflow-hidden">
            {busy && <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>}
            {!busy && results.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No employees found.</div>}
            {!busy && results.map((emp) => (
              <button key={emp.id} onClick={() => pick(emp)}
                className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-0">
                <div className="text-sm font-medium">{emp.first_name} {emp.last_name}</div>
                <div className="text-xs text-muted-foreground">{emp.designation || "—"}{emp.department ? ` · ${emp.department}` : ""}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {value && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ {value.first_name} {value.last_name}{value.designation ? ` · ${value.designation}` : ""}
        </p>
      )}
    </div>
  );
}

// ─── Payroll Detail Modal ─────────────────────────────────────────────────────
function PayrollDetailModal({ payroll, open, onClose, perms, onApprove, onMarkPaid, onRegenerate, onPayslip, actionLoading }) {
  if (!payroll) return null;
  const { employee: emp, period, attendance, totals, components, deductionsBreakdown, tax } = payroll;
  const lateRule = payroll.summarySnapshot?.late_penalty_rule || {};
  const taxInfo = tax && tax.mode ? tax : deductionsBreakdown?.tax || {};
  const overtimeDetail = payroll.earningsBreakdown?.overtime || components.overtime || null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-foreground">{emp.first_name} {emp.last_name} — {MONTH_SHORT[(period.month || 1) - 1]} {period.year}</span>
            <StatusBadge status={payroll.status} />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto max-h-[calc(92vh-130px)]">
          <div className="px-6 py-5 space-y-6">
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

            <div>
              <SectionTitle icon={TrendingUp}>Earnings</SectionTitle>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20 rounded-lg px-4 py-1">
                <FieldRow label="Basic Salary" value={fmtPKR(totals.basic_salary)} mono />
                <FieldRow label={`Allowances (${(components.allowances || []).length})`} value={fmtPKR(totals.allowances_total)} mono highlight="green" />
                {(components.allowances || []).map((a, i) => <FieldRow key={i} label={`↳ ${a.name}`} value={fmtPKR(a.amount)} mono indent />)}
                <FieldRow label={`Bonuses (${(components.bonuses || []).length})`} value={fmtPKR(totals.bonuses_total)} mono highlight="green" />
                {(components.bonuses || []).map((b, i) => (
                  <FieldRow key={i} label={`↳ ${b.name}${b.eligible === false ? " (ineligible)" : ""}`} value={fmtPKR(b.amount)} mono indent />
                ))}
                {totals.overtime_amount > 0 && (
                  <>
                    <FieldRow label="Overtime Pay" value={fmtPKR(totals.overtime_amount)} mono />
                    {overtimeDetail?.hourly_rate
                      ? <FieldRow label={`↳ ${overtimeDetail.hours}h × PKR ${fmt(overtimeDetail.hourly_rate)} × ${overtimeDetail.rate_multiplier}x`} value="" indent />
                      : attendance.overtime_hours > 0 && <FieldRow label={`↳ ${attendance.overtime_hours} overtime hours`} value="" indent />
                    }
                  </>
                )}
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold">Gross Salary</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtPKR(totals.gross_salary)}</span>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle icon={Percent}>Deductions</SectionTitle>
              <div className="bg-red-50/50 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 rounded-lg px-4 py-1">
                <FieldRow label="Tax" value={fmtPKR(totals.tax_amount)} mono highlight="red" />
                {taxInfo.mode && <FieldRow label={`↳ Mode: ${taxInfo.mode}`} value={taxInfo.applicable_rate != null ? `${taxInfo.applicable_rate}% rate` : ""} indent />}
                {(components.deductions || []).map((d, i) => <FieldRow key={i} label={d.name} value={fmtPKR(d.amount)} mono />)}
                <Separator className="my-1.5" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold">Total Deductions</span>
                  <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400 tabular-nums">-{fmtPKR(totals.deductions_total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary rounded-xl px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-1">Net Salary</p>
                <p className="text-primary-foreground text-3xl font-bold tabular-nums">{fmtPKR(totals.net_salary)}</p>
                <p className="text-primary-foreground/50 text-xs mt-1">{MONTH_NAMES[(period.month || 1) - 1]} {period.year}</p>
              </div>
              <Banknote className="w-12 h-12 text-primary-foreground/20" />
            </div>

            <div className="flex flex-wrap gap-2">
              {perms.canApprovePayroll && payroll.status === "draft" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => onApprove(payroll.id)} disabled={actionLoading}>
                  <CheckCircle className="w-3.5 h-3.5" />Approve
                </Button>
              )}
              {perms.canMarkPaid && payroll.status === "processed" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => onMarkPaid(payroll.id)} disabled={actionLoading}>
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
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onRegenerate(payroll.id)}>
                        Yes, Regenerate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onPayslip(payroll)} disabled={actionLoading}>
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
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (!open) { setSelectedEmployee(null); setMonth(String(new Date().getMonth() + 1)); setYear(String(new Date().getFullYear())); }
  }, [open]);

  const handleSubmit = () => {
    const payload = { month: Number(month), year: Number(year) };
    if (selectedEmployee) payload.employee_id = selectedEmployee.id;
    onGenerate(payload);
  };

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
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Year</Label>
              <Input className="h-9" type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>

          <EmployeeSearchInputLg
            label="Employee"
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            onClear={() => setSelectedEmployee(null)}
            placeholder="Leave blank for all employees…"
          />

          {!selectedEmployee && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2.5 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Bulk run generates payroll for all employees with active salary structures.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={loading} onClick={handleSubmit}>
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
            <Badge variant="outline" className={cn("text-xs ml-1", s.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
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
                      <FieldRow key={i} label={a.name} value={a.type === "percentage" ? `${a.value}% of ${(a.basis || "basic_salary").replace(/_/g, " ")}` : fmtPKR(a.value ?? a.amount)} mono />
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
                      <FieldRow key={i} label={d.name} value={d.type === "percentage" ? `${d.value}% of ${(d.basis || "gross_salary").replace(/_/g, " ")}` : fmtPKR(d.value ?? d.amount)} mono />
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
                    <p className={cn("text-sm font-semibold", val ? "text-foreground" : "text-muted-foreground/40")}>{val || "Not linked"}</p>
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
  const emptyForm = {
    basic_salary: "", currency: "PKR", name: "",
    attendance_policy_id: "", overtime_policy_id: "",
    tax_policy_id: "", bonus_policy_id: "",
    effective_from: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) { setForm(emptyForm); setSelectedEmployee(null); }
  }, [open]);

  const handleSubmit = () => {
    if (!selectedEmployee) return toast.error("Please select an employee");
    if (!form.basic_salary || isNaN(parseFloat(form.basic_salary))) return toast.error("Valid basic salary is required");
    if (!form.attendance_policy_id.trim()) return toast.error("Attendance policy ID is required");
    if (!form.overtime_policy_id.trim()) return toast.error("Overtime policy ID is required");
    if (!form.tax_policy_id.trim()) return toast.error("Tax policy ID is required");

    const payload = {
      employee_id: selectedEmployee.id,
      basic_salary: parseFloat(form.basic_salary),
      currency: form.currency.trim() || "PKR",
      attendance_policy_id: form.attendance_policy_id.trim(),
      overtime_policy_id: form.overtime_policy_id.trim(),
      tax_policy_id: form.tax_policy_id.trim(),
      allowances: [], deductions: [], is_active: true,
    };
    if (form.name?.trim()) payload.name = form.name.trim();
    if (form.effective_from) payload.effective_from = form.effective_from;
    if (form.bonus_policy_id?.trim()) payload.bonus_policy_id = form.bonus_policy_id.trim();
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
            <EmployeeSearchInputLg
              label="Employee"
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              onClear={() => setSelectedEmployee(null)}
              required
            />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Structure Name</Label>
              <Input className="h-9" placeholder="e.g., Senior Engineer Package" value={form.name} onChange={setF("name")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Basic Salary <span className="text-destructive">*</span></Label>
                <Input className="h-9" type="number" min="0" step="0.01" placeholder="0.00" value={form.basic_salary} onChange={setF("basic_salary")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Currency</Label>
                <Input className="h-9" value={form.currency} onChange={setF("currency")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Effective From</Label>
              <Input className="h-9" type="date" value={form.effective_from} onChange={setF("effective_from")} />
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
                  <Input className="h-9" placeholder="UUID" value={form[key]} onChange={setF(key)} />
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

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  showEmployeePicker, perms,
  selectedEmployee, onEmployeeChange, onEmployeeClear,
  filterStatus, setFilterStatus,
  filterMonth, setFilterMonth,
  filterYear, setFilterYear,
  onApply,
}) {
  return (
    <div className="flex flex-wrap gap-2.5 items-end">
      {showEmployeePicker && perms.canViewAllPayrolls && (
        <div className="flex-1 min-w-[220px] max-w-xs">
          <EmployeeSearchInput
            label="Employee"
            value={selectedEmployee}
            onChange={onEmployeeChange}
            onClear={onEmployeeClear}
          />
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
        <Input className="h-8 w-20 text-sm" type="number" min="2000" max="2100" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} />
      </div>
      <Button size="sm" className="h-8" onClick={onApply}>Apply</Button>
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
              {["Employee","Period","Working","Payable","Gross","Deductions","Net Salary","Status",""].map((h) => (
                <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap py-3">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading payrolls…" /></TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="py-0 border-0"><EmptyState message={emptyMsg || "No payrolls found."} /></TableCell></TableRow>
            ) : data.map((p, i) => {
              const n = normalizePayroll(p);
              const { employee: emp, period, attendance, totals } = n;
              return (
                <TableRow key={n.id || i} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => onSelect(n)}>
                  <TableCell className="py-3">
                    <div className="font-semibold text-sm leading-tight">{emp.first_name} {emp.last_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{MONTH_SHORT[(period.month || 1) - 1]} {period.year}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums text-muted-foreground">{fmtNum(period.working_days)}</TableCell>
                  <TableCell className="text-sm text-center tabular-nums font-bold text-primary">{fmtNum(attendance.payable_days)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums text-muted-foreground">{fmtPKR(totals.gross_salary)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">-{fmtPKR(totals.deductions_total)}</TableCell>
                  <TableCell className="text-sm font-mono tabular-nums font-bold">{fmtPKR(totals.net_salary)}</TableCell>
                  <TableCell><StatusBadge status={n.status} /></TableCell>
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
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground tabular-nums">Page {page} of {pagination.pages}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page >= pagination.pages} onClick={() => onPageChange(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PayrollService() {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);

  const perms = useMemo(() => getPermissions(user), [user]);
  const defaultTab = perms.isEmployee ? "mine" : "payrolls";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── All Payrolls state (admin/hr/manager) ──────────────────────────────────
  const [allPayrolls, setAllPayrolls] = useState([]);
  const [allPage, setAllPage] = useState(1);
  const [allPagination, setAllPagination] = useState({ total: 0, pages: 1 });
  const [selectedEmployee, setSelectedEmployee] = useState(null); // picked from name search

  // ── My Payroll state ───────────────────────────────────────────────────────
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [myPage, setMyPage] = useState(1);
  const [myPagination, setMyPagination] = useState({ total: 0, pages: 1 });

  // ── Salary Structures state ────────────────────────────────────────────────
  const [structures, setStructures] = useState([]);
  const [structPage, setStructPage] = useState(1);
  const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });

  // ── Shared filters ──────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCreateStructure, setShowCreateStructure] = useState(false);

  // ── Build common payroll query params ──────────────────────────────────────
  const buildPayrollParams = useCallback((page) => {
    const p = { page, limit: 10 };
    if (filterStatus) p.status = filterStatus;
    if (filterMonth) p.month = filterMonth;
    if (filterYear) p.year = filterYear;
    return p;
  }, [filterStatus, filterMonth, filterYear]);

  // ── GET /payroll/me ────────────────────────────────────────────────────────
  const fetchMyPayrolls = useCallback(async (pageNum) => {
    setLoading(true); setError("");
    try {
      const res = await axiosInstance.get("/payroll/me", { params: buildPayrollParams(pageNum) });
      const d = res.data;
      if (d.payroll) {
        setMyPayrolls([d.payroll]);
        setMyPagination({ total: 1, pages: 1 });
      } else {
        setMyPayrolls(d.payrolls || []);
        setMyPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        const msg = e.response?.data?.message || "Failed to fetch your payrolls";
        setError(msg); toast.error(msg);
      }
      setMyPayrolls([]);
    } finally { setLoading(false); }
  }, [buildPayrollParams]);

  // ── GET /payroll/:employeeId ───────────────────────────────────────────────
  const fetchPayrollsByEmployee = useCallback(async (empId, pageNum) => {
    if (!empId) { setAllPayrolls([]); return; }
    setLoading(true); setError("");
    try {
      const res = await axiosInstance.get(`/payroll/${empId}`, { params: buildPayrollParams(pageNum) });
      const d = res.data;
      if (d.payroll) {
        setAllPayrolls([d.payroll]);
        setAllPagination({ total: 1, pages: 1 });
      } else {
        setAllPayrolls(d.payrolls || []);
        setAllPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        const msg = e.response?.data?.message || "Failed to fetch payrolls";
        setError(msg); toast.error(msg);
      }
      setAllPayrolls([]);
    } finally { setLoading(false); }
  }, [buildPayrollParams]);

  // ── GET /salary-structures  OR  /salary-structures/employee/:id ───────────
  const fetchStructures = useCallback(async (pageNum) => {
    setLoading(true); setError("");
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get("/salary-structures", { params: { page: pageNum, limit: 10 } });
        setStructures(res.data.salary_structures ?? []);
        setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
      } else {
        const empId = perms.selfEmployeeId;
        if (!empId) { toast.error("Cannot determine your employee ID — please contact HR."); setStructures([]); return; }
        const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
        const s = res.data?.salary_structure || res.data;
        setStructures(s?.id ? [s] : []);
        setStructPagination({ total: s?.id ? 1 : 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        const msg = e.response?.data?.message || "Failed to fetch salary structures";
        setError(msg); toast.error(msg);
      }
      setStructures([]);
    } finally { setLoading(false); }
  }, [perms.canViewAllStructures, perms.selfEmployeeId]);

  // ── Trigger fetches on tab / page change ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (activeTab === "mine") fetchMyPayrolls(myPage);
    else if (activeTab === "payrolls" && selectedEmployee) fetchPayrollsByEmployee(selectedEmployee.id, allPage);
    else if (activeTab === "structures") fetchStructures(structPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, myPage, allPage, structPage, user]);

  const handleTabChange = (tab) => { setActiveTab(tab); setError(""); };

  const handleApplyFilter = () => {
    if (activeTab === "mine") { setMyPage(1); fetchMyPayrolls(1); }
    else if (activeTab === "payrolls" && selectedEmployee) { setAllPage(1); fetchPayrollsByEmployee(selectedEmployee.id, 1); }
    else if (activeTab === "structures") { setStructPage(1); fetchStructures(1); }
  };

  // Employee picker callbacks for "All Payrolls" filter bar
  const handleEmployeeChange = (emp) => {
    setSelectedEmployee(emp);
    setAllPage(1);
    setAllPayrolls([]);
    fetchPayrollsByEmployee(emp.id, 1);
  };
  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setAllPayrolls([]);
    setAllPagination({ total: 0, pages: 1 });
  };

  // ── POST /payroll/generate ─────────────────────────────────────────────────
  const handleGenerate = async (payload) => {
    setActionLoading(true);
    try {
      const res = await axiosInstance.post("/payroll/generate", payload);
      const d = res.data;
      const count = d.total ?? (Array.isArray(d.payrolls) ? d.payrolls.length : 1);
      toast.success(`Payroll generated for ${count} employee${count !== 1 ? "s" : ""}!`);
      setShowGenerate(false);
      // Refresh relevant lists
      if (payload.employee_id && selectedEmployee?.id === payload.employee_id) {
        fetchPayrollsByEmployee(payload.employee_id, allPage);
      }
      if (activeTab === "mine") fetchMyPayrolls(myPage);
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || e.message || "Payroll generation failed");
    } finally { setActionLoading(false); }
  };

  // ── POST /payroll/:id/approve ──────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/approve`);
      toast.success("Payroll approved and moved to Processed.");
      setSelectedPayroll(null);
      if (activeTab === "mine") fetchMyPayrolls(myPage);
      else if (selectedEmployee) fetchPayrollsByEmployee(selectedEmployee.id, allPage);
    } catch (e) { toast.error(e.response?.data?.message || "Approval failed"); }
    finally { setActionLoading(false); }
  };

  // ── POST /payroll/:id/mark-paid ────────────────────────────────────────────
  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/mark-paid`);
      toast.success("Payroll marked as Paid.");
      setSelectedPayroll(null);
      if (activeTab === "mine") fetchMyPayrolls(myPage);
      else if (selectedEmployee) fetchPayrollsByEmployee(selectedEmployee.id, allPage);
    } catch (e) { toast.error(e.response?.data?.message || "Failed to mark as paid"); }
    finally { setActionLoading(false); }
  };

  // ── POST /payroll/:id/regenerate ───────────────────────────────────────────
  const handleRegenerate = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/regenerate`);
      toast.success("Payroll regenerated from scratch.");
      setSelectedPayroll(null);
      if (activeTab === "mine") fetchMyPayrolls(myPage);
      else if (selectedEmployee) fetchPayrollsByEmployee(selectedEmployee.id, allPage);
    } catch (e) { toast.error(e.response?.data?.message || "Regeneration failed"); }
    finally { setActionLoading(false); }
  };

  // ── Payslip (client-side HTML → print dialog) ─────────────────────────────
  const handlePayslip = (payroll) => {
    try {
      const html = buildPayslipHtml(payroll);
      const win = window.open("", "_blank");
      if (!win) { toast.error("Pop-up blocked — allow pop-ups for this site to download payslips."); return; }
      win.document.write(html);
      win.document.close();
      toast.success("Payslip opened — use Print → Save as PDF.");
    } catch (e) { toast.error("Failed to generate payslip: " + (e.message || "Unknown error")); }
  };

  // ── POST /salary-structures ────────────────────────────────────────────────
  const handleCreateStructure = async (payload) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/salary-structures", payload);
      toast.success("Salary structure created successfully!");
      setShowCreateStructure(false);
      setStructPage(1);
      fetchStructures(1);
    } catch (e) { toast.error(e.response?.data?.message || "Failed to create salary structure"); }
    finally { setActionLoading(false); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const makeStats = (list) => ({
    total: list.length,
    draft: list.filter((p) => p.status === "draft").length,
    processed: list.filter((p) => p.status === "processed").length,
    paid: list.filter((p) => p.status === "paid").length,
    totalNet: list.reduce((s, p) => s + Number(normalizePayroll(p)?.totals?.net_salary || 0), 0),
  });
  const allStats = makeStats(allPayrolls);
  const myStats = makeStats(myPayrolls);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/90 backdrop-blur-sm top-0">
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

          {/* ── All Payrolls ── */}
          {perms.canViewAllPayrolls && (
            <TabsContent value="payrolls" className="mt-0 space-y-4">
              <FilterBar
                showEmployeePicker perms={perms}
                selectedEmployee={selectedEmployee}
                onEmployeeChange={handleEmployeeChange}
                onEmployeeClear={handleEmployeeClear}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                filterYear={filterYear} setFilterYear={setFilterYear}
                onApply={handleApplyFilter}
              />
              {allPayrolls.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  <StatCard label="Records" value={allStats.total} icon={FileText} />
                  <StatCard label="Draft" value={allStats.draft} icon={Clock} variant="amber" />
                  <StatCard label="Processed" value={allStats.processed} icon={CheckCircle} variant="sky" />
                  <StatCard label="Paid" value={allStats.paid} sub={fmtPKR(allStats.totalNet)} icon={DollarSign} variant="emerald" />
                </div>
              )}
              <PayrollTable
                data={allPayrolls} loading={loading}
                emptyMsg={selectedEmployee
                  ? `No payrolls found for ${selectedEmployee.first_name} ${selectedEmployee.last_name}.`
                  : "Search for an employee above to view their payrolls."}
                onSelect={setSelectedPayroll}
                pagination={allPagination} page={allPage}
                onPageChange={(p) => { setAllPage(p); fetchPayrollsByEmployee(selectedEmployee?.id, p); }}
              />
            </TabsContent>
          )}

          {/* ── My Payroll ── */}
          <TabsContent value="mine" className="mt-0 space-y-4">
            <FilterBar
              showEmployeePicker={false} perms={perms}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterMonth={filterMonth} setFilterMonth={setFilterMonth}
              filterYear={filterYear} setFilterYear={setFilterYear}
              onApply={handleApplyFilter}
            />
            {myPayrolls.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Records" value={myStats.total} icon={FileText} />
                <StatCard label="Draft" value={myStats.draft} icon={Clock} variant="amber" />
                <StatCard label="Processed" value={myStats.processed} icon={CheckCircle} variant="sky" />
                <StatCard label="Paid" value={myStats.paid} sub={fmtPKR(myStats.totalNet)} icon={DollarSign} variant="emerald" />
              </div>
            )}
            <PayrollTable
              data={myPayrolls} loading={loading}
              emptyMsg="No payroll records found for your account."
              onSelect={setSelectedPayroll}
              pagination={myPagination} page={myPage}
              onPageChange={(p) => { setMyPage(p); fetchMyPayrolls(p); }}
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
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                      {["Employee","Structure","Basic Salary","Allowances","Deductions","Currency","Status",""].map((h) => (
                        <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading structures…" /></TableCell></TableRow>
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
                                : "bg-muted text-muted-foreground border-border",
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
              {structPagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <span className="text-xs text-muted-foreground">{structPagination.total} structure{structPagination.total !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={structPage <= 1}
                      onClick={() => { const p = structPage - 1; setStructPage(p); fetchStructures(p); }}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground tabular-nums">Page {structPage} of {structPagination.pages}</span>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={structPage >= structPagination.pages}
                      onClick={() => { const p = structPage + 1; setStructPage(p); fetchStructures(p); }}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modals ── */}
      <PayrollDetailModal
        payroll={selectedPayroll} open={!!selectedPayroll} onClose={() => setSelectedPayroll(null)}
        perms={perms} onApprove={handleApprove} onMarkPaid={handleMarkPaid}
        onRegenerate={handleRegenerate} onPayslip={handlePayslip} actionLoading={actionLoading}
      />
      <SalaryStructureModal structure={selectedStructure} open={!!selectedStructure} onClose={() => setSelectedStructure(null)} />
      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} loading={actionLoading} />
      <CreateStructureModal open={showCreateStructure} onClose={() => setShowCreateStructure(false)} onCreate={handleCreateStructure} loading={actionLoading} />
    </div>
  );
}