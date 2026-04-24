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

const getShiftStatus = (shift) => {
	if (shift?.is_active) {
		return {
			label: "Active",
			className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		};
	}

	return {
		label: "History",
		className: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400",
	};
};

export const shiftColumns = [
	{
		accessorKey: "shift_name",
		header: "Shift",
		cell: ({ row }) => {
			const shiftAssignment = row.original;
			return (
				<div className="space-y-1">
					<div className="font-medium">{shiftAssignment.shift?.name ?? "—"}</div>
					<div className="text-xs text-muted-foreground">
						{shiftAssignment.employee
							? `${shiftAssignment.employee.first_name ?? ""} ${shiftAssignment.employee.last_name ?? ""}`.trim()
							: "Assigned shift"}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "assigned_from",
		header: "Assigned From",
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{fmtDate(row.original.assigned_from)}</span>,
	},
	{
		accessorKey: "assigned_to",
		header: "Assigned To",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.assigned_to ? fmtDate(row.original.assigned_to) : "Ongoing"}
			</span>
		),
	},
	{
		accessorKey: "shift_time",
		header: "Time",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{formatTime(row.original.shift?.start_time)} - {formatTime(row.original.shift?.end_time)}
			</span>
		),
	},
	{
		accessorKey: "duration_hours",
		header: "Duration",
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.shift?.duration_hours != null ? `${row.original.shift.duration_hours}h` : "—"}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = getShiftStatus(row.original);
			return (
				<Badge variant="outline" className={status.className}>
					{status.label}
				</Badge>
			);
		},
	},
];
