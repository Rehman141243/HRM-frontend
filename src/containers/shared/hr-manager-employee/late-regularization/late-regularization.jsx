"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, ClipboardList, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";
import { todayDateStr } from "@/components/common/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    attendanceColumns,
    regularizationColumns,
    hrRegularizationColumns,
} from "./late-regularization-columns";

import {
    normalizeList,
    extractCollection,
    extractPagination,
    toAttendanceId,
    extractApiMessage,
    extractFieldErrors,
    formatDocuments,
    buildRequestSummary,
    getDefaultAttendanceRange,
} from "./late-regularization-utils";

import SubmitTab from "./submit-tab";
import MyRegularizationsTab from "./my-regularizations-tab";
import HrReviewTab from "./hr-review-tab";
import RaiseRegularizationDialog from "./raise-regularization-dialog";
import RequestDetailSheet from "./request-detail-sheet";
import ReviewDialog from "./review-dialog";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
    attendance_id: "",
    type: "",
    custom_type: "",
    reason: "",
    documents: [],
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function LateRegularization() {
    const defaultAttendanceRange = useMemo(() => getDefaultAttendanceRange(), []);
    const currentUser = getUser();
    const normalizedRole = String(currentUser?.role || "").toLowerCase();
    const normalizedDesignation = String(currentUser?.designation || "").toLowerCase();
    const isHrUser = normalizedRole === "hr" || normalizedDesignation === "hr";

    const [innerTab, setInnerTab] = useState("submit");

    /* Attendance state */
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendancePagination, setAttendancePagination] = useState({ total: 0, pages: 1 });
    const [attendancePageIndex, setAttendancePageIndex] = useState(0);
    const [attendancePageSize, setAttendancePageSize] = useState(10);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState(null);
    const [attendanceSearch, setAttendanceSearch] = useState("");
    const [attendanceStartDate, setAttendanceStartDate] = useState(defaultAttendanceRange.startDate);
    const [attendanceEndDate, setAttendanceEndDate] = useState(defaultAttendanceRange.endDate);

    /* My regularizations state */
    const [regularizations, setRegularizations] = useState([]);
    const [regularizationPagination, setRegularizationPagination] = useState({ total: 0, pages: 1 });
    const [regularizationPageIndex, setRegularizationPageIndex] = useState(0);
    const [regularizationPageSize, setRegularizationPageSize] = useState(10);
    const [regularizationLoading, setRegularizationLoading] = useState(false);
    const [regularizationError, setRegularizationError] = useState(null);
    const [regularizationSearch, setRegularizationSearch] = useState("");
    const [regularizationStatus, setRegularizationStatus] = useState("all");
    const [regularizationType, setRegularizationType] = useState("all");
    const [regularizationStartDate, setRegularizationStartDate] = useState("");
    const [regularizationEndDate, setRegularizationEndDate] = useState("");

    /* HR state */
    const [hrRegularizations, setHrRegularizations] = useState([]);
    const [hrPagination, setHrPagination] = useState({ total: 0, pages: 1 });
    const [hrPageIndex, setHrPageIndex] = useState(0);
    const [hrPageSize, setHrPageSize] = useState(10);
    const [hrLoading, setHrLoading] = useState(false);
    const [hrError, setHrError] = useState(null);
    const [hrSearch, setHrSearch] = useState("");
    const [hrStatus, setHrStatus] = useState("all");
    const [hrType, setHrType] = useState("all");
    const [hrStartDate, setHrStartDate] = useState("");
    const [hrEndDate, setHrEndDate] = useState("");

    /* Dialog / sheet state */
    const [raiseDialogOpen, setRaiseDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    /* Review form state */
    const [reviewStatus, setReviewStatus] = useState("approved");
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [reviewAppliedEffect, setReviewAppliedEffect] = useState(true);
    const [reviewOverride, setReviewOverride] = useState(false);
    const [reviewOverrideReason, setReviewOverrideReason] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    /* Derived totals */
    const attendanceTotal = attendancePagination?.total ?? attendanceRecords.length;
    const regularizationTotal = regularizationPagination?.total ?? regularizations.length;
    const hrTotal = hrPagination?.total ?? hrRegularizations.length;

    /* ── Client-side search filters ─────────────────────────────────────── */
    const filteredAttendance = useMemo(() => {
        const term = attendanceSearch.trim().toLowerCase();
        if (!term) return attendanceRecords;
        return attendanceRecords.filter((record) => {
            const values = [
                toAttendanceId(record),
                record?.date || record?.attendance_date,
                record?.check_in_time_local || record?.check_in_time,
                record?.check_out_time_local || record?.check_out_time,
            ];
            return values.some((v) => String(v || "").toLowerCase().includes(term));
        });
    }, [attendanceRecords, attendanceSearch]);

    const filteredRegularizations = useMemo(() => {
        const term = regularizationSearch.trim().toLowerCase();
        if (!term) return regularizations;
        return regularizations.filter((r) =>
            [r?.attendance_id, r?.type, r?.custom_type, r?.reason, r?.status, r?.remarks, r?.applied_effect]
                .some((v) => String(v || "").toLowerCase().includes(term))
        );
    }, [regularizationSearch, regularizations]);

    const filteredHrRegularizations = useMemo(() => {
        const term = hrSearch.trim().toLowerCase();
        if (!term) return hrRegularizations;
        return hrRegularizations.filter((r) => {
            const name = `${r?.employee?.first_name || ""} ${r?.employee?.last_name || ""}`.trim();
            return [name, r?.employee?.designation, r?.employee?.department, r?.attendance_id, r?.type, r?.custom_type, r?.reason, r?.status, r?.review_remarks]
                .some((v) => String(v || "").toLowerCase().includes(term));
        });
    }, [hrRegularizations, hrSearch]);

    /* ── Data fetchers ──────────────────────────────────────────────────── */
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
                if (regularizationStatus !== "all") params.status = regularizationStatus;
                if (regularizationType !== "all") params.type = regularizationType;
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

    const fetchHrRegularizations = useCallback(
        async (pageNumber = hrPageIndex + 1, size = hrPageSize) => {
            if (!isHrUser) return;
            setHrLoading(true);
            setHrError(null);
            try {
                const params = { page: pageNumber, limit: size };
                if (hrStatus !== "all") params.status = hrStatus;
                if (hrType !== "all") params.type = hrType;
                if (hrStartDate) params.start_date = hrStartDate;
                if (hrEndDate) params.end_date = hrEndDate;
                const response = await axiosInstance.get("/attendance/late-regularizations", { params });
                const payload = response.data ?? {};
                const records = extractCollection(payload?.data ?? payload);
                setHrRegularizations(records);
                setHrPagination(extractPagination(payload?.data ?? payload, records.length));
            } catch (error) {
                setHrError(extractApiMessage(error, "Failed to load late regularizations for review."));
                setHrRegularizations([]);
                setHrPagination({ total: 0, pages: 1 });
            } finally {
                setHrLoading(false);
            }
        },
        [hrEndDate, hrPageIndex, hrPageSize, hrStartDate, hrStatus, hrType, isHrUser]
    );

    useEffect(() => { fetchAttendance(); }, [fetchAttendance]);
    useEffect(() => { fetchRegularizations(); }, [fetchRegularizations]);
    useEffect(() => { if (isHrUser) fetchHrRegularizations(); }, [fetchHrRegularizations, isHrUser]);

    /* ── Dialog handlers ─────────────────────────────────────────────────── */
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
        const errors = {};
        if (!formData.attendance_id) errors.attendance_id = "Attendance record is required.";
        if (!formData.type) errors.type = "Regularization type is required.";
        if (formData.type === "other" && !formData.custom_type.trim())
            errors.custom_type = "Custom type is required when type is Other.";
        const reason = formData.reason.trim();
        if (!reason) errors.reason = "Reason is required.";
        else if (reason.length < 5) errors.reason = "Reason must be at least 5 characters.";
        return errors;
    }, [formData]);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();
            const errors = validateForm();
            setFormErrors(errors);
            if (Object.keys(errors).length > 0) { toast.error("Please fix the highlighted fields."); return; }

            setSubmitLoading(true);
            try {
                const payload = new FormData();
                payload.append("attendance_id", formData.attendance_id);
                payload.append("type", formData.type);
                payload.append("reason", formData.reason.trim());
                if (formData.type === "other" && formData.custom_type.trim())
                    payload.append("custom_type", formData.custom_type.trim());
                formData.documents.forEach((file) => payload.append("supporting_documents", file));

                await axiosInstance.post("/attendance/late-regularizations", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
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
                setFormErrors((c) => ({ ...c, ...fieldErrors }));
                toast.error(apiMessage);
            } finally {
                setSubmitLoading(false);
            }
        },
        [
            attendancePageIndex, attendancePageSize,
            closeRaiseDialog, fetchAttendance, fetchRegularizations,
            formData, regularizationPageIndex, regularizationPageSize, validateForm,
        ]
    );

    const openRequestDetails = useCallback((request) => {
        setSelectedRequest(request);
        setDetailOpen(true);
    }, []);

    const openReviewDialog = useCallback((request, status) => {
        setReviewTarget(request);
        setReviewStatus(status);
        setReviewRemarks("");
        setReviewAppliedEffect(status === "approved");
        setReviewOverride(false);
        setReviewOverrideReason("");
        setReviewDialogOpen(true);
    }, []);

    const closeReviewDialog = useCallback(() => {
        setReviewDialogOpen(false);
        setReviewTarget(null);
        setReviewStatus("approved");
        setReviewRemarks("");
        setReviewAppliedEffect(true);
        setReviewOverride(false);
        setReviewOverrideReason("");
    }, []);

    const handleSubmitReview = useCallback(
        async (event) => {
            event.preventDefault();
            if (!reviewTarget?.id) return;
            if (!reviewRemarks.trim()) { toast.error("Remarks are required."); return; }
            if (reviewStatus === "approved" && reviewOverride && !reviewOverrideReason.trim()) {
                toast.error("Override reason is required when HR override is enabled.");
                return;
            }

            setReviewSubmitting(true);
            try {
                const payload = { status: reviewStatus, remarks: reviewRemarks.trim() };
                if (reviewStatus === "approved") {
                    payload.applied_effect = reviewAppliedEffect;
                    payload.hr_override = reviewOverride;
                    if (reviewOverride) payload.override_reason = reviewOverrideReason.trim();
                }
                await axiosInstance.patch(`/attendance/late-regularizations/${reviewTarget.id}/review`, payload);
                toast.success(`Request ${reviewStatus === "approved" ? "approved" : "rejected"} successfully.`);
                closeReviewDialog();
                fetchHrRegularizations(hrPageIndex + 1, hrPageSize);
                fetchRegularizations(regularizationPageIndex + 1, regularizationPageSize);
            } catch (error) {
                toast.error(extractApiMessage(error, "Failed to review request."));
            } finally {
                setReviewSubmitting(false);
            }
        },
        [
            closeReviewDialog, fetchHrRegularizations, fetchRegularizations,
            hrPageIndex, hrPageSize, regularizationPageIndex, regularizationPageSize,
            reviewAppliedEffect, reviewOverride, reviewOverrideReason,
            reviewRemarks, reviewStatus, reviewTarget,
        ]
    );

    /* ── Column memos ────────────────────────────────────────────────────── */
    const attendanceTableColumns = useMemo(
        () => attendanceColumns({ onRaiseRegularization: openRaiseDialog }),
        [openRaiseDialog]
    );
    const regularizationTableColumns = useMemo(
        () => regularizationColumns({ onViewRequest: openRequestDetails }),
        [openRequestDetails]
    );
    const hrRegularizationTableColumns = useMemo(
        () => hrRegularizationColumns({ onViewRequest: openRequestDetails, onReviewDialog: openReviewDialog }),
        [openRequestDetails, openReviewDialog]
    );

    /* ── Detail sheet memos ──────────────────────────────────────────────── */
    const selectedAttendanceId = selectedAttendance
        ? toAttendanceId(selectedAttendance)
        : formData.attendance_id;
    const requestSummary = useMemo(() => buildRequestSummary(selectedRequest), [selectedRequest]);
    const requestDocuments = useMemo(() => formatDocuments(selectedRequest), [selectedRequest]);

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-6 pt-4 md:pt-6">
            {/* Page header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg border bg-background p-2 shadow-xs">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h1 className="text-base sm:text-2xl font-semibold tracking-tight">Late Regularization</h1>
                    </div>
                    <p className="mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground">
                        Submit and track your own regularization requests against attendance records.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 text-xs sm:text-sm"
                        onClick={() => { fetchAttendance(); fetchRegularizations(); }}
                        disabled={attendanceLoading || regularizationLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${(attendanceLoading || regularizationLoading) ? "animate-spin" : ""}`} />
                        Refresh all
                    </Button>
                </div>
            </div>

            {/* Error banners */}
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
            {isHrUser && hrError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{hrError}</AlertDescription>
                </Alert>
            )}

            {/* Workspace card */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xs sm:text-base">Regularization workspace</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Select an attendance record, raise a request, then review all of your requests from the same place.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={innerTab} onValueChange={setInnerTab} className="space-y-5">
                        <TabsList className="flex h-auto sm:w-full justify-start gap-2 bg-transparent p-0">
                            <TabsTrigger
                                value="submit"
                                className="gap-2 rounded-full border border-border/70 text-xs px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                <CalendarDays className="w-3 h-3 sm:h-4 sm:w-4" />
                                Submit Request
                            </TabsTrigger>
                            <TabsTrigger
                                value="requests"
                                className="gap-2 rounded-full border border-border/70 text-xs px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                <ClipboardList className="w-3 h-3 sm:h-4 sm:w-4" />
                                My Regularizations
                            </TabsTrigger>
                            {isHrUser && (
                                <TabsTrigger
                                    value="hr-review"
                                    className="gap-2 rounded-full border border-border/70 text-xs px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <ClipboardList className="w-3 h-3 sm:h-4 sm:w-4" />
                                    HR Review
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="submit" className="space-y-5">
                            <SubmitTab
                                filteredAttendance={filteredAttendance}
                                attendanceColumns={attendanceTableColumns}
                                attendancePageIndex={attendancePageIndex}
                                attendancePageSize={attendancePageSize}
                                attendanceTotal={attendanceTotal}
                                attendanceLoading={attendanceLoading}
                                attendanceSearch={attendanceSearch}
                                attendanceStartDate={attendanceStartDate}
                                attendanceEndDate={attendanceEndDate}
                                setAttendanceSearch={setAttendanceSearch}
                                setAttendanceStartDate={setAttendanceStartDate}
                                setAttendanceEndDate={setAttendanceEndDate}
                                setAttendancePageIndex={setAttendancePageIndex}
                                setAttendancePageSize={setAttendancePageSize}
                                onRaiseDialog={openRaiseDialog}
                                onRefresh={() => fetchAttendance(1, attendancePageSize)}
                            />
                        </TabsContent>

                        <TabsContent value="requests" className="space-y-5">
                            <MyRegularizationsTab
                                filteredRegularizations={filteredRegularizations}
                                regularizationColumns={regularizationTableColumns}
                                regularizationPageIndex={regularizationPageIndex}
                                regularizationPageSize={regularizationPageSize}
                                regularizationTotal={regularizationTotal}
                                regularizationLoading={regularizationLoading}
                                regularizationSearch={regularizationSearch}
                                regularizationStatus={regularizationStatus}
                                regularizationType={regularizationType}
                                regularizationStartDate={regularizationStartDate}
                                regularizationEndDate={regularizationEndDate}
                                setRegularizationSearch={setRegularizationSearch}
                                setRegularizationStatus={setRegularizationStatus}
                                setRegularizationType={setRegularizationType}
                                setRegularizationStartDate={setRegularizationStartDate}
                                setRegularizationEndDate={setRegularizationEndDate}
                                setRegularizationPageIndex={setRegularizationPageIndex}
                                setRegularizationPageSize={setRegularizationPageSize}
                                onViewDetails={openRequestDetails}
                                onRefresh={() => fetchRegularizations(1, regularizationPageSize)}
                            />
                        </TabsContent>

                        {isHrUser && (
                            <TabsContent value="hr-review" className="space-y-5">
                                <HrReviewTab
                                    filteredHrRegularizations={filteredHrRegularizations}
                                    hrRegularizationColumns={hrRegularizationTableColumns}
                                    hrPageIndex={hrPageIndex}
                                    hrPageSize={hrPageSize}
                                    hrTotal={hrTotal}
                                    hrLoading={hrLoading}
                                    hrSearch={hrSearch}
                                    hrStatus={hrStatus}
                                    hrType={hrType}
                                    hrStartDate={hrStartDate}
                                    hrEndDate={hrEndDate}
                                    setHrSearch={setHrSearch}
                                    setHrStatus={setHrStatus}
                                    setHrType={setHrType}
                                    setHrStartDate={setHrStartDate}
                                    setHrEndDate={setHrEndDate}
                                    setHrPageIndex={setHrPageIndex}
                                    setHrPageSize={setHrPageSize}
                                    onViewDetails={openRequestDetails}
                                    onReviewDialog={openReviewDialog}
                                    onRefresh={() => fetchHrRegularizations(1, hrPageSize)}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {/* ── Dialogs & sheets ──────────────────────────────────────────── */}
            <RaiseRegularizationDialog
                open={raiseDialogOpen}
                onOpenChange={setRaiseDialogOpen}
                selectedAttendanceId={selectedAttendanceId}
                formData={formData}
                formErrors={formErrors}
                submitLoading={submitLoading}
                onFormChange={(patch) => {
                    setFormData((c) => ({ ...c, ...patch }));
                    setFormErrors((c) => {
                        const next = { ...c };
                        Object.keys(patch).forEach((k) => delete next[k]);
                        return next;
                    });
                }}
                onSubmit={handleSubmit}
                onClose={closeRaiseDialog}
            />

            <RequestDetailSheet
                open={detailOpen}
                onOpenChange={setDetailOpen}
                selectedRequest={selectedRequest}
                requestSummary={requestSummary}
                requestDocuments={requestDocuments}
            />

            <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                reviewTarget={reviewTarget}
                reviewStatus={reviewStatus}
                reviewRemarks={reviewRemarks}
                reviewAppliedEffect={reviewAppliedEffect}
                reviewOverride={reviewOverride}
                reviewOverrideReason={reviewOverrideReason}
                reviewSubmitting={reviewSubmitting}
                setReviewRemarks={setReviewRemarks}
                setReviewAppliedEffect={setReviewAppliedEffect}
                setReviewOverride={setReviewOverride}
                setReviewOverrideReason={setReviewOverrideReason}
                onSubmit={handleSubmitReview}
                onClose={closeReviewDialog}
            />
        </div>
    );
}
