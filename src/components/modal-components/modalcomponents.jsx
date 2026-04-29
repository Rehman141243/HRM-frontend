import { AlertCircle, Banknote, CheckCircle, Clock ,Plus,Search,X} from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { cn } from "@/lib/utils";
// ─── Role/Permission Helpers ──────────────────────────────────────────────────
export const getPermissions = (user) => {
    const designation = (user?.designation || "").toLowerCase();
    const role = (user?.role || "").toLowerCase();
    const eff = designation || role;
    const isAdmin = eff === "admin";
    const isHr = eff === "hr";
    const isEmployee = !isAdmin && !isHr;
    const isAdminOrHr = isAdmin || isHr;
    const selfEmployeeId = user?.employee_id || user?.employeeId || null;
    return {
      isAdmin, isHr, isEmployee, isAdminOrHr, selfEmployeeId,
      canViewAllPayrolls: isAdminOrHr,
      canGeneratePayroll: isAdminOrHr,
      canApprovePayroll: isAdminOrHr,
      canMarkPaid: isAdminOrHr,
      canRegeneratePayroll: isAdminOrHr,
      canViewAllStructures: isAdminOrHr,
      canCreateStructure: isAdminOrHr,
      canEditStructure: isAdminOrHr,
      canManagePolicies: isAdminOrHr,
      canViewOwnPayroll: true,
      canViewOwnStructure: true,
      roleLabel: isAdmin ? "Administrator" : isHr ? "HR Manager" : "Employee",
    };
  };

  // ─── Format Helpers ───────────────────────────────────────────────────────────
  export const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  export const fmtPKR = (n) => `PKR ${fmt(n)}`;
  export const fmtNum = (n, fallback = "—") => (n === null || n === undefined) ? fallback : String(n);
  
  export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // ─── Data Normalization ───────────────────────────────────────────────────────
  export const normalizePayroll = (row) => {
    if (!row) return null;
    if (row.period && typeof row.period === "object" && row.attendance && row.totals && row.components) {
      const { period, attendance, totals, components, tax = {} } = row;
      const nonTaxDeductions = (components.deductions || []).filter(
        (d) => d && d.name && !["tax", "income tax"].includes(String(d.name).toLowerCase().trim())
      );
      return {
        id: row.id, status: row.status, employee: row.employee || {},
        period: { month: period.month, year: period.year, start_date: period.start_date || null, end_date: period.end_date || null, working_days: period.working_days },
        attendance: {
          present_days: attendance.present_days, paid_leaves: attendance.paid_leaves,
          unpaid_leaves: attendance.unpaid_leaves, payable_days: attendance.payable_days,
          overtime_hours: attendance.overtime_hours, late_arrivals: attendance.late_arrivals,
          late_penalty_days: row.summary_snapshot?.late_penalty_days ?? null,
          proration_factor_percent: attendance.proration_factor_percent,
        },
        totals: {
          basic_salary: totals.basic_salary, allowances_total: totals.allowances_total,
          bonuses_total: totals.bonuses_total, overtime_amount: totals.overtime_amount,
          gross_salary: totals.gross_salary, deductions_total: totals.deductions_total,
          net_salary: totals.net_salary, tax_amount: totals.tax_amount ?? tax.amount ?? 0,
          non_tax_deductions_total: totals.non_tax_deductions_total ?? 0,
        },
        components: { allowances: components.allowances || [], bonuses: components.bonuses || [], deductions: nonTaxDeductions, overtime: null },
        tax, summarySnapshot: row.summary_snapshot || {},
        earningsBreakdown: { allowances: components.allowances || [], bonuses: components.bonuses || [] },
        deductionsBreakdown: { tax: { mode: tax.mode, applicable_rate: tax.rate, amount: tax.amount ?? 0 }, items: nonTaxDeductions },
        _raw: row,
      };
    }
    const summary = row.summary_snapshot || {};
    const earnings = row.earnings_breakdown || {};
    const deductions = row.deductions_breakdown || {};
    const taxAmount = deductions?.tax?.amount ?? 0;
    const nonTaxItems = (deductions?.items || []).filter(
      (d) => d && d.name && !["tax", "income tax"].includes(String(d.name).toLowerCase().trim())
    );
    return {
      id: row.id, status: row.status, employee: row.employee || {},
      period: { month: row.month, year: row.year, start_date: row.period_snapshot?.start_date || null, end_date: row.period_snapshot?.end_date || null, working_days: row.total_days ?? summary.total_days ?? null },
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
      components: { allowances: earnings.allowances || [], bonuses: earnings.bonuses || [], deductions: nonTaxItems, overtime: earnings.overtime || null },
      tax: deductions?.tax || {}, summarySnapshot: summary,
      earningsBreakdown: earnings, deductionsBreakdown: deductions, _raw: row,
    };
  };
  
  export const normalizeSalaryStructure = (s) => {
    if (!s) return null;
    return {
      ...s,
      allowance_total: s.allowance_total ?? (s.allowances || []).reduce((sum, a) => sum + Number(a.amount ?? a.value ?? 0), 0),
      deduction_total: s.deduction_total ?? (s.deductions || []).reduce((sum, d) => sum + Number(d.amount ?? d.value ?? 0), 0),
      attendance_policy: s.attendance_policy ?? (s.attendance_policy_id ? { name: s.attendance_policy_name ?? null } : null),
      overtime_policy:   s.overtime_policy   ?? (s.overtime_policy_id   ? { name: s.overtime_policy_name   ?? null } : null),
      tax_policy:        s.tax_policy        ?? (s.tax_policy_id        ? { name: s.tax_policy_name        ?? null } : null),
      bonus_policy:      s.bonus_policy      ?? (s.bonus_policy_id      ? { name: s.bonus_policy_name      ?? null } : null),
    };
  };
  
  // ─── Payslip HTML Generator ───────────────────────────────────────────────────
  export const buildPayslipHtml = (payroll) => {
    const { employee: emp, period, attendance, totals, components, tax, deductionsBreakdown } = payroll;
    const fullMonth = MONTH_NAMES[(period.month || 1) - 1];
    const fA = (n) => `PKR ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const allowanceRows = (components.allowances || []).map((a) => `<tr><td class="sub">↳ ${a.name || "Allowance"}</td><td class="sub-amt">${fA(a.amount)}</td></tr>`).join("");
    const bonusRows = (components.bonuses || []).map((b) => `<tr><td class="sub">↳ ${b.name || "Bonus"}${b.eligible === false ? " <em>(ineligible)</em>" : ""}</td><td class="sub-amt">${fA(b.amount)}</td></tr>`).join("");
    const deductionRows = (components.deductions || []).filter((d) => d && d.name && !["tax", "income tax"].includes(String(d.name).toLowerCase().trim())).map((d) => `<tr><td>${d.name}</td><td class="amt">${fA(d.amount)}</td></tr>`).join("");
    const taxObj = tax && tax.mode ? tax : deductionsBreakdown?.tax || {};
    const taxNote = taxObj.mode ? `<div class="tax-note">Mode: ${taxObj.mode}${taxObj.applicable_rate != null ? ` · Rate: ${taxObj.applicable_rate}%` : ""}</div>` : "";
    const overtimeRow = totals.overtime_amount > 0 ? `<tr><td>Overtime Pay</td><td class="amt">${fA(totals.overtime_amount)}</td></tr>` : "";
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Payslip</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#f0f0f0}.page{max-width:820px;margin:30px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)}.hdr{background:#0f172a;color:#fff;padding:28px 36px;display:flex;justify-content:space-between;align-items:flex-start}.hdr h1{font-size:22px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}.hdr .sub{font-size:12px;opacity:.6}.hdr .badge{background:rgba(255,255,255,.15);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600}.hdr .right{text-align:right}.hdr .dates{font-size:11px;opacity:.5;margin-top:6px}.body{padding:28px 36px}.section{margin-bottom:24px}.stitle{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#666;border-bottom:1px solid #e8e8e8;padding-bottom:6px;margin-bottom:14px}.agrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.acard{background:#f8fafc;border:1px solid #e8ecf0;border-radius:8px;padding:12px;text-align:center}.acard .n{font-size:20px;font-weight:700;color:#0f172a}.acard .l{font-size:10px;color:#888;margin-top:3px;text-transform:uppercase;letter-spacing:.5px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}table{width:100%;border-collapse:collapse}table th{background:#f8fafc;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;padding:8px 10px;text-align:left}table td{padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:13px}table tr:last-child td{border-bottom:none}td.amt{text-align:right;font-family:monospace;font-weight:600}td.sub{color:#999;font-size:11px;padding-left:22px}td.sub-amt{text-align:right;font-family:monospace;font-size:11px;color:#999}.totrow td{font-weight:700;background:#f8fafc;font-size:14px}.tax-note{font-size:10px;color:#999;margin-top:8px;padding:4px 8px;background:#fafafa;border-radius:4px}.net{background:#0f172a;color:#fff;border-radius:10px;padding:22px 28px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.net .l{font-size:10px;opacity:.5;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}.net .a{font-size:30px;font-weight:700;font-family:monospace}.net .icon{font-size:48px;opacity:.2}.footer{text-align:center;color:#bbb;font-size:11px;padding:16px 36px 24px;border-top:1px solid #f0f0f0;margin-top:4px}@media print{body{background:#fff}.page{margin:0;border-radius:0;box-shadow:none}}</style></head><body><div class="page"><div class="hdr"><div><h1>${emp.first_name || ""} ${emp.last_name || ""}</h1><div class="sub">${emp.designation || ""}${emp.department ? " · " + emp.department : ""}</div></div><div class="right"><div class="badge">${fullMonth} ${period.year || ""}</div><div class="dates">${period.start_date || "—"} → ${period.end_date || "—"}</div></div></div><div class="body"><div class="section"><div class="stitle">Attendance Summary</div><div class="agrid"><div class="acard"><div class="n">${fmtNum(period.working_days)}</div><div class="l">Working Days</div></div><div class="acard"><div class="n">${fmtNum(attendance.payable_days)}</div><div class="l">Payable Days</div></div><div class="acard"><div class="n">${fmtNum(attendance.present_days)}</div><div class="l">Present</div></div><div class="acard"><div class="n">${fmtNum(attendance.paid_leaves)}</div><div class="l">Paid Leave</div></div><div class="acard"><div class="n">${fmtNum(attendance.unpaid_leaves)}</div><div class="l">Unpaid Leave</div></div><div class="acard"><div class="n">${fmtNum(attendance.late_arrivals)}</div><div class="l">Late Arrivals</div></div><div class="acard"><div class="n">${fmtNum(attendance.overtime_hours)}</div><div class="l">Overtime hrs</div></div><div class="acard"><div class="n">${attendance.proration_factor_percent != null ? attendance.proration_factor_percent + "%" : "—"}</div><div class="l">Proration</div></div></div></div><div class="grid2"><div class="section"><div class="stitle">Earnings</div><table><tr><th>Component</th><th style="text-align:right">Amount</th></tr><tr><td>Basic Salary</td><td class="amt">${fA(totals.basic_salary)}</td></tr><tr><td>Allowances</td><td class="amt">${fA(totals.allowances_total)}</td></tr>${allowanceRows}<tr><td>Bonuses</td><td class="amt">${fA(totals.bonuses_total)}</td></tr>${bonusRows}${overtimeRow}<tr class="totrow"><td>Gross Salary</td><td class="amt">${fA(totals.gross_salary)}</td></tr></table></div><div class="section"><div class="stitle">Deductions</div><table><tr><th>Component</th><th style="text-align:right">Amount</th></tr><tr><td>Tax</td><td class="amt">${fA(totals.tax_amount)}</td></tr>${deductionRows}<tr class="totrow"><td>Total Deductions</td><td class="amt">− ${fA(totals.deductions_total)}</td></tr></table>${taxNote}</div></div><div class="net"><div><div class="l">Net Salary — ${fullMonth} ${period.year || ""}</div><div class="a">${fA(totals.net_salary)}</div></div><div class="icon">💳</div></div></div><div class="footer">System-generated payslip · For queries contact HR · Generated ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</div></div><script>window.onload = () => window.print();<\/script></body></html>`;
  };
  
  export const extractErrorMessage = (e, fallback = "An error occurred") => {
    const d = e?.response?.data;
    return d?.message || d?.error || (Array.isArray(d?.errors) ? d.errors.map((er) => er.msg || er.message || String(er)).join(", ") : null) || (typeof d === "string" ? d : null) || e?.message || fallback;
  };
  
  // ─── UI Atoms ─────────────────────────────────────────────────────────────────
  export function StatusBadge({ status }) {
    const cfg = {
      draft: { cls: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock className="w-3 h-3" /> },
      processed: { cls: "bg-sky-50 text-sky-700 border border-sky-200", icon: <CheckCircle className="w-3 h-3" /> },
      paid: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <Banknote className="w-3 h-3" /> },
    };
    const { cls, icon } = cfg[status] || cfg.draft;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide", cls)}>
        {icon}{status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
      </span>
    );
  }
  
  export function DesignationBadge({ designation }) {
    const d = (designation || "").toLowerCase();
    const cls = d === "admin" ? "bg-purple-50 text-purple-700 border-purple-200"
      : d === "hr" ? "bg-blue-50 text-blue-700 border-blue-200"
        : d === "manager" ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-gray-50 text-gray-600 border-gray-200";
    return <span className={cn("inline-block border rounded-full px-2 py-0.5 text-xs capitalize font-medium", cls)}>{designation || "—"}</span>;
  }
  
  export function EmptyState({ icon: Icon = AlertCircle, message }) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      </div>
    );
  }
  
  // ─── Modal System ─────────────────────────────────────────────────────────────
  export function Modal({ open, onClose, children, maxWidth = "max-w-2xl" }) {
    useEffect(() => {
      if (open) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
      return () => { document.body.style.overflow = ""; };
    }, [open]);
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={cn("relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden", maxWidth)} style={{ maxHeight: "92vh" }}>
          {children}
        </div>
      </div>
    );
  }
  
  export function ModalHeader({ title, subtitle, icon: Icon, badge, onClose, actions }) {
    return (
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 ">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {actions}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  
  export function ModalBody({ children }) {
    return <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>;
  }
  
  export const inputCls = "w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400";
  // ─── Employee Search Combobox ─────────────────────────────────────────────────
export function EmployeeSearchCombobox({ value, onChange, disabled }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
  
    const displayName = value ? `${value.first_name || ""} ${value.last_name || ""}`.trim() : "";
  
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
  
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          className={cn(inputCls, "pl-8 pr-8")}
          placeholder="Search employee by name…"
          value={value ? displayName : query}
          onChange={(e) => { setQuery(e.target.value); onChange(null); setOpen(false); }}
          onFocus={() => { if (!value) setQuery(""); }}
          disabled={disabled}
          autoComplete="off"
        />
        {(query || value) && (
          <button onClick={() => { setQuery(""); onChange(null); setResults([]); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {open && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {busy && <div className="px-4 py-3 text-xs text-gray-400">Searching…</div>}
            {!busy && results.length === 0 && <div className="px-4 py-3 text-xs text-gray-400">No employees found.</div>}
            {!busy && results.map((emp) => (
              <button key={emp.id} onClick={() => { onChange(emp); setQuery(""); setOpen(false); setResults([]); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{emp.first_name} {emp.last_name}</div>
                <div className="text-xs text-gray-400">{emp.designation || "—"}{emp.department ? ` · ${emp.department}` : ""}</div>
              </button>
            ))}
          </div>
        )}
        {value && <p className="text-xs text-emerald-600 font-medium mt-1.5">✓ {displayName}{value.designation ? ` · ${value.designation}` : ""}</p>}
      </div>
    );
  }
  
  // ─── Salary Component Editor ──────────────────────────────────────────────────
  export function ComponentEditor({ title, components, onChange, basisOptions = ["basic_salary", "gross_salary"] }) {
    const addComponent = () => {
      onChange([...components, { name: "", type: "fixed", value: "", basis: basisOptions[0], apply_proration: true }]);
    };
    const removeComponent = (i) => onChange(components.filter((_, idx) => idx !== i));
    const updateComponent = (i, field, val) => {
      const updated = [...components];
      updated[i] = { ...updated[i], [field]: val };
      onChange(updated);
    };
  
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <button onClick={addComponent}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <Plus className="w-3 h-3" />Add
          </button>
        </div>
        {components.length === 0 && (
          <p className="text-xs text-gray-400 italic py-2">No {title.toLowerCase()} added yet.</p>
        )}
        {components.map((comp, i) => (
          <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input className={cn(inputCls, "flex-1")} placeholder="Name" value={comp.name || ""} onChange={(e) => updateComponent(i, "name", e.target.value)} />
              <button onClick={() => removeComponent(i)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={comp.type || "fixed"} onChange={(e) => updateComponent(i, "type", e.target.value)}
                className={cn(inputCls, "col-span-1")}>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
              <input type="number" min="0" step="0.01" className={cn(inputCls, "col-span-1")}
                placeholder={comp.type === "percentage" ? "%" : "Amount"}
                value={comp.value ?? ""} onChange={(e) => updateComponent(i, "value", e.target.value)} />
              <select value={comp.basis || basisOptions[0]} onChange={(e) => updateComponent(i, "basis", e.target.value)}
                className={cn(inputCls, "col-span-1")}>
                {basisOptions.map((b) => <option key={b} value={b}>{b.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={comp.apply_proration !== false}
                onChange={(e) => updateComponent(i, "apply_proration", e.target.checked)}
                className="w-3.5 h-3.5 rounded" />
              <span className="text-xs text-gray-500">Apply proration</span>
            </label>
          </div>
        ))}
      </div>
    );
  }