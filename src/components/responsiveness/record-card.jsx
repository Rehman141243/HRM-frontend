"use client";

import { cn } from "@/lib/utils";
import { fmtDate } from "@/components/common/common";
import {
	Clock,
	CalendarDays,
	Timer,
	AlertCircle,
	CheckCircle2,
	MinusCircle,
	Umbrella,
	Sun,
	HelpCircle,
} from "lucide-react";

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
	label: "—",
	icon: HelpCircle,
	pill: "bg-muted text-muted-foreground border-border",
	dot:  "bg-muted-foreground",
};

// ── Status resolver ───────────────────────────────────────────────────────────
// Reads attendance_status (PRESENT/ABSENT), NOT status (OFFLINE/ONLINE)
function resolveStatus(record) {
	const raw =
		record?.attendance_status ??
		record?.attendanceStatus  ??
		record?.evaluated_status  ??
		record?.evaluatedStatus   ??
		record?.final_status      ??
		record?.finalStatus       ??
		null;

	if (!raw) return DEFAULT_STATUS;
	const key = String(raw).toUpperCase().replace(/[-\s]/g, "_");
	return STATUS_CONFIG[key] ?? DEFAULT_STATUS;
}

// ── Late detection ────────────────────────────────────────────────────────────
/**
 * Compute lateness the same way the desktop columns do:
 *
 * Primary:  late_minutes (any value > 0 means late, regardless of is_late flag)
 * Fallback: is_late boolean
 * Fallback: compare check_in_time against shift.start_time directly
 *
 * Returns { isLate: boolean, lateMinutes: number }
 */
