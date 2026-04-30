'use client'

import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

export const fmtDate = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const fmtTime = (v) => {
  if (!v) return "—";
  return String(v).substring(0, 5);
};

export const fmtHours = (v) => (v != null ? `${Number(v).toFixed(1)}h` : "—");

const StatusBadge = ({ value, colorMap }) => {
  const colors = colorMap?.[value] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border", colors)}>
      {value ?? "—"}
    </span>
  );
};

const attendanceColors = {
  present:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent:    "bg-red-50 text-red-700 border-red-200",
  on_leave:  "bg-blue-50 text-blue-700 border-blue-200",
  on_holiday:"bg-purple-50 text-purple-700 border-purple-200",
  half_day:  "bg-amber-50 text-amber-700 border-amber-200",
  late:      "bg-orange-50 text-orange-700 border-orange-200",
};

const leaveColors = {
  pending:   "bg-orange-50 text-orange-700 border-orange-200",
  approved:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:  "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const empCell = (row) => {
  const e = row.original.employee;
  if (!e) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div>
      <p className="text-sm font-medium">{`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()}</p>
      {(e.designation || e.department) && (
        <p className="text-xs text-muted-foreground">{[e.designation, e.department].filter(Boolean).join(" · ")}</p>
      )}
    </div>
  );
};

// ─── Attendance Daily ────────────────────────────────────────────────────────

export const attendanceDailyColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => empCell(row),
  },
  {
    accessorKey: "shift",
    header: "Shift",
    cell: ({ row }) => {
      const s = row.original.shift;
      return s ? (
        <div>
          <p className="text-sm">{s.name}</p>
          <p className="text-xs text-muted-foreground">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</p>
        </div>
      ) : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={attendanceColors} />,
  },
  {
    accessorKey: "effective_status",
    header: "Effective",
    cell: ({ row }) => <StatusBadge value={row.original.effective_status} colorMap={attendanceColors} />,
  },
  {
    accessorKey: "check_in_time_local",
    header: "Check In",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.check_in_time_local)}</span>,
  },
  {
    accessorKey: "check_out_time_local",
    header: "Check Out",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.check_out_time_local)}</span>,
  },
  {
    accessorKey: "worked_hours",
    header: "Worked",
    cell: ({ row }) => <span className="text-sm">{fmtHours(row.original.worked_hours)}</span>,
  },
  {
    accessorKey: "shift_hours",
    header: "Shift Hrs",
    cell: ({ row }) => <span className="text-sm">{fmtHours(row.original.shift_hours)}</span>,
  },
  {
    accessorKey: "regularization_applied",
    header: "Regularized",
    cell: ({ row }) => (
      <span className={cn("text-xs font-medium", row.original.regularization_applied ? "text-emerald-600" : "text-muted-foreground")}>
        {row.original.regularization_applied ? "Yes" : "No"}
      </span>
    ),
  },
];

// ─── Attendance Weekly ───────────────────────────────────────────────────────

export const attendanceWeeklyColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => empCell(row),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.date)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={attendanceColors} />,
  },
  {
    accessorKey: "effective_status",
    header: "Effective",
    cell: ({ row }) => <StatusBadge value={row.original.effective_status} colorMap={attendanceColors} />,
  },
  {
    accessorKey: "check_in_time_local",
    header: "Check In",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.check_in_time_local)}</span>,
  },
  {
    accessorKey: "check_out_time_local",
    header: "Check Out",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.check_out_time_local)}</span>,
  },
  {
    accessorKey: "worked_hours",
    header: "Worked",
    cell: ({ row }) => <span className="text-sm">{fmtHours(row.original.worked_hours)}</span>,
  },
];

// ─── Attendance Monthly ──────────────────────────────────────────────────────

export const attendanceMonthlyColumns = attendanceDailyColumns;

// ─── Attendance Summary ──────────────────────────────────────────────────────

export const attendanceSummaryColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div>
          <p className="text-sm font-medium">{r.name ?? "—"}</p>
          {(r.designation || r.department) && (
            <p className="text-xs text-muted-foreground">{[r.designation, r.department].filter(Boolean).join(" · ")}</p>
          )}
        </div>
      );
    },
  },
  { accessorKey: "total_days",   header: "Total Days",   cell: ({ getValue }) => <span className="text-sm">{getValue() ?? "—"}</span> },
  { accessorKey: "present_days", header: "Present",      cell: ({ getValue }) => <span className="text-sm text-emerald-600 font-medium">{getValue() ?? "—"}</span> },
  { accessorKey: "absent_days",  header: "Absent",       cell: ({ getValue }) => <span className="text-sm text-red-600 font-medium">{getValue() ?? "—"}</span> },
  { accessorKey: "leave_days",   header: "Leave",        cell: ({ getValue }) => <span className="text-sm text-blue-600 font-medium">{getValue() ?? "—"}</span> },
  { accessorKey: "total_hours",  header: "Total Hours",  cell: ({ getValue }) => <span className="text-sm">{fmtHours(getValue())}</span> },
];

// ─── Leaves ──────────────────────────────────────────────────────────────────

export const leavesColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => empCell(row),
  },
  {
    accessorKey: "leave_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-xs capitalize">{(row.original.leave_type ?? "—").replace(/_/g, " ")}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.start_date)}</span>,
  },
  {
    accessorKey: "end_date",
    header: "End",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.end_date)}</span>,
  },
  {
    accessorKey: "total_days",
    header: "Days",
    cell: ({ getValue }) => <span className="text-sm">{getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "manager_status",
    header: "Manager",
    cell: ({ row }) => <StatusBadge value={row.original.manager_status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "hr_status",
    header: "HR",
    cell: ({ row }) => <StatusBadge value={row.original.hr_status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground max-w-[160px] truncate block">{getValue() ?? "—"}</span>,
  },
];

// ─── Overtime ────────────────────────────────────────────────────────────────

export const overtimeColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => empCell(row),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.date)}</span>,
  },
  {
    accessorKey: "start_time",
    header: "Start",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.start_time)}</span>,
  },
  {
    accessorKey: "end_time",
    header: "End",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.end_time)}</span>,
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ getValue }) => <span className="text-sm font-medium">{fmtHours(getValue())}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "manager_status",
    header: "Manager",
    cell: ({ row }) => <StatusBadge value={row.original.manager_status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "hr_status",
    header: "HR",
    cell: ({ row }) => <StatusBadge value={row.original.hr_status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() ?? "—"}</span>,
  },
];

// ─── Shifts ──────────────────────────────────────────────────────────────────

export const shiftsColumns = [
  {
    accessorKey: "name",
    header: "Shift Name",
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue()}</span>,
  },
  {
    accessorKey: "start_time",
    header: "Start",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.start_time)}</span>,
  },
  {
    accessorKey: "end_time",
    header: "End",
    cell: ({ row }) => <span className="text-xs">{fmtTime(row.original.end_time)}</span>,
  },
  {
    accessorKey: "duration_hours",
    header: "Duration",
    cell: ({ getValue }) => <span className="text-sm">{fmtHours(getValue())}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ getValue }) => (
      <span className={cn("text-xs font-medium", getValue() ? "text-emerald-600" : "text-muted-foreground")}>
        {getValue() ? "Active" : "Inactive"}
      </span>
    ),
  },
];

// ─── Assignments ─────────────────────────────────────────────────────────────

export const assignmentsColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const e = row.original.employee;
      return e ? <span className="text-sm font-medium">{`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()}</span>
               : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    id: "shift",
    header: "Shift",
    cell: ({ row }) => {
      const s = row.original.shift;
      return s ? (
        <div>
          <p className="text-sm">{s.name}</p>
          <p className="text-xs text-muted-foreground">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</p>
        </div>
      ) : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    accessorKey: "assigned_from",
    header: "From",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.assigned_from)}</span>,
  },
  {
    accessorKey: "assigned_to",
    header: "To",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.assigned_to)}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ getValue }) => (
      <span className={cn("text-xs font-medium", getValue() ? "text-emerald-600" : "text-muted-foreground")}>
        {getValue() ? "Active" : "Inactive"}
      </span>
    ),
  },
];

