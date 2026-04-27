'use client'

import { X, Pencil, Clock, Receipt, UserCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPKR } from "@/components/modal-components/modalcomponents";

const typeConfig = {
  attendance: {
    label: "Attendance", Icon: UserCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  },
  overtime: {
    label: "Overtime", Icon: Clock,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
  },
  tax: {
    label: "Tax", Icon: Receipt,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  },
  bonus: {
    label: "Bonus", Icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  },
};

// ── primitives ────────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }) => {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-44">{label}</span>
      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right break-all">{String(value)}</span>
    </div>
  );
};

const YesNoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-44">{label}</span>
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
      value
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
        : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
    )}>
      {value ? "Yes" : "No"}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
      {title}
    </p>
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 px-3">
      {children}
    </div>
  </div>
);

// ── detail bodies ─────────────────────────────────────────────────────────────

function AttendanceDetail({ p }) {
  const hasDateOverrides =
    p.holiday_dates?.length ||
    p.working_weekend_dates?.length ||
    p.forced_working_dates?.length ||
    p.manual_off_dates?.length;

  return (
    <>
      <Section title="General">
        <DetailRow label="Timezone"           value={p.timezone} />
        <DetailRow label="Grace minutes"      value={p.grace_minutes_default} />
        <DetailRow label="Lates → unpaid day" value={p.late_count_for_unpaid_day != null ? `${p.late_count_for_unpaid_day} lates` : null} />
        <DetailRow label="Weekly off days"    value={Array.isArray(p.weekly_off_days) ? p.weekly_off_days.join(", ") : p.weekly_off_days} />
        <YesNoRow  label="Apply proration"    value={p.apply_proration_default} />
      </Section>

      <Section title="Hour thresholds">
        <DetailRow label="Min hours present"  value={p.min_hours_for_present  != null ? `${p.min_hours_for_present}h`  : null} />
        <DetailRow label="Min hours half day" value={p.min_hours_for_half_day != null ? `${p.min_hours_for_half_day}h` : null} />
        <DetailRow label="Full day hours"     value={p.full_day_hours         != null ? `${p.full_day_hours}h`         : null} />
      </Section>

      <Section title="Behavior rules">
        <DetailRow label="No checkout behavior" value={p.no_checkout_behavior} />
        <DetailRow label="Short hours behavior" value={p.short_hours_behavior} />
        <DetailRow
          label="Short hours payable"
          value={
            p.short_hours_payable === 1   ? "Full (1.0)"  :
            p.short_hours_payable === 0.5 ? "Half (0.5)"  :
            p.short_hours_payable === 0   ? "None (0)"    :
            p.short_hours_payable
          }
        />
      </Section>

      {hasDateOverrides && (
        <Section title="Date overrides">
          {p.holiday_dates?.length > 0 && (
            <DetailRow label="Holiday dates"     value={p.holiday_dates.join(", ")} />
          )}
          {p.working_weekend_dates?.length > 0 && (
            <DetailRow label="Working weekends"  value={p.working_weekend_dates.join(", ")} />
          )}
          {p.forced_working_dates?.length > 0 && (
            <DetailRow label="Forced working"    value={p.forced_working_dates.join(", ")} />
          )}
          {p.manual_off_dates?.length > 0 && (
            <DetailRow label="Manual off dates"  value={p.manual_off_dates.join(", ")} />
          )}
        </Section>
      )}
    </>
  );
}

function OvertimeDetail({ p }) {
  return (
    <Section title="Overtime settings">
      <DetailRow label="Multiplier"            value={p.multiplier            != null ? `${p.multiplier}×`              : null} />
      <DetailRow label="Standard work hrs/day" value={p.standard_work_hours_per_day != null ? `${p.standard_work_hours_per_day}h` : null} />
      <DetailRow label="Min OT per day"        value={p.min_hours_per_day     != null ? `${p.min_hours_per_day}h`        : null} />
      <DetailRow label="Max OT per day"        value={p.max_hours_per_day     != null ? `${p.max_hours_per_day}h`        : null} />
      <DetailRow label="Max OT per month"      value={p.max_hours_per_month   != null ? `${p.max_hours_per_month}h`      : null} />
      <YesNoRow  label="Apply proration"       value={p.apply_proration_default} />
    </Section>
  );
}

function TaxDetail({ p }) {
  return (
    <>
      <Section title="Tax settings">
        <DetailRow label="Tax mode" value={p.tax_mode_default} />
        {p.tax_rate_default != null && (
          <DetailRow
            label={p.tax_mode_default === "percentage" ? "Tax rate" : "Fixed amount"}
            value={p.tax_mode_default === "percentage" ? `${p.tax_rate_default}%` : String(p.tax_rate_default)}
          />
        )}
        <YesNoRow label="Apply proration" value={p.apply_proration_default} />
      </Section>

      {Array.isArray(p.tax_slabs) && p.tax_slabs.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Tax slabs
          </p>
          <div className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Income up to
                  </th>
                  <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {p.tax_slabs.map((slab, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {slab.up_to != null ? `PKR ${slab.up_to.toLocaleString()}` : "∞  (top slab)"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-amber-700 dark:text-amber-400">
                      {slab.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function BonusDetail({ p }) {
  return (
    <>
      <Section title="Bonus settings">
        <DetailRow label="Bonus mode"   value={p.bonus_mode_default} />
        <DetailRow
          label={p.bonus_mode_default === "percentage" ? "Bonus rate" : "Bonus amount"}
          value={
            p.bonus_rate_default != null
              ? (p.bonus_mode_default === "percentage"
                  ? `${p.bonus_rate_default}%`
                  : fmtPKR(p.bonus_rate_default))
              : null
          }
        />
        <YesNoRow label="Apply proration"        value={p.apply_proration_default} />
        <YesNoRow label="Require full attendance" value={p.require_full_attendance} />
      </Section>

      <Section title="Eligibility rules">
        <DetailRow label="Min present days"  value={p.min_present_days     ?? "Not set"} />
        <DetailRow label="Min payable days"  value={p.min_payable_days     ?? "Not set"} />
        <DetailRow label="Max unpaid days"   value={p.max_unpaid_leave_days ?? "Not set"} />
      </Section>
    </>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export default function PolicyDetailModal({ open, policy, type, onClose, onEdit, canManage }) {
  if (!open || !policy) return null;

  const cfg = typeConfig[type] || typeConfig.attendance;
  const { Icon } = cfg;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className={cn("p-2.5 rounded-xl flex-shrink-0", cfg.bg)}>
                <Icon className={cn("w-5 h-5", cfg.color)} />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {policy.name || "Unnamed Policy"}
                </p>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5",
                  cfg.badge
                )}>
                  <Icon className="w-3 h-3" />
                  {cfg.label} Policy
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {canManage && (
                <button
                  onClick={() => { onClose(); onEdit(policy); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {type === "attendance" && <AttendanceDetail p={policy} />}
            {type === "overtime"   && <OvertimeDetail   p={policy} />}
            {type === "tax"        && <TaxDetail        p={policy} />}
            {type === "bonus"      && <BonusDetail      p={policy} />}

            {policy.created_at && (
              <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center mt-2 pb-1">
                Created{" "}
                {new Date(policy.created_at).toLocaleDateString("en-PK", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}