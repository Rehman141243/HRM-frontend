"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, ClipboardList, FileText, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { fmtDate, todayDateStr } from "@/components/common/common";
import {
    attendanceColumns,
    attendanceStatusMeta,
    formatLabel,
    formatTime,
    regularizationColumns,
    regularizationTypes,
    requestStatusMeta,
    requestStatusOptions,
} from "./late-regularization-columns";

const EMPTY_FORM = {
    attendance_id: "",
    type: "",
    custom_type: "",
    reason: "",
    documents: [],
};

const REGULARIZATION_FILTERS = [{ value: "all", label: "All Types" }, ...regularizationTypes];

const getDefaultAttendanceRange = () => {
    const endDate = todayDateStr();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split("T")[0],
        endDate,
    };
};

const normalizeList = (value) => (Array.isArray(value) ? value : []);

const extractCollection = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const preferredKeys = [
        "records",
        "items",
        "requests",
        "regularizations",
        "late_regularizations",
        "lateRegularizations",
        "results",
        "data",
    ];

    for (const key of preferredKeys) {
        if (Array.isArray(payload[key])) return payload[key];
    }

    for (const value of Object.values(payload)) {
        if (Array.isArray(value)) return value;
    }

    return [];
};

const extractPagination = (payload, fallbackTotal = 0) => {
    if (!payload || typeof payload !== "object") {
        return { total: fallbackTotal, pages: 1 };
    }

    const pagination = payload.pagination || payload.meta?.pagination || payload.pageInfo || payload.page_info || payload.paging;
    if (pagination && typeof pagination === "object") {
        return pagination;
    }

    return { total: fallbackTotal, pages: 1 };
};

const toAttendanceId = (record) => record?.attendance_id || record?.id || record?._id || "";

const extractApiMessage = (error, fallback) => {
    const data = error?.response?.data;
    return data?.message || data?.error?.message || data?.error || data?.detail || (typeof data === "string" ? data : null) || error?.message || fallback;
};

const extractFieldErrors = (error) => {
    const data = error?.response?.data;
    const source = data?.errors || data?.validationErrors || data?.fields || data?.error?.errors || data?.error?.fields;
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
            if (Array.isArray(value)) {
                errors[key] = value[0];
                return;
            }

            if (value && typeof value === "object") {
                errors[key] = value.message || value.detail || JSON.stringify(value);
                return;
            }

            errors[key] = String(value);
        });
    }

    return errors;
};

const formatDocuments = (request) => normalizeList(request?.supporting_documents || request?.documents || request?.attachments || request?.files || []);

