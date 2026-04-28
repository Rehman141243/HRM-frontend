"use client";

import { cn } from "@/lib/utils";
import { fmtDate } from "@/components/common/common";
import {
    formatLabel,
    formatTime,
    requestStatusMeta,
} from "../../containers/employee/late-regularization/late-regularization-columns";

import {
    FileText,
    Tag,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Hourglass,
    HelpCircle,
    Eye,
    Paperclip,
    User,
    Zap,
    PenLine,
    CalendarDays,
    Clock,
    Hash,
    Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Status icon map — mirrors what the table badge column shows
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_ICONS = {
    pending:   Hourglass,
    approved:  CheckCircle2,
    rejected:  XCircle,
    cancelled: XCircle,
    review:    Hourglass,
};

function resolveStatusIcon(status) {
    if (!status) return HelpCircle;
    const key = String(status).toLowerCase().replace(/[_\s]/g, "");
    return (
        STATUS_ICONS[key] ??
        STATUS_ICONS[String(status).toLowerCase()] ??
        HelpCircle
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe document count — handles all API shapes
// ─────────────────────────────────────────────────────────────────────────────
function getDocCount(request) {
    const raw =
        request?.supporting_documents ??
        request?.documents ??
        request?.attachments ??
        request?.files ??
        null;
    if (Array.isArray(raw)) return raw.length;
    if (typeof raw === "number") return raw;
    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — one labelled detail row exactly like a table cell
// Never renders if value is empty / "--" / null / undefined
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false, highlight = false, multiline = false }) {
    const empty = value === null || value === undefined || value === "" || value === "--";
    if (empty) return null;

    return (
        <div className="flex items-start justify-between gap-3 py-2">
            {/* Label side */}
            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                <Icon
                    className={cn(
                        "h-3 w-3 shrink-0",
                        highlight ? "text-destructive" : "text-muted-foreground"
                    )}
                />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {label}
                </span>
            </div>
            {/* Value side */}
            <span
                className={cn(
                    "text-[11px] font-medium text-right",
                    highlight ? "text-destructive" : "text-foreground",
                    mono && "font-mono text-[10px]",
                    multiline ? "break-words max-w-[60%]" : "truncate max-w-[60%]"
                )}
            >
                {value}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Divider strip — the two-column date row below the header
// ─────────────────────────────────────────────────────────────────────────────
function DateStrip({ submittedAt, reviewedAt }) {
    const cols = [
        { label: "Submitted", value: submittedAt || "—" },
        { label: "Reviewed",  value: reviewedAt  || "—" },
    ];
    return (
        <div className="grid grid-cols-2 divide-x divide-border/40 border-y border-border/40">
            {cols.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center py-2.5 gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
                    <span className="text-[10px] font-semibold text-foreground text-center leading-snug">{value}</span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
//
// Props
//   request  — regularization object from the API
//   onView   — (request) => void — opens the detail Sheet
// ─────────────────────────────────────────────────────────────────────────────
export default function RegularizationRequestCard({ request, onView }) {
    if (!request) return null;

    // ── Status ──────────────────────────────────────────────────────────────
    const statusMeta = requestStatusMeta(request?.status);
    const StatusIcon = resolveStatusIcon(request?.status);

    // ── Type fields — same as table "Type" and "Custom Type" columns ─────────
    const typeLabel       = formatLabel(request?.type) || "—";
    const customTypeLabel = request?.custom_type
        ? String(request.custom_type).trim()
        : null;

    // ── Attendance ID — same as table "Attendance ID" column ─────────────────
    const attendanceId = request?.attendance_id || null;

    // ── Dates — same as table "Submitted" column ─────────────────────────────
    const submittedAt = fmtDate(request?.submitted_at || request?.created_at);
    const reviewedAt  = fmtDate(request?.reviewed_at);

    // ── Reason — same as table "Reason" column ────────────────────────────────
    const reason = request?.reason
        ? String(request.reason).trim()
        : null;

    // ── Admin response fields — same as table "Remarks" / "Applied Effect" ───
    const remarks       = request?.remarks || request?.remark
        ? String(request?.remarks || request?.remark).trim()
        : null;
    const appliedEffect = request?.applied_effect
        ? String(request.applied_effect).trim()
        : null;

    // ── Reviewed by — same as table "Reviewed By" column ─────────────────────
    const reviewedBy =
        request?.reviewed_by?.name ||
        (typeof request?.reviewed_by === "string" ? request.reviewed_by : null) ||
        null;

    // ── Documents ─────────────────────────────────────────────────────────────
    const docCount = getDocCount(request);

    return (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md active:shadow-sm">

            {/* ══ HEADER: type label + status pill ══ */}
            <div className="flex items-start justify-between gap-2 px-3.5 pt-3 pb-2.5">
                {/* Left: icon + type */}
                <div className="flex items-start gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/50 mt-0.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight">
                            {typeLabel}
                        </p>
                        {customTypeLabel && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {customTypeLabel}
                            </p>
                        )}
                        {attendanceId && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                {attendanceId}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: status pill — uses the EXACT same className as the table badge */}
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 mt-0.5",
                        statusMeta.className
                    )}
                >
                    <StatusIcon className="h-2.5 w-2.5 shrink-0" />
                    {statusMeta.label}
                </span>
            </div>

            {/* ══ DATE STRIP: submitted + reviewed ══ */}
            <DateStrip submittedAt={submittedAt} reviewedAt={reviewedAt} />

            {/* ══ DETAIL ROWS — every field the table shows ══ */}
            <div className="px-3.5 divide-y divide-border/30">

                {/* Attendance ID (also shown as standalone row for clarity) */}
                <InfoRow
                    icon={Hash}
                    label="Attendance ID"
                    value={attendanceId}
                    mono
                />

                {/* Type (full label) */}
                <InfoRow
                    icon={Type}
                    label="Type"
                    value={typeLabel !== "—" ? typeLabel : null}
                />

                {/* Custom Type */}
                {customTypeLabel && (
                    <InfoRow
                        icon={Tag}
                        label="Custom Type"
                        value={customTypeLabel}
                    />
                )}

                {/* Reason — multiline because it can be long */}
                <InfoRow
                    icon={MessageSquare}
                    label="Reason"
                    value={reason}
                    multiline
                />

                {/* Remarks — admin response field */}
                <InfoRow
                    icon={PenLine}
                    label="Remarks"
                    value={remarks}
                    multiline
                />

                {/* Applied Effect */}
                <InfoRow
                    icon={Zap}
                    label="Applied Effect"
                    value={appliedEffect}
                />

                {/* Reviewed By */}
                <InfoRow
                    icon={User}
                    label="Reviewed By"
                    value={reviewedBy}
                />

                {/* Supporting documents count */}
                {docCount > 0 && (
                    <InfoRow
                        icon={Paperclip}
                        label="Attachments"
                        value={`${docCount} file${docCount !== 1 ? "s" : ""}`}
                    />
                )}
            </div>

            {/* ══ FOOTER: View Details button ══ */}
            <div className="px-3.5 pb-3 pt-2.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={() => onView?.(request)}
                >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                </Button>
            </div>
        </div>
    );
}