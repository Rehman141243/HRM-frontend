import { fmtDate } from "@/components/common/common";
import { formatLabel, requestStatusMeta } from "./late-regularization-columns";

/* ─── List helpers ───────────────────────────────────────────────────────── */

export const normalizeList = (value) => (Array.isArray(value) ? value : []);

export const extractCollection = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    const preferredKeys = [
        "records", "items", "requests", "regularizations",
        "late_regularizations", "lateRegularizations", "results", "data",
    ];
    for (const key of preferredKeys) {
        if (Array.isArray(payload[key])) return payload[key];
    }
    for (const value of Object.values(payload)) {
        if (Array.isArray(value)) return value;
    }
    return [];
};

export const extractPagination = (payload, fallbackTotal = 0) => {
    if (!payload || typeof payload !== "object") return { total: fallbackTotal, pages: 1 };
    const pagination =
        payload.pagination ||
        payload.meta?.pagination ||
        payload.pageInfo ||
        payload.page_info ||
        payload.paging;
    if (pagination && typeof pagination === "object") return pagination;
    return { total: fallbackTotal, pages: 1 };
};

/* ─── Record ID helper ───────────────────────────────────────────────────── */

export const toAttendanceId = (record) =>
    record?.attendance_id || record?.id || record?._id || "";

/* ─── Error helpers ──────────────────────────────────────────────────────── */

export const extractApiMessage = (error, fallback) => {
    const data = error?.response?.data;
    return (
        data?.message ||
        data?.error?.message ||
        data?.error ||
        data?.detail ||
        (typeof data === "string" ? data : null) ||
        error?.message ||
        fallback
    );
};

export const extractFieldErrors = (error) => {
    const data = error?.response?.data;
    const source =
        data?.errors ||
        data?.validationErrors ||
        data?.fields ||
        data?.error?.errors ||
        data?.error?.fields;
    const errors = {};
    if (!source) return errors;
    if (Array.isArray(source)) {
        source.forEach((item) => {
            const key = item?.field || item?.path || item?.name;
            const message = item?.message || item?.error || item?.detail;
            if (key && message) errors[key] = message;
        });
        return errors;
    }
    if (typeof source === "object") {
        Object.entries(source).forEach(([key, value]) => {
            if (Array.isArray(value)) { errors[key] = value[0]; return; }
            if (value && typeof value === "object") {
                errors[key] = value.message || value.detail || JSON.stringify(value);
                return;
            }
            errors[key] = String(value);
        });
    }
    return errors;
};

/* ─── Request detail helpers ─────────────────────────────────────────────── */

export const formatDocuments = (request) =>
    normalizeList(
        request?.supporting_documents ||
        request?.documents ||
        request?.attachments ||
        request?.files ||
        []
    );

export const buildRequestSummary = (request) => [
    { label: "Attendance ID", value: request?.attendance_id || "--" },
    { label: "Type", value: formatLabel(request?.type) },
    { label: "Custom Type", value: request?.custom_type || "--" },
    { label: "Reason", value: request?.reason || "--" },
    { label: "Status", value: requestStatusMeta(request?.status).label },
    { label: "Submitted", value: fmtDate(request?.submitted_at || request?.created_at) },
    { label: "Remarks", value: request?.remarks || request?.remark || "--" },
    { label: "Applied Effect", value: request?.applied_effect || "--" },
    { label: "Reviewed By", value: request?.reviewed_by?.name || request?.reviewed_by || "--" },
    { label: "Reviewed At", value: fmtDate(request?.reviewed_at) },
];

/* ─── Date range helper ──────────────────────────────────────────────────── */

export const getDefaultAttendanceRange = () => {
    const endDate = new Date().toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { startDate: start.toISOString().split("T")[0], endDate };
};
