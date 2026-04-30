'use client'

import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle2, Banknote, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtCurrency, fmtDate, StatusBadge, MONTH_NAMES } from "./payroll-columns";

// ─── Section ──────────────────────────────────────────────────────────────────

export function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Key-Value Row ────────────────────────────────────────────────────────────

export function KV({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={cn(
        "text-sm font-medium",
        highlight
          ? "text-emerald-700 dark:text-emerald-400 text-base font-bold"
          : "text-gray-900 dark:text-gray-100"
      )}>
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── Component Table ──────────────────────────────────────────────────────────

export function ComponentTable({ rows, cols }) {
  if (!rows?.length) return <p className="text-xs text-muted-foreground">None</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            {cols.map((c) => (
              <th key={c.key} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
              {cols.map((c) => (
                <td key={c.key} className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                  {c.render ? c.render(row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Payroll Detail Panel ─────────────────────────────────────────────────────

export default function PayrollDetails({
  payroll,
  onClose,
  onApprove,
  onMarkPaid,
  onRegenerate,
  onPayslip,
  actionId,
}) {
  if (!payroll) return null;

  const { period, attendance, totals, tax, components, employee, status } = payroll;
  const busy = actionId === payroll.id;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-white dark:bg-gray-950 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold">
              {employee ? `${employee.first_name} ${employee.last_name}` : "Payroll Detail"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {MONTH_NAMES[period?.month]} {period?.year}
              </span>
              <span className="text-muted-foreground">·</span>
              <StatusBadge status={status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Employee */}
          {employee && (
            <Section title="Employee">
              <div className="grid grid-cols-2 gap-x-8">
                <KV label="Name" value={`${employee.first_name} ${employee.last_name}`} />
                <KV label="Designation" value={employee.designation} />
                <KV label="Department" value={employee.department} />
              </div>
            </Section>
          )}

          {/* Period */}
          <Section title="Period">
            <div className="grid grid-cols-2 gap-x-8">
              <KV label="Month / Year" value={`${MONTH_NAMES[period?.month]} ${period?.year}`} />
              <KV label="Working Days" value={period?.working_days} />
              <KV label="Start Date" value={fmtDate(period?.start_date)} />
              <KV label="End Date" value={fmtDate(period?.end_date)} />
            </div>
          </Section>

          {/* Attendance */}
          <Section title="Attendance">
            <div className="grid grid-cols-2 gap-x-8">
              <KV label="Present Days" value={attendance?.present_days} />
              <KV label="Half Days" value={attendance?.half_days} />
              <KV label="Half Day Units" value={attendance?.half_day_units} />
              <KV label="Paid Leaves" value={attendance?.paid_leaves} />
              <KV label="Unpaid Leaves" value={attendance?.unpaid_leaves} />
              <KV label="Payable Days" value={attendance?.payable_days} />
              <KV label="Late Arrivals" value={attendance?.late_arrivals} />
              <KV
                label="Proration Factor"
                value={attendance?.proration_factor_percent != null
                  ? `${attendance.proration_factor_percent}%`
                  : "—"}
              />
            </div>

            {attendance?.overtime_breakdown && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Overtime Breakdown
                </p>
                <div className="grid grid-cols-2 gap-x-8">
                  <KV label="Approved Hours" value={attendance.overtime_breakdown.approved_hours} />
                  <KV label="Unapproved Hours" value={attendance.overtime_breakdown.unapproved_hours} />
                  <KV label="Approved OT Amount" value={fmtCurrency(attendance.overtime_breakdown.approved_overtime_amount)} />
                  <KV label="Unapproved OT Amount" value={fmtCurrency(attendance.overtime_breakdown.unapproved_overtime_amount)} />
                </div>
              </div>
            )}
          </Section>

          {/* Earnings */}
          <Section title="Earnings">
            <KV label="Basic Salary" value={fmtCurrency(totals?.basic_salary)} />

            <div className="mt-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Allowances</p>
              <ComponentTable
                rows={components?.allowances}
                cols={[
                  { key: "name",   label: "Name" },
                  { key: "type",   label: "Type" },
                  { key: "value",  label: "Value" },
                  { key: "amount", label: "Amount", render: (r) => fmtCurrency(r.amount) },
                ]}
              />
            </div>

            {components?.bonuses?.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bonuses</p>
                <ComponentTable
                  rows={components.bonuses}
                  cols={[
                    { key: "name",    label: "Name" },
                    { key: "type",    label: "Type" },
                    { key: "amount",  label: "Amount",  render: (r) => fmtCurrency(r.amount) },
                    { key: "eligible",label: "Eligible", render: (r) => r.eligible ? "Yes" : "No" },
                  ]}
                />
              </div>
            )}

            {components?.overtime && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Overtime</p>
                <div className="grid grid-cols-2 gap-x-8">
                  <KV label="Approved Hours" value={components.overtime.approved_hours} />
                  <KV label="Unapproved Hours" value={components.overtime.unapproved_hours} />
                  <KV label="Hourly Rate" value={fmtCurrency(components.overtime.hourly_rate)} />
                  <KV label="Rate Multiplier" value={components.overtime.approved_rate_multiplier != null ? `${components.overtime.approved_rate_multiplier}×` : "—"} />
                  <KV label="Approved OT Amount" value={fmtCurrency(components.overtime.approved_overtime_amount)} />
                  <KV label="Unapproved OT Amount" value={fmtCurrency(components.overtime.unapproved_overtime_amount)} />
                </div>
              </div>
            )}
          </Section>

          {/* Deductions */}
          <Section title="Deductions">
            <ComponentTable
              rows={components?.deductions}
              cols={[
                { key: "name",   label: "Name" },
                { key: "type",   label: "Type" },
                { key: "amount", label: "Amount", render: (r) => fmtCurrency(r.amount) },
              ]}
            />

            {tax && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tax</p>
                <div className="grid grid-cols-2 gap-x-8">
                  <KV label="Mode" value={tax.mode} />
                  <KV label="Rate" value={tax.rate != null ? `${tax.rate}%` : "—"} />
                  <KV label="Tax Amount" value={fmtCurrency(tax.amount)} />
                </div>
              </div>
            )}
          </Section>

          {/* Totals */}
          <Section title="Totals">
            <KV label="Basic Salary"       value={fmtCurrency(totals?.basic_salary)} />
            <KV label="Allowances"         value={fmtCurrency(totals?.allowances_total)} />
            <KV label="Bonuses"            value={fmtCurrency(totals?.bonuses_total)} />
            <KV label="Overtime"           value={fmtCurrency(totals?.total_overtime_amount)} />
            <KV label="Gross Salary"       value={fmtCurrency(totals?.gross_salary)} />
            <KV label="Tax"                value={fmtCurrency(totals?.tax_amount)} />
            <KV label="Other Deductions"   value={fmtCurrency(totals?.non_tax_deductions_total)} />
            <KV label="Total Deductions"   value={fmtCurrency(totals?.deductions_total)} />
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <KV label="Net Salary" value={fmtCurrency(totals?.net_salary)} highlight />
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <KV label="Generated"  value={fmtDate(payroll.generated_at)} />
            <KV label="Processed"  value={fmtDate(payroll.processed_at)} />
            <KV label="Paid"       value={fmtDate(payroll.paid_at)} />
          </Section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2 shrink-0">
          {status === "draft" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onRegenerate(payroll.id)}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <Button size="sm" disabled={busy} onClick={() => onApprove(payroll.id)} className="gap-1.5">
                {busy
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle2 className="w-3.5 h-3.5" />
                }
                Approve
              </Button>
            </>
          )}

          {status === "processed" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onRegenerate(payroll.id)}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => onMarkPaid(payroll.id)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {busy
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Banknote className="w-3.5 h-3.5" />
                }
                Mark as Paid
              </Button>
            </>
          )}

          {status === "paid" && (
            <Button size="sm" disabled={busy} onClick={() => onPayslip(payroll.id)} className="gap-1.5">
              {busy
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Eye className="w-3.5 h-3.5" />
              }
              View Payslip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
