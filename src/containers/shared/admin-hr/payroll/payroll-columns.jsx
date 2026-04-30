'use client'

import { cn } from "@/lib/utils";
import { MoreHorizontal, Eye, CheckCircle2, Banknote, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const fmtCurrency = (v, symbol = "PKR") => {
  if (v == null || isNaN(Number(v))) return "—";
  return `${symbol} ${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const fmtDate = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  draft:     { label: "Draft",     cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
  processed: { label: "Processed", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  paid:      { label: "Paid",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status ?? "—", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

export function buildPayrollColumns({ onView, onApprove, onMarkPaid, onRegenerate, onPayslip, actionId }) {
  return [
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const e = row.original.employee;
        return e ? (
          <div>
            <p className="text-sm font-medium">{`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()}</p>
            {(e.designation || e.department) && (
              <p className="text-xs text-muted-foreground">{[e.designation, e.department].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => {
        const p = row.original.period;
        return p ? (
          <span className="text-sm">{MONTH_NAMES[p.month] ?? p.month} {p.year}</span>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      id: "basic_salary",
      header: "Basic",
      cell: ({ row }) => <span className="text-sm">{fmtCurrency(row.original.totals?.basic_salary)}</span>,
    },
    {
      id: "gross_salary",
      header: "Gross",
      cell: ({ row }) => <span className="text-sm font-medium">{fmtCurrency(row.original.totals?.gross_salary)}</span>,
    },
    {
      id: "deductions",
      header: "Deductions",
      cell: ({ row }) => <span className="text-sm text-red-600 dark:text-red-400">{fmtCurrency(row.original.totals?.deductions_total)}</span>,
    },
    {
      id: "net_salary",
      header: "Net Salary",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          {fmtCurrency(row.original.totals?.net_salary)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "generated_at",
      header: "Generated",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.generated_at)}</span>,
    },
    {
      id: "processed_at",
      header: "Processed",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.processed_at)}</span>,
    },
    {
      id: "paid_at",
      header: "Paid",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.paid_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        const busy = actionId === p.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={busy}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {busy
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <MoreHorizontal className="w-4 h-4" />
                }
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(p)}>
                <Eye className="w-4 h-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {p.status === "draft" && (
                <DropdownMenuItem onClick={() => onApprove(p.id)}>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Approve
                </DropdownMenuItem>
              )}
              {p.status === "processed" && (
                <DropdownMenuItem onClick={() => onMarkPaid(p.id)}>
                  <Banknote className="w-4 h-4 text-emerald-600" /> Mark as Paid
                </DropdownMenuItem>
              )}
              {p.status === "paid" && (
                <DropdownMenuItem onClick={() => onPayslip(p.id)}>
                  <Eye className="w-4 h-4" /> View Payslip
                </DropdownMenuItem>
              )}
              {(p.status === "draft" || p.status === "processed") && (
                <DropdownMenuItem onClick={() => onRegenerate(p.id)} className="text-destructive focus:text-destructive">
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
