"use client";

import { cn } from "@/lib/utils";
import { fmtDate } from "@/components/common/common";
import { Clock, CalendarDays, Timer, AlertCircle, CheckCircle2, MinusCircle, Umbrella, Sun } from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PRESENT: {
    label: "Present",
    icon: CheckCircle2,
    pill: "bg-[#EAF3DE] text-[#27500A] border-[#3B6D11] dark:bg-[#27500A] dark:text-[#C0DD97] dark:border-[#639922]",
    dot:  "bg-[#639922] dark:bg-[#97C459]",
  },
  ABSENT: {
    label: "Absent",
    icon: AlertCircle,
    pill: "bg-[#FCEBEB] text-[#791F1F] border-[#A32D2D] dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:border-[#E24B4A]",
    dot:  "bg-[#E24B4A] dark:bg-[#F09595]",
  },
  HALF_DAY: {
    label: "Half Day",
    icon: MinusCircle,
    pill: "bg-[#FAEEDA] text-[#633806] border-[#854F0B] dark:bg-[#633806] dark:text-[#FAC775] dark:border-[#BA7517]",
    dot:  "bg-[#BA7517] dark:bg-[#EF9F27]",
  },
  ON_LEAVE: {
    label: "On Leave",
    icon: Umbrella,
    pill: "bg-[#EEEDFE] text-[#3C3489] border-[#534AB7] dark:bg-[#3C3489] dark:text-[#CECBF6] dark:border-[#7F77DD]",
    dot:  "bg-[#7F77DD] dark:bg-[#AFA9EC]",
  },
  ON_HOLIDAY: {
    label: "Holiday",
    icon: Sun,
    pill: "bg-[#E6F1FB] text-[#0C447C] border-[#185FA5] dark:bg-[#0C447C] dark:text-[#B5D4F4] dark:border-[#378ADD]",
    dot:  "bg-[#378ADD] dark:bg-[#85B7EB]",
  },
};

const DEFAULT_STATUS = {
  label: "Unknown",
  icon: MinusCircle,
  pill: "bg-muted text-muted-foreground border-border",
  dot:  "bg-muted-foreground",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(val) {
  if (!val) return "—";
  // "HH:MM:SS" or ISO → "HH:MM"
  if (typeof val === "string") {
    if (val.includes("T")) {
      const d = new Date(val);
      if (!isNaN(d)) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return val.slice(0, 5);
  }
  return String(val);
}

function fmtHours(h) {
  if (h == null || h === "") return "—";
  const n = parseFloat(h);
  if (isNaN(n)) return "—";
  const hrs = Math.floor(n);
  const mins = Math.round((n - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// ── Row helper for the info grid ──────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-2 py-1.5", className)}>
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground truncate">{label}</span>
      </div>
      <span className="text-[10px] font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
/**
 * AttendanceRecordCard
 *
 * Props mirror a single record row from /attendance/reports/me:
 *   record: {
 *     date, status, check_in_time, check_out_time,
 *     check_in_time_local, check_out_time_local,
 *     worked_hours, duration_hours,
 *     shift: { name, start_time, end_time, duration_hours },
 *     is_late, late_minutes, overtime_hours,
 *     regularization_status,
 *   }
 */
export default function AttendanceRecordCard({ record }) {
  const cfg = STATUS_CONFIG[record?.status] ?? DEFAULT_STATUS;
  const StatusIcon = cfg.icon;

  const checkIn  = fmt(record?.check_in_time_local  ?? record?.check_in_time);
  const checkOut = fmt(record?.check_out_time_local ?? record?.check_out_time);
  const worked   = fmtHours(record?.worked_hours    ?? record?.duration_hours);
  const shiftDur = fmtHours(record?.shift?.duration_hours);
  const shiftName = record?.shift?.name ?? "—";
  const shiftWindow =
    record?.shift?.start_time && record?.shift?.end_time
      ? `${record.shift.start_time.slice(0, 5)} – ${record.shift.end_time.slice(0, 5)}`
      : "—";

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">

      {/* ── Header row: date + status pill ── */}
      <div className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-2.5 border-b border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground leading-none truncate">
              {record?.date ? fmtDate(record.date) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{shiftName}</p>
          </div>
        </div>

        {/* Status pill */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
            cfg.pill
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* ── Time row: check-in / check-out / worked ── */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
        {[
          { label: "Check In",  value: checkIn  },
          { label: "Check Out", value: checkOut },
          { label: "Worked",    value: worked   },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-2.5 px-1">
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Detail rows ── */}
      <div className="px-3.5 py-1 divide-y divide-border/30">
        <InfoRow icon={Clock}       label="Shift window" value={shiftWindow} />
        <InfoRow icon={Timer}       label="Shift duration" value={shiftDur} />
        {record?.is_late && (
          <InfoRow
            icon={AlertCircle}
            label="Late by"
            value={record.late_minutes ? `${record.late_minutes} min` : "Yes"}
            className="text-amber-600 dark:text-amber-400"
          />
        )}
        {record?.overtime_hours > 0 && (
          <InfoRow
            icon={Timer}
            label="Overtime"
            value={fmtHours(record.overtime_hours)}
          />
        )}
        {record?.regularization_status && record.regularization_status !== "NONE" && (
          <InfoRow
            icon={CheckCircle2}
            label="Regularization"
            value={record.regularization_status.replace(/_/g, " ")}
          />
        )}
      </div>
    </div>
  );
}