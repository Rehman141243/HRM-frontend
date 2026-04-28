import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/components/common/common";
import { Eye, Plus } from "lucide-react";

const formatTime = (value) => {
	if (!value) return "--";

	try {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		}

		const fallback = String(value).split("T")[1] || String(value);
		return fallback.slice(0, 5);
	} catch {
		return String(value);
	}
};

const formatLabel = (value) => {
	if (!value) return "--";
	return String(value).replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
};

const getAttendanceStatusMeta = (record) => {
	const raw = record?.evaluation?.evaluated_status || record?.status || record?.punch_status || "unknown";
	const key = String(raw).toLowerCase();

	const map = {
		present: { label: "Present", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
		half_day: { label: "Half Day", className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400" },
		absent: { label: "Absent", className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
		on_leave: { label: "On Leave", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
		on_holiday: { label: "Holiday", className: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400" },
		checked_in: { label: "Checked In", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
		checked_out: { label: "Checked Out", className: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400" },
		not_checked_in: { label: "Not Checked In", className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" },
		unknown: { label: "Unknown", className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" },
	};

	return map[key] || { label: formatLabel(raw), className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" };
};

const getRequestStatusMeta = (status) => {
	const key = String(status || "pending").toLowerCase();
	const map = {
		pending: { label: "Pending", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
		approved: { label: "Approved", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
		rejected: { label: "Rejected", className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
		cancelled: { label: "Cancelled", className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" },
	};

	return map[key] || { label: formatLabel(status), className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" };
};

export const regularizationTypes = [
	{ value: "late_arrival", label: "Late Arrival" },
	{ value: "missed_checkin", label: "Missed Check-in" },
	{ value: "early_checkout", label: "Early Checkout" },
	{ value: "short_hours", label: "Short Hours" },
	{ value: "shift_mismatch", label: "Shift Mismatch" },
	{ value: "system_error", label: "System Error" },
	{ value: "transport_issue", label: "Transport Issue" },
	{ value: "weather_issue", label: "Weather Issue" },
	{ value: "medical_reason", label: "Medical Reason" },
	{ value: "official_work", label: "Official Work" },
	{ value: "emergency", label: "Emergency" },
	{ value: "other", label: "Other" },
];

export const requestStatusOptions = [
	{ value: "all", label: "All Statuses" },
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

export const attendanceColumns = ({ onRaiseRegularization }) => [
	{ accessorKey: "attendance_id", header: "Attendance ID", cell: ({ row }) => (<div className="space-y-1"><p className="text-sm font-medium leading-none">{row.original.attendance_id || row.original.id || "--"}</p><p className="text-xs text-muted-foreground">Own attendance record</p></div>) },
	{ accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-sm font-medium">{fmtDate(row.original.date || row.original.attendance_date)}</span> },
	{ accessorKey: "status", header: "Status", cell: ({ row }) => { const meta = getAttendanceStatusMeta(row.original); return <Badge variant="outline" className={`text-xs font-medium ${meta.className}`}>{meta.label}</Badge>; } },
	{ accessorKey: "check_in_time", header: "Check In", cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatTime(row.original.check_in_time_local || row.original.check_in_time)}</span> },
	{ accessorKey: "check_out_time", header: "Check Out", cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatTime(row.original.check_out_time_local || row.original.check_out_time)}</span> },
	{ id: "actions", header: "", cell: ({ row }) => { const attendanceId = row.original.attendance_id || row.original.id || ""; return <div className="flex justify-end"><Button type="button" size="sm" className="gap-2" disabled={!attendanceId} onClick={() => onRaiseRegularization?.(row.original)}><Plus className="h-4 w-4" />Raise Regularization</Button></div>; } },
];

export const regularizationColumns = ({ onViewRequest }) => [
	{ accessorKey: "attendance_id", header: "Attendance ID", cell: ({ row }) => <span className="text-sm font-medium">{row.original.attendance_id || "--"}</span> },
	{ accessorKey: "type", header: "Type", cell: ({ row }) => { const typeLabel = formatLabel(row.original.type); const customType = row.original.custom_type?.trim(); return <div className="space-y-1"><p className="text-sm font-medium">{typeLabel}</p>{customType && <p className="text-xs text-muted-foreground">Custom: {customType}</p>}</div>; } },
	{ accessorKey: "reason", header: "Reason", cell: ({ row }) => <span className="line-clamp-2 text-sm text-muted-foreground">{row.original.reason || "--"}</span> },
	{ accessorKey: "status", header: "Status", cell: ({ row }) => { const meta = getRequestStatusMeta(row.original.status); return <Badge variant="outline" className={`text-xs font-medium ${meta.className}`}>{meta.label}</Badge>; } },
	{ accessorKey: "submitted_at", header: "Submitted", cell: ({ row }) => <span className="text-sm text-muted-foreground">{fmtDate(row.original.submitted_at || row.original.created_at)}</span> },
	{ id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => onViewRequest?.(row.original)}><Eye className="h-4 w-4" />Details</Button></div> },
];

export const requestStatusMeta = getRequestStatusMeta;
export const attendanceStatusMeta = getAttendanceStatusMeta;
export { formatLabel, formatTime };