const buildRequestSummary = (request) => [
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

export default function LateRegularization() {
    const defaultAttendanceRange = useMemo(() => getDefaultAttendanceRange(), []);

    const [innerTab, setInnerTab] = useState("submit");

    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendancePagination, setAttendancePagination] = useState({ total: 0, pages: 1 });
    const [attendancePageIndex, setAttendancePageIndex] = useState(0);
    const [attendancePageSize, setAttendancePageSize] = useState(10);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceError, setAttendanceError] = useState(null);
    const [attendanceSearch, setAttendanceSearch] = useState("");
    const [attendanceStartDate, setAttendanceStartDate] = useState(defaultAttendanceRange.startDate);
    const [attendanceEndDate, setAttendanceEndDate] = useState(defaultAttendanceRange.endDate);

    const [regularizations, setRegularizations] = useState([]);
    const [regularizationPagination, setRegularizationPagination] = useState({ total: 0, pages: 1 });
    const [regularizationPageIndex, setRegularizationPageIndex] = useState(0);
    const [regularizationPageSize, setRegularizationPageSize] = useState(10);
    const [regularizationLoading, setRegularizationLoading] = useState(true);
    const [regularizationError, setRegularizationError] = useState(null);
    const [regularizationSearch, setRegularizationSearch] = useState("");
    const [regularizationStatus, setRegularizationStatus] = useState("all");
    const [regularizationType, setRegularizationType] = useState("all");
    const [regularizationStartDate, setRegularizationStartDate] = useState("");
    const [regularizationEndDate, setRegularizationEndDate] = useState("");

    const [raiseDialogOpen, setRaiseDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    const attendanceTotal = attendancePagination?.total ?? attendanceRecords.length;
    const regularizationTotal = regularizationPagination?.total ?? regularizations.length;

    const filteredAttendance = useMemo(() => {
        const term = attendanceSearch.trim().toLowerCase();
        if (!term) return attendanceRecords;

        return attendanceRecords.filter((record) => {
            const values = [
                toAttendanceId(record),
                fmtDate(record?.date || record?.attendance_date),
                attendanceStatusMeta(record).label,
                formatTime(record?.check_in_time_local || record?.check_in_time),
                formatTime(record?.check_out_time_local || record?.check_out_time),
            ];
            return values.some((value) => String(value || "").toLowerCase().includes(term));
        });
    }, [attendanceRecords, attendanceSearch]);

    const filteredRegularizations = useMemo(() => {
        const term = regularizationSearch.trim().toLowerCase();
        if (!term) return regularizations;

        return regularizations.filter((request) => {
            const values = [request?.attendance_id, formatLabel(request?.type), request?.custom_type, request?.reason, requestStatusMeta(request?.status).label, request?.remarks, request?.applied_effect];
            return values.some((value) => String(value || "").toLowerCase().includes(term));
        });
    }, [regularizationSearch, regularizations]);

    const fetchAttendance = useCallback(
        async (pageNumber = attendancePageIndex + 1, size = attendancePageSize) => {
            setAttendanceLoading(true);
            setAttendanceError(null);

            try {
                const params = { page: pageNumber, limit: size };
                if (attendanceStartDate) params.start_date = attendanceStartDate;
                if (attendanceEndDate) params.end_date = attendanceEndDate;

                const response = await axiosInstance.get("/attendance/reports/me", { params });
                const data = response.data?.data ?? {};
                const records = normalizeList(data.records);

                setAttendanceRecords(records);
                setAttendancePagination(data.pagination ?? { total: records.length, pages: 1 });
            } catch (error) {
                setAttendanceError(extractApiMessage(error, "Failed to load attendance records. Please try again."));
                setAttendanceRecords([]);
                setAttendancePagination({ total: 0, pages: 1 });
            } finally {
                setAttendanceLoading(false);
            }
        },
        [attendanceEndDate, attendancePageIndex, attendancePageSize, attendanceStartDate]
    );

    const fetchRegularizations = useCallback(
        async (pageNumber = regularizationPageIndex + 1, size = regularizationPageSize) => {
            setRegularizationLoading(true);
            setRegularizationError(null);

            try {
                const params = { page: pageNumber, limit: size };
                if (regularizationStatus && regularizationStatus !== "all") params.status = regularizationStatus;
                if (regularizationType && regularizationType !== "all") params.type = regularizationType;
                if (regularizationStartDate) params.start_date = regularizationStartDate;
                if (regularizationEndDate) params.end_date = regularizationEndDate;

                const response = await axiosInstance.get("/attendance/late-regularizations", { params });
                const payload = response.data?.data ?? response.data ?? {};
                const records = extractCollection(payload);

                setRegularizations(records);
                setRegularizationPagination(extractPagination(payload, records.length));
            } catch (error) {
                setRegularizationError(extractApiMessage(error, "Failed to load your regularization requests. Please try again."));
                setRegularizations([]);
                setRegularizationPagination({ total: 0, pages: 1 });
            } finally {
                setRegularizationLoading(false);
            }
        },
        [regularizationEndDate, regularizationPageIndex, regularizationPageSize, regularizationStartDate, regularizationStatus, regularizationType]
    );

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    useEffect(() => {
        fetchRegularizations();
    }, [fetchRegularizations]);

    const openRaiseDialog = useCallback((attendance) => {
        const attendanceId = toAttendanceId(attendance);
        if (!attendanceId) return;

        setSelectedAttendance(attendance);
        setFormData({ attendance_id: attendanceId, type: "", custom_type: "", reason: "", documents: [] });
        setFormErrors({});
        setRaiseDialogOpen(true);
    }, []);

    const closeRaiseDialog = useCallback(() => {
        setRaiseDialogOpen(false);
        setSelectedAttendance(null);
        setFormData(EMPTY_FORM);
        setFormErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const nextErrors = {};

        if (!formData.attendance_id) nextErrors.attendance_id = "Attendance record is required.";
        if (!formData.type) nextErrors.type = "Regularization type is required.";

        if (formData.type === "other" && !formData.custom_type.trim()) {
            nextErrors.custom_type = "Custom type is required when type is Other.";
        }

        const reason = formData.reason.trim();
        if (!reason) nextErrors.reason = "Reason is required.";
        else if (reason.length < 5) nextErrors.reason = "Reason must be at least 5 characters.";

        return nextErrors;
    }, [formData.attendance_id, formData.custom_type, formData.reason, formData.type]);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();

            const nextErrors = validateForm();
            setFormErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
                toast.error("Please fix the highlighted fields.");
                return;
            }

            setSubmitLoading(true);
            try {
                const payload = new FormData();
                payload.append("attendance_id", formData.attendance_id);
                payload.append("type", formData.type);
                payload.append("reason", formData.reason.trim());

                if (formData.type === "other" && formData.custom_type.trim()) {
                    payload.append("custom_type", formData.custom_type.trim());
                }

                formData.documents.forEach((file) => {
                    payload.append("supporting_documents", file);
                });

                await axiosInstance.post("/attendance/late-regularizations", payload, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                toast.success("Regularization request submitted successfully.");
                closeRaiseDialog();
                await Promise.all([
                    fetchRegularizations(regularizationPageIndex + 1, regularizationPageSize),
                    fetchAttendance(attendancePageIndex + 1, attendancePageSize),
                ]);
            } catch (error) {
                const apiMessage = extractApiMessage(error, "Failed to submit regularization request.");
                const fieldErrors = extractFieldErrors(error);
                setFormErrors((current) => ({ ...current, ...fieldErrors }));
                toast.error(apiMessage);
            } finally {
                setSubmitLoading(false);
            }
        },
        [attendancePageIndex, attendancePageSize, closeRaiseDialog, fetchAttendance, fetchRegularizations, formData, regularizationPageSize, validateForm]
    );

    const openRequestDetails = useCallback((request) => {
        setSelectedRequest(request);
        setDetailOpen(true);
    }, []);

    const handleRefreshAttendance = useCallback(() => {
        fetchAttendance(1, attendancePageSize);
    }, [attendancePageSize, fetchAttendance]);

    const handleRefreshRegularizations = useCallback(() => {
        fetchRegularizations(1, regularizationPageSize);
    }, [fetchRegularizations, regularizationPageSize]);

    const attendanceTableColumns = useMemo(() => attendanceColumns({ onRaiseRegularization: openRaiseDialog }), [openRaiseDialog]);
    const regularizationTableColumns = useMemo(() => regularizationColumns({ onViewRequest: openRequestDetails }), [openRequestDetails]);
    const selectedAttendanceId = selectedAttendance ? toAttendanceId(selectedAttendance) : formData.attendance_id;
    const requestSummary = useMemo(() => buildRequestSummary(selectedRequest), [selectedRequest]);
    const requestDocuments = useMemo(() => formatDocuments(selectedRequest), [selectedRequest]);

    return (
        <div className="space-y-6 pt-4 md:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg border bg-background p-2 shadow-xs">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">Late Regularization</h1>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Submit and track your own regularization requests against attendance records.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => { fetchAttendance(); fetchRegularizations(); }} disabled={attendanceLoading || regularizationLoading}>
                        <RefreshCw className={`h-4 w-4 ${(attendanceLoading || regularizationLoading) ? "animate-spin" : ""}`} />
                        Refresh all
                    </Button>
                </div>
            </div>

            {attendanceError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{attendanceError}</AlertDescription>
                </Alert>
            )}

            {regularizationError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{regularizationError}</AlertDescription>
                </Alert>
            )}

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Regularization workspace</CardTitle>
                    <CardDescription>
                        Select an attendance record, raise a request, then review all of your requests from the same place.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={innerTab} onValueChange={setInnerTab} className="space-y-5">
                        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                            <TabsTrigger value="submit" className="gap-2 rounded-full border border-border/70 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Submit Request
                            </TabsTrigger>
                            <TabsTrigger value="requests" className="gap-2 rounded-full border border-border/70 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <ClipboardList className="h-4 w-4" />
                                My Regularizations
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="submit" className="space-y-5">
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Attendance selector</CardTitle>
                                    <CardDescription>
                                        Filter your attendance records, then choose the one that needs a regularization request.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <TableToolbar
                                        placeholder="Search current page by attendance id, date, status, or time..."
                                        total={filteredAttendance.length}
                                        searchValue={attendanceSearch}
                                        onSearchChange={setAttendanceSearch}
                                        rightSlot={
                                            <div className="flex flex-wrap items-end gap-3">
                                                <div className="space-y-1">
                                                    <Label htmlFor="attendance-start-date" className="text-xs text-muted-foreground">From</Label>
                                                    <Input id="attendance-start-date" type="date" value={attendanceStartDate} onChange={(event) => { setAttendanceStartDate(event.target.value); setAttendancePageIndex(0); }} className="h-8 w-37.5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="attendance-end-date" className="text-xs text-muted-foreground">To</Label>
                                                    <Input id="attendance-end-date" type="date" value={attendanceEndDate} onChange={(event) => { setAttendanceEndDate(event.target.value); setAttendancePageIndex(0); }} className="h-8 w-37.5" />
                                                </div>
                                                <Button variant="outline" size="sm" className="gap-2" onClick={handleRefreshAttendance} disabled={attendanceLoading}>
                                                    <RefreshCw className={`h-4 w-4 ${attendanceLoading ? "animate-spin" : ""}`} />
                                                    Refresh
                                                </Button>
                                            </div>
                                        }
                                    />

                                    <DataTable
                                        data={filteredAttendance}
                                        columns={attendanceTableColumns}
                                        page={attendancePageIndex}
                                        pageSize={attendancePageSize}
                                        total={attendanceTotal}
                                        setPage={setAttendancePageIndex}
                                        setPageSize={setAttendancePageSize}
                                        isLoading={attendanceLoading}
                                        loadingText="Loading your attendance records..."
                                        pagination
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="requests" className="space-y-5">
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">My regularizations</CardTitle>
                                    <CardDescription>
                                        Track pending, approved, and rejected requests with filters for type and date range.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <TableToolbar
                                        placeholder="Search this page by type, reason, status, or remarks..."
                                        total={filteredRegularizations.length}
                                        searchValue={regularizationSearch}
                                        onSearchChange={setRegularizationSearch}
                                        rightSlot={
                                            <div className="flex flex-wrap items-end gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                                    <Select value={regularizationStatus} onValueChange={(value) => { setRegularizationStatus(value); setRegularizationPageIndex(0); }}>
                                                        <SelectTrigger className="h-8 w-35"><SelectValue placeholder="All statuses" /></SelectTrigger>
                                                        <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                                                            {requestStatusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Type</Label>
                                                    <Select value={regularizationType} onValueChange={(value) => { setRegularizationType(value); setRegularizationPageIndex(0); }}>
                                                        <SelectTrigger className="h-8 w-42.5"><SelectValue placeholder="All types" /></SelectTrigger>
                                                        <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                                                            {REGULARIZATION_FILTERS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">From</Label>
                                                    <Input type="date" value={regularizationStartDate} onChange={(event) => { setRegularizationStartDate(event.target.value); setRegularizationPageIndex(0); }} className="h-8 w-37.5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">To</Label>
                                                    <Input type="date" value={regularizationEndDate} onChange={(event) => { setRegularizationEndDate(event.target.value); setRegularizationPageIndex(0); }} className="h-8 w-37.5" />
                                                </div>
                                                <Button variant="outline" size="sm" className="gap-2" onClick={handleRefreshRegularizations} disabled={regularizationLoading}>
                                                    <RefreshCw className={`h-4 w-4 ${regularizationLoading ? "animate-spin" : ""}`} />
                                                    Refresh
                                                </Button>
                                            </div>
                                        }
                                    />

                                    <DataTable
                                        data={filteredRegularizations}
                                        columns={regularizationTableColumns}
                                        page={regularizationPageIndex}
                                        pageSize={regularizationPageSize}
                                        total={regularizationTotal}
                                        setPage={setRegularizationPageIndex}
                                        setPageSize={setRegularizationPageSize}
                                        isLoading={regularizationLoading}
                                        loadingText="Loading your regularization requests..."
                                        pagination
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={raiseDialogOpen} onOpenChange={(open) => (open ? setRaiseDialogOpen(true) : closeRaiseDialog())}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Raise regularization request</DialogTitle>
                        <DialogDescription>
                            Attendance ID is prefilled from your own attendance record. Only employee-safe fields are included in the payload.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="attendance-id">Attendance ID</Label>
                            <Input id="attendance-id" value={selectedAttendanceId} readOnly className="bg-muted/60" />
                            <p className="text-xs text-muted-foreground">Selected from your attendance history and sent as attendance_id.</p>
                            {formErrors.attendance_id && <p className="text-xs text-destructive">{formErrors.attendance_id}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => {
                                        setFormData((current) => ({
                                            ...current,
                                            type: value,
                                            custom_type: value === "other" ? current.custom_type : "",
                                        }));
                                        setFormErrors((current) => ({ ...current, type: undefined, custom_type: undefined }));
                                    }}
                                >
                                    <SelectTrigger id="type" className={formErrors.type ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regularizationTypes.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Pick the reason category that best matches the attendance issue.</p>
                                {formErrors.type && <p className="text-xs text-destructive">{formErrors.type}</p>}
                            </div>

                            {formData.type === "other" && (
                                <div className="space-y-2">
                                    <Label htmlFor="custom-type">Custom type</Label>
                                    <Input
                                        id="custom-type"
                                        placeholder="e.g. internet_outage"
                                        value={formData.custom_type}
                                        onChange={(event) => setFormData((current) => ({ ...current, custom_type: event.target.value }))}
                                        className={formErrors.custom_type ? "border-destructive" : ""}
                                    />
                                    <p className="text-xs text-muted-foreground">Required only when the type is Other.</p>
                                    {formErrors.custom_type && <p className="text-xs text-destructive">{formErrors.custom_type}</p>}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                rows={4}
                                placeholder="Explain why this attendance needs regularization"
                                value={formData.reason}
                                onChange={(event) => setFormData((current) => ({ ...current, reason: event.target.value }))}
                                className={formErrors.reason ? "border-destructive" : ""}
                            />
                            <p className="text-xs text-muted-foreground">Minimum 5 characters. Keep it clear and factual.</p>
                            {formErrors.reason && <p className="text-xs text-destructive">{formErrors.reason}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supporting-documents">Supporting documents</Label>
                            <Input
                                id="supporting-documents"
                                type="file"
                                multiple
                                onChange={(event) => setFormData((current) => ({ ...current, documents: Array.from(event.target.files || []) }))}
                            />
                            <p className="text-xs text-muted-foreground">Optional. Attach screenshots, receipts, or other proof.</p>
                            {formData.documents.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {formData.documents.map((file) => (
                                        <Badge key={`${file.name}-${file.size}`} variant="outline" className="max-w-full truncate">{file.name}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeRaiseDialog} disabled={submitLoading}>Cancel</Button>
                            <Button type="submit" disabled={submitLoading} className="gap-2">
                                {submitLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {submitLoading ? "Submitting..." : "Submit request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Request details</SheetTitle>
                        <SheetDescription>
                            Review the submitted information, attached files, and any response fields returned by the API.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedRequest && (
                        <div className="space-y-4 p-4 pt-0">
                            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                                    <Badge variant="outline" className={`mt-2 text-xs font-medium ${requestStatusMeta(selectedRequest.status).className}`}>{requestStatusMeta(selectedRequest.status).label}</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</p>
                                    <p className="mt-1 text-sm font-medium">{fmtDate(selectedRequest.submitted_at || selectedRequest.created_at)}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {requestSummary.map((item) => (
                                    <div key={item.label} className="rounded-xl border p-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                                        <p className="mt-1 wrap-break-word text-sm font-medium">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {requestDocuments.length > 0 && (
                                <div className="space-y-3 rounded-xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">Attachments</p>
                                        <p className="text-xs text-muted-foreground">Preview the supporting documents attached to this request.</p>
                                    </div>
                                    <div className="space-y-2">
                                        {requestDocuments.map((document, index) => {
                                            const href = document?.url || document?.file_url || document?.path || document?.download_url || document?.location || "";
                                            const label = document?.name || document?.file_name || document?.filename || document?.original_name || `Document ${index + 1}`;
                                            return (
                                                <div key={`${label}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{label}</p>
                                                        <p className="text-xs text-muted-foreground">{href || "No preview link available"}</p>
                                                    </div>
                                                    {href ? (
                                                        <Button asChild variant="outline" size="sm"><a href={href} target="_blank" rel="noreferrer">Open</a></Button>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(selectedRequest.history) && selectedRequest.history.length > 0 && (
                                <div className="space-y-3 rounded-xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">History</p>
                                        <p className="text-xs text-muted-foreground">Action log returned by the API.</p>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedRequest.history.map((entry, index) => (
                                            <div key={index} className="rounded-lg border bg-muted/20 p-3">
                                                <p className="text-sm font-medium">{entry?.action || entry?.status || `Event ${index + 1}`}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{fmtDate(entry?.created_at || entry?.timestamp || entry?.date)}</p>
                                                {entry?.remarks && <p className="mt-2 text-sm">{entry.remarks}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}