function computeLate(record) {
	// 1. late_minutes field — most reliable, used by desktop column
	const lateMinutesRaw =
		record?.late_minutes   ??
		record?.lateMinutes    ??
		record?.minutes_late   ??
		record?.minutesLate    ??
		null;

	if (lateMinutesRaw !== null) {
		const mins = parseFloat(lateMinutesRaw);
		if (!isNaN(mins) && mins > 0) return { isLate: true,  lateMinutes: Math.round(mins) };
		if (!isNaN(mins) && mins <= 0) return { isLate: false, lateMinutes: 0 };
	}

	// 2. is_late boolean flag
	const isLateBool = record?.is_late ?? record?.isLate ?? null;
	if (isLateBool !== null) {
		return { isLate: Boolean(isLateBool), lateMinutes: 0 };
	}

	// 3. Manual computation: check_in vs shift.start_time
	const checkIn    = record?.check_in_time_local ?? record?.check_in_time ?? record?.checkInTime;
	const shiftStart = record?.shift?.start_time   ?? record?.shift?.startTime;

	if (checkIn && shiftStart) {
		// Parse both as "HH:MM" or ISO
		const toMins = (val) => {
			if (!val) return null;
			if (typeof val === "string" && val.includes("T")) {
				const d = new Date(val);
				return isNaN(d) ? null : d.getHours() * 60 + d.getMinutes();
			}
			const parts = String(val).split(":");
			if (parts.length >= 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
			return null;
		};
		const inMins    = toMins(checkIn);
		const startMins = toMins(shiftStart);
		if (inMins !== null && startMins !== null && inMins > startMins) {
			const diff = inMins - startMins;
			return { isLate: true, lateMinutes: diff };
		}
	}

	return { isLate: false, lateMinutes: 0 };
}

// ── Time helpers ──────────────────────────────────────────────────────────────
function fmt(val) {
	if (!val) return "—";
	if (typeof val === "string") {
		if (val.includes("T")) {
			const d = new Date(val);
			if (!isNaN(d)) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		}
		if (/^\d{2}:\d{2}/.test(val)) return val.slice(0, 5);
	}
	return String(val);
}

function fmtHours(h) {
	if (h == null || h === "") return "—";
	const n = parseFloat(h);
	if (isNaN(n)) return "—";
	const hrs  = Math.floor(n);
	const mins = Math.round((n - hrs) * 60);
	if (hrs === 0)  return `${mins}m`;
	if (mins === 0) return `${hrs}h`;
	return `${hrs}h ${mins}m`;
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, highlight }) {
	return (
		<div className="flex items-center justify-between gap-2 py-1.5">
			<div className="flex items-center gap-1.5 min-w-0">
				<Icon className={cn(
					"h-3 w-3 shrink-0",
					highlight ? "text-red-500" : "text-muted-foreground"
				)} />
				<span className="text-[10px] text-muted-foreground truncate">{label}</span>
			</div>
			<span className={cn(
				"text-[10px] font-medium tabular-nums",
				highlight ? "text-red-600 dark:text-red-400" : "text-foreground"
			)}>
				{value}
			</span>
		</div>
	);
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function AttendanceRecordCard({ record }) {
	if (process.env.NODE_ENV === "development") {
		console.log("[AttendanceRecordCard]", record);
	}

	const cfg               = resolveStatus(record);
	const { isLate, lateMinutes } = computeLate(record);
	const overtime          = parseFloat(record?.overtime_hours ?? record?.overtimeHours ?? 0) || 0;
	const regStatus         = record?.regularization_status ?? record?.regularizationStatus ?? null;
	const dateLabel         = record?.date ?? record?.attendance_date ?? record?.attendanceDate;

	const checkIn  = fmt(
		record?.check_in_time_local ?? record?.checkInTimeLocal ??
		record?.check_in_time       ?? record?.checkInTime      ??
		record?.in_time
	);
	const checkOut = fmt(
		record?.check_out_time_local ?? record?.checkOutTimeLocal ??
		record?.check_out_time       ?? record?.checkOutTime      ??
		record?.out_time
	);
	const worked = fmtHours(
		record?.worked_hours   ?? record?.workedHours   ??
		record?.duration_hours ?? record?.durationHours ??
		record?.total_hours
	);

	const shiftName   = record?.shift?.name ?? record?.shift_name ?? "—";
	const shiftStart  = record?.shift?.start_time ?? record?.shift?.startTime;
	const shiftEnd    = record?.shift?.end_time   ?? record?.shift?.endTime;
	const shiftWindow = shiftStart && shiftEnd
		? `${String(shiftStart).slice(0, 5)} – ${String(shiftEnd).slice(0, 5)}`
		: "—";
	const shiftDur    = fmtHours(record?.shift?.duration_hours ?? record?.shift?.durationHours);

	// Attendance label — same logic as desktop column
	const attLabel = isLate
		? lateMinutes > 0 ? `${lateMinutes}m late` : "Late"
		: "On time";

	return (
		<div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">

			{/* ── Header: date + attendance status pill ── */}
			<div className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-2.5 border-b border-border/40">
				<div className="flex items-center gap-2 min-w-0">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50">
						<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
					</div>
					<div className="min-w-0">
						<p className="text-xs font-semibold text-foreground leading-none truncate">
							{dateLabel ? fmtDate(dateLabel) : "—"}
						</p>
						<p className="text-[10px] text-muted-foreground mt-0.5">{shiftName}</p>
					</div>
				</div>

				{/* Attendance status pill */}
				<span className={cn(
					"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
					cfg.pill
				)}>
					<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
					{cfg.label}
				</span>
			</div>

			{/* ── Time row ── */}
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
				<InfoRow icon={Clock} label="Shift window"   value={shiftWindow} />
				<InfoRow icon={Timer} label="Shift duration" value={shiftDur}    />

				{/* Attendance — mirrors desktop "Attendance" column exactly */}
				<InfoRow
					icon={isLate ? AlertCircle : CheckCircle2}
					label="Attendance"
					value={attLabel}
					highlight={isLate}
				/>

				{overtime > 0 && (
					<InfoRow
						icon={Timer}
						label="Overtime"
						value={fmtHours(overtime)}
					/>
				)}
				{regStatus && regStatus !== "NONE" && (
					<InfoRow
						icon={CheckCircle2}
						label="Regularization"
						value={String(regStatus).replace(/_/g, " ")}
					/>
				)}
			</div>
		</div>
	);
}