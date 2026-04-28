import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/components/common/common";

const formatTime = (value) => {
	if (!value) return "—";

	try {
		const date = new Date(`1970-01-01T${value}`);
		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return value;
	}
};

const getStatusColor = (status) => {
	const statusMap = {
		present: { label: "Present", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
		half_day: { label: "Half Day", className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400" },
		absent: { label: "Absent", className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
		on_leave: { label: "On Leave", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
		on_holiday: { label: "Holiday", className: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400" },
	};

	return statusMap[status] || { label: status, className: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400" };
};

const getLateIndicator = (evaluation) => {
	if (evaluation?.is_late) {
		return <span className="text-xs font-medium text-red-600 dark:text-red-400">{evaluation.late_minutes}m late</span>;
	}
	return <span className="text-xs text-muted-foreground">On time</span>;
};

export const attendanceReportColumns = [
	{ accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-sm font-medium">{fmtDate(row.original.date)}</span> },
	{
		accessorKey: "shift_name",
		header: "Shift",
		cell: ({ row }) => (
			<div className="space-y-1">
				<div className="text-sm font-medium">{row.original.shift?.name ?? "—"}</div>
				<div className="text-xs text-muted-foreground">
					{row.original.shift?.start_time && row.original.shift?.end_time ? `${formatTime(row.original.shift.start_time)} - ${formatTime(row.original.shift.end_time)}` : "—"}
				</div>
			</div>
		),
	},
	{
		accessorKey: "check_in_time_local",
		header: "Check In",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.check_in_time_local ? formatTime(row.original.check_in_time_local.split("T")[1]) : "—"}</span>,
	},
	{
		accessorKey: "check_out_time_local",
		header: "Check Out",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.check_out_time_local ? formatTime(row.original.check_out_time_local.split("T")[1]) : "—"}</span>,
	},
	{ accessorKey: "worked_hours", header: "Worked / Shift", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.worked_hours != null ? `${row.original.worked_hours}h` : "—"} / {row.original.shift_hours ?? "—"}h</span> },
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const evaluation = row.original.evaluation;
			const status = getStatusColor(evaluation?.evaluated_status);
			return (
				<Badge variant="outline" className={status.className}>
					{status.label}
				</Badge>
			);
		},
	},
	{ accessorKey: "late", header: "Attendance", cell: ({ row }) => getLateIndicator(row.original.evaluation) },
];