// ─── Shift Requests ──────────────────────────────────────────────────────────

export const shiftRequestsColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const e = row.original.employee;
      return e ? <span className="text-sm font-medium">{`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()}</span>
               : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    accessorKey: "request_date",
    header: "Request Date",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.request_date)}</span>,
  },
  {
    id: "current_shift",
    header: "Current Shift",
    cell: ({ row }) => {
      const s = row.original.current_shift;
      return s ? <span className="text-sm">{s.name}</span> : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    id: "requested_shift",
    header: "Requested Shift",
    cell: ({ row }) => {
      const s = row.original.requested_shift;
      return s ? <span className="text-sm">{s.name}</span> : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() ?? "—"}</span>,
  },
];

// ─── Late Regularization ─────────────────────────────────────────────────────

export const lateRegularizationColumns = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => empCell(row),
  },
  {
    accessorKey: "incident_date",
    header: "Date",
    cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.incident_date)}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const v = row.original.type ?? row.original.custom_type;
      return <span className="text-xs capitalize">{v != null ? String(v).replace(/_/g, " ") : "—"}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} colorMap={leaveColors} />,
  },
  {
    accessorKey: "applied_effect",
    header: "Effect",
    cell: ({ getValue }) => {
      const v = getValue();
      return <span className="text-xs capitalize">{v != null ? String(v).replace(/_/g, " ") : "—"}</span>;
    },
  },
  {
    id: "attendance",
    header: "Attendance",
    cell: ({ row }) => {
      const a = row.original.attendance;
      return a ? (
        <div>
          <p className="text-xs">{fmtDate(a.date)}</p>
          <p className="text-xs text-muted-foreground">{fmtTime(a.check_in_time)} – {fmtTime(a.check_out_time)}</p>
        </div>
      ) : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    id: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const r = row.original.reviewer;
      return r ? <span className="text-sm">{`${r.first_name ?? ""} ${r.last_name ?? ""}`.trim()}</span>
               : <span className="text-muted-foreground text-xs">—</span>;
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground max-w-[160px] truncate block">{getValue() ?? "—"}</span>,
  },
];
