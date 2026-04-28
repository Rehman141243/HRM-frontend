// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { AlertCircle, BarChart3, Calendar, CheckCircle2, Clock, RefreshCw, TrendingUp } from "lucide-react";

// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DataTable } from "@/components/common/data-table";
// import TableToolbar from "@/components/common/table-toolbar";
// import StatCard from "@/components/common/stat-card";
// import axiosInstance from "@/lib/axiosInstance";
// import { todayDateStr, fmtDate } from "@/components/common/common";
// import { attendanceReportColumns } from "./attendance-reports-columns";

// const ATTENDANCE_STATUSES = [
// 	{ value: "PRESENT", label: "Present" },
// 	{ value: "ABSENT", label: "Absent" },
// 	{ value: "ON_LEAVE", label: "On Leave" },
// 	{ value: "HALF_DAY", label: "Half Day" },
// 	{ value: "ON_HOLIDAY", label: "On Holiday" },
// ];

// export default function AttendanceReports() {
// 	const [reports, setReports] = useState([]);
// 	const [summary, setSummary] = useState(null);
// 	const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
// 	const [pageIndex, setPageIndex] = useState(0);
// 	const [pageSize, setPageSize] = useState(10);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState(null);

// 	// Filters
// 	const [startDate, setStartDate] = useState("");
// 	const [endDate, setEndDate] = useState("");
// 	const [statusFilter, setStatusFilter] = useState("all");
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const [dateRangeOpen, setDateRangeOpen] = useState(false);

// 	const fetchReports = useCallback(async () => {
// 		try {
// 			setLoading(true);
// 			setError(null);

// 			const params = {
// 				page: pageIndex + 1,
// 				limit: pageSize,
// 			};

// 			if (startDate) params.start_date = startDate;
// 			if (endDate) params.end_date = endDate;
// 			if (statusFilter && statusFilter !== "all") params.status = statusFilter;

// 			const res = await axiosInstance.get("/attendance/reports/me", { params });
// 			const data = res.data?.data ?? {};

// 			setReports(data.records ?? []);
// 			setSummary(data.summary ?? null);
// 			setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, pages: 1 });
// 		} catch (requestError) {
// 			console.error("Failed to fetch attendance reports", requestError);
// 			setError(requestError.response?.data?.message || "Failed to load attendance reports. Please try again.");
// 			setReports([]);
// 			setSummary(null);
// 		} finally {
// 			setLoading(false);
// 		}
// 	}, [pageIndex, pageSize, startDate, endDate, statusFilter]);

// 	useEffect(() => {
// 		fetchReports();
// 	}, [fetchReports]);

// 	const handleDateRangeChange = (start, end) => {
// 		setStartDate(start);
// 		setEndDate(end);
// 		setPageIndex(0); // Reset to first page
// 	};

// 	const handleStatusChange = (status) => {
// 		setStatusFilter(status);
// 		setPageIndex(0); // Reset to first page
// 	};

// 	const handleRefresh = () => {
// 		const hasActiveFilters =
// 			Boolean(startDate) ||
// 			Boolean(endDate) ||
// 			statusFilter !== "all" ||
// 			Boolean(searchTerm);

// 		setStartDate("");
// 		setEndDate("");
// 		setStatusFilter("all");
// 		setSearchTerm("");
// 		setDateRangeOpen(false);
// 		setPageIndex(0);

// 		if (!hasActiveFilters) {
// 			fetchReports();
// 		}
// 	};

// 	const filteredRecords = useMemo(() => {
// 		if (!searchTerm) return reports;

// 		const lowerSearch = searchTerm.toLowerCase();
// 		return reports.filter(
// 			(record) =>
// 				fmtDate(record.date).toLowerCase().includes(lowerSearch) ||
// 				record.shift?.name?.toLowerCase().includes(lowerSearch) ||
// 				record.employee?.first_name?.toLowerCase().includes(lowerSearch) ||
// 				record.employee?.last_name?.toLowerCase().includes(lowerSearch)
// 		);
// 	}, [reports, searchTerm]);

// 	const summaryStats = useMemo(() => {
// 		if (!summary) return { presentDays: 0, payableDays: 0, lateArrivals: 0, totalWorked: 0 };

// 		return {
// 			presentDays: summary.evaluated?.present_days ?? 0,
// 			payableDays: summary.evaluated?.payable_days ?? 0,
// 			lateArrivals: summary.evaluated?.late_arrivals ?? 0,
// 			totalWorked: summary.total_worked_hours ?? 0,
// 		};
// 	}, [summary]);

// 	return (
// 		<div className="space-y-6 pt-4 md:pt-6">
// 			{/* Header */}
// 			<div>
// 				<div className="flex items-center gap-2">
// 					<div className="rounded-lg border bg-background p-2 shadow-xs">
// 						<BarChart3 className="h-4 w-4 text-muted-foreground" />
// 					</div>
// 					<h2 className="text-base sm:text-2xl font-bold tracking-tight">Attendance Reports</h2>
// 				</div>
// 				<p className="mt-2 text-xs sm:text-sm text-muted-foreground">Review your detailed attendance history and metrics</p>
// 			</div>

// 			{/* Summary Stats */}
// 			<div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
// 				<StatCard
// 					icon={CheckCircle2}
// 					label="Present Days"
// 					value={summaryStats.presentDays}
// 					hint={`${summary?.evaluated?.half_days ?? 0} half days`}
// 					accent="emerald"
// 					loading={loading}
// 				/>
// 				<StatCard
// 					icon={TrendingUp}
// 					label="Payable Days"
// 					value={summaryStats.payableDays.toFixed(1)}
// 					hint={`${summaryStats.totalWorked}h worked`}
// 					accent="blue"
// 					loading={loading}
// 				/>
// 				<StatCard
// 					icon={Clock}
// 					label="Late Arrivals"
// 					value={summaryStats.lateArrivals}
// 					hint={`${summary?.absent ?? 0} absent`}
// 					accent="amber"
// 					loading={loading}
// 				/>
// 				<StatCard
// 					icon={Calendar}
// 					label="Total Records"
// 					value={summary?.total_records ?? 0}
// 					hint={`${summary?.on_leave ?? 0} on leave`}
// 					accent="purple"
// 					loading={loading}
// 				/>
// 			</div>

// 			{/* Error Alert */}
// 			{error && (
// 				<Alert variant="destructive">
// 					<AlertCircle className="h-4 w-4" />
// 					<AlertDescription>{error}</AlertDescription>
// 				</Alert>
// 			)}

// 			{/* Filters Card */}
// 			<Card className="border-border/60 bg-transparent shadow-sm">
// 				<CardHeader className="pb-3">
// 					<CardTitle className="text-base">Filters</CardTitle>
// 				</CardHeader>
// 				<CardContent className="space-y-4">
// 					{/* Date Range Toggle */}
// 					<div className="space-y-2">
// 						<div className="flex items-center gap-2">
// 							<label className="text-sm font-medium">Date Range:</label>
// 							<Button
// 								variant={dateRangeOpen ? "default" : "outline"}
// 								size="sm"
// 								onClick={() => setDateRangeOpen(!dateRangeOpen)}
// 								className="text-xs"
// 							>
// 								{startDate || endDate ? `${startDate ? fmtDate(startDate) : "Start"} - ${endDate ? fmtDate(endDate) : "End"}` : "Select Range"}
// 							</Button>
// 						</div>

// 						{dateRangeOpen && (
// 							<div className="grid gap-3 pt-2 sm:grid-cols-2">
// 								<div className="space-y-1.5">
// 									<label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
// 										From Date
// 									</label>
// 									<Input
// 										id="start-date"
// 										type="date"
// 										value={startDate}
// 										onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
// 										className="text-sm mt-2"
// 									/>
// 								</div>
// 								<div className="space-y-1.5">
// 									<label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
// 										To Date
// 									</label>
// 									<Input
// 										id="end-date"
// 										type="date"
// 										value={endDate}
// 										onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
// 										className="text-sm mt-2"
// 									/>
// 								</div>
// 							</div>
// 						)}
// 					</div>

// 					{/* Status Filter */}
// 					<div className="space-y-1.5">
// 						<label htmlFor="status-filter" className="text-sm font-medium mb-2">
// 							Status Filter
// 						</label>
// 						<Select value={statusFilter} onValueChange={handleStatusChange}>
// 							<SelectTrigger id="status-filter" className="w-full sm:w-64">
// 								<SelectValue placeholder="Select status" />
// 							</SelectTrigger>
// 							<SelectContent position="popper" align="start" side="bottom" sideOffset={6}>
// 								<SelectItem value="all">All Statuses</SelectItem>
// 								{ATTENDANCE_STATUSES.map((status) => (
// 									<SelectItem key={status.value} value={status.value}>
// 										{status.label}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					{/* Refresh Button */}
// 					<div className="flex gap-2">
// 						<Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm" className="gap-2">
// 							<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
// 							Refresh
// 						</Button>
// 					</div>
// 				</CardContent>
// 			</Card>

// 			{/* Table Card */}
// 			<Card className="border-border/60 bg-transparent shadow-sm">
// 				<CardHeader className="pb-3">
// 					<CardTitle className="text-sm sm:text-base">Attendance Records</CardTitle>
// 					<CardDescription className='text-xs sm:text-sm'>{filteredRecords.length} records shown</CardDescription>
// 				</CardHeader>
// 				<CardContent className="space-y-4">
// 					{/* Search & Toolbar */}
// 					<TableToolbar
// 						placeholder="Search by date, shift, or name..."
// 						searchValue={searchTerm}
// 						onSearchChange={setSearchTerm}
// 					/>

// 					{/* Table */}
// 					{loading ? (
// 						<div className="flex justify-center py-8">
// 							<div className="text-sm text-muted-foreground">Loading attendance records...</div>
// 						</div>
// 					) : filteredRecords.length === 0 ? (
// 						<div className="flex justify-center py-8">
// 							<div className="text-sm text-muted-foreground">No attendance records found.</div>
// 						</div>
// 					) : (
// 						<>
// 							<DataTable
// 								columns={attendanceReportColumns}
// 								data={filteredRecords}
// 								isLoading={loading}
// 								page={pageIndex}
// 								pageSize={pageSize}
// 								total={pagination.total}
// 								setPage={setPageIndex}
// 								setPageSize={setPageSize}
// 							/>
// 						</>
// 					)}
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Calendar, CheckCircle2, Clock, RefreshCw, TrendingUp } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import StatCard from "@/components/common/stat-card";
import AttendanceRecordCard from "../../../components/responsiveness/record-card";
import axiosInstance from "@/lib/axiosInstance";
import { fmtDate } from "@/components/common/common";
import { attendanceReportColumns } from "./attendance-reports-columns";

const ATTENDANCE_STATUSES = [
	{ value: "PRESENT",    label: "Present"    },
	{ value: "ABSENT",     label: "Absent"     },
	{ value: "ON_LEAVE",   label: "On Leave"   },
	{ value: "HALF_DAY",   label: "Half Day"   },
	{ value: "ON_HOLIDAY", label: "On Holiday" },
];

// ── Mobile card skeleton ───────────────────────────────────────────────────────
function MobileCardSkeleton() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="rounded-xl border border-border/60 bg-card p-3.5 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="h-7 w-7 rounded-lg" />
							<div className="space-y-1.5">
								<Skeleton className="h-3 w-24 rounded" />
								<Skeleton className="h-2.5 w-16 rounded" />
							</div>
						</div>
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
					<div className="grid grid-cols-3 gap-2">
						{[1, 2, 3].map((j) => (
							<div key={j} className="flex flex-col items-center gap-1">
								<Skeleton className="h-2 w-10 rounded" />
								<Skeleton className="h-3.5 w-12 rounded" />
							</div>
						))}
					</div>
					<div className="space-y-2 pt-1">
						<Skeleton className="h-2.5 w-full rounded" />
						<Skeleton className="h-2.5 w-3/4 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

// ── Shared mobile pagination ───────────────────────────────────────────────────
function MobilePagination({ pageIndex, totalPages, total, onPageChange }) {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-between border-t border-border/40 pt-3">
			<p className="text-[10px] text-muted-foreground">
				Page{" "}
				<span className="font-medium text-foreground">{pageIndex + 1}</span>
				{" "}of{" "}
				<span className="font-medium text-foreground">{totalPages}</span>
				{" · "}
				<span className="font-medium text-foreground">{total}</span> total
			</p>
			<div className="flex items-center gap-1">
				{/* First */}
				<Button
					variant="outline"
					size="sm"
					className="h-7 w-7 p-0"
					disabled={pageIndex === 0}
					onClick={() => onPageChange(0)}
					aria-label="First page"
				>
					<span className="text-xs">«</span>
				</Button>
				{/* Prev */}
				<Button
					variant="outline"
					size="sm"
					className="h-7 px-2.5 text-[10px]"
					disabled={pageIndex === 0}
					onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
				>
					Prev
				</Button>
				{/* Next */}
				<Button
					variant="outline"
					size="sm"
					className="h-7 px-2.5 text-[10px]"
					disabled={pageIndex + 1 >= totalPages}
					onClick={() => onPageChange(pageIndex + 1)}
				>
					Next
				</Button>
				{/* Last */}
				<Button
					variant="outline"
					size="sm"
					className="h-7 w-7 p-0"
					disabled={pageIndex + 1 >= totalPages}
					onClick={() => onPageChange(totalPages - 1)}
					aria-label="Last page"
				>
					<span className="text-xs">»</span>
				</Button>
			</div>
		</div>
	);
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AttendanceReports() {
	const [reports,    setReports]    = useState([]);
	const [summary,    setSummary]    = useState(null);
	const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
	const [pageIndex,  setPageIndex]  = useState(0);
	const [pageSize,   setPageSize]   = useState(10);
	const [loading,    setLoading]    = useState(true);
	const [error,      setError]      = useState(null);

	// Filters
	const [startDate,     setStartDate]     = useState("");
	const [endDate,       setEndDate]       = useState("");
	const [statusFilter,  setStatusFilter]  = useState("all");
	const [searchTerm,    setSearchTerm]    = useState("");
	const [dateRangeOpen, setDateRangeOpen] = useState(false);

	const fetchReports = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const params = { page: pageIndex + 1, limit: pageSize };
			if (startDate)                            params.start_date = startDate;
			if (endDate)                              params.end_date   = endDate;
			if (statusFilter && statusFilter !== "all") params.status   = statusFilter;

			const res  = await axiosInstance.get("/attendance/reports/me", { params });
			const data = res.data?.data ?? {};

			setReports(data.records    ?? []);
			setSummary(data.summary    ?? null);
			setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, pages: 1 });
		} catch (requestError) {
			console.error("Failed to fetch attendance reports", requestError);
			setError(requestError.response?.data?.message || "Failed to load attendance reports. Please try again.");
			setReports([]);
			setSummary(null);
		} finally {
			setLoading(false);
		}
	}, [pageIndex, pageSize, startDate, endDate, statusFilter]);

	useEffect(() => { fetchReports(); }, [fetchReports]);

	const handleDateRangeChange = (start, end) => {
		setStartDate(start);
		setEndDate(end);
		setPageIndex(0);
	};

	const handleStatusChange = (status) => {
		setStatusFilter(status);
		setPageIndex(0);
	};

	const handleRefresh = () => {
		const hasActiveFilters =
			Boolean(startDate) || Boolean(endDate) ||
			statusFilter !== "all" || Boolean(searchTerm);

		setStartDate("");
		setEndDate("");
		setStatusFilter("all");
		setSearchTerm("");
		setDateRangeOpen(false);
		setPageIndex(0);

		if (!hasActiveFilters) fetchReports();
	};

	// ── Client-side search filter (within the current server page) ─────────────
	const filteredRecords = useMemo(() => {
		if (!searchTerm) return reports;
		const q = searchTerm.toLowerCase();
		return reports.filter(
			(r) =>
				fmtDate(r.date).toLowerCase().includes(q) ||
				r.shift?.name?.toLowerCase().includes(q)  ||
				r.employee?.first_name?.toLowerCase().includes(q) ||
				r.employee?.last_name?.toLowerCase().includes(q)
		);
	}, [reports, searchTerm]);

	// ── Summary stats ───────────────────────────────────────────────────────────
	const summaryStats = useMemo(() => {
		if (!summary) return { presentDays: 0, payableDays: 0, lateArrivals: 0, totalWorked: 0 };
		return {
			presentDays:  summary.evaluated?.present_days  ?? 0,
			payableDays:  summary.evaluated?.payable_days  ?? 0,
			lateArrivals: summary.evaluated?.late_arrivals ?? 0,
			totalWorked:  summary.total_worked_hours        ?? 0,
		};
	}, [summary]);

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<div className="space-y-5 pt-4 md:pt-6">

			{/* ── Page header ── */}
			<div>
				<div className="flex items-center gap-2">
					<div className="rounded-lg border bg-background p-2 shadow-xs">
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</div>
					<h2 className="text-base sm:text-2xl font-bold tracking-tight">Attendance Reports</h2>
				</div>
				<p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
					Review your detailed attendance history and metrics
				</p>
			</div>

			{/* ── Summary stat cards ── */}
			<div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={CheckCircle2}
					label="Present Days"
					value={summaryStats.presentDays}
					hint={`${summary?.evaluated?.half_days ?? 0} half days`}
					accent="emerald"
					loading={loading}
				/>
				<StatCard
					icon={TrendingUp}
					label="Payable Days"
					value={summaryStats.payableDays.toFixed(1)}
					hint={`${summaryStats.totalWorked}h worked`}
					accent="blue"
					loading={loading}
				/>
				<StatCard
					icon={Clock}
					label="Late Arrivals"
					value={summaryStats.lateArrivals}
					hint={`${summary?.absent ?? 0} absent`}
					accent="amber"
					loading={loading}
				/>
				<StatCard
					icon={Calendar}
					label="Total Records"
					value={summary?.total_records ?? 0}
					hint={`${summary?.on_leave ?? 0} on leave`}
					accent="purple"
					loading={loading}
				/>
			</div>

			{/* ── Error alert ── */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* ── Filters card ── */}
			<Card className="border-border/60 bg-transparent shadow-sm">
				<CardHeader className="pb-2 pt-4 px-4">
					<CardTitle className="text-sm font-semibold">Filters</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-4 space-y-4">

					{/* Date range */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<label className="text-xs font-medium text-muted-foreground">Date Range</label>
							<Button
								variant={dateRangeOpen ? "default" : "outline"}
								size="sm"
								onClick={() => setDateRangeOpen(!dateRangeOpen)}
								className="text-xs h-7 px-2.5"
							>
								{startDate || endDate
									? `${startDate ? fmtDate(startDate) : "Start"} – ${endDate ? fmtDate(endDate) : "End"}`
									: "Select Range"}
							</Button>
						</div>

						{dateRangeOpen && (
							<div className="grid gap-3 pt-1 sm:grid-cols-2">
								<div className="space-y-1">
									<label htmlFor="start-date" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
										From
									</label>
									<Input
										id="start-date"
										type="date"
										value={startDate}
										onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
										className="text-xs h-8"
									/>
								</div>
								<div className="space-y-1">
									<label htmlFor="end-date" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
										To
									</label>
									<Input
										id="end-date"
										type="date"
										value={endDate}
										onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
										className="text-xs h-8"
									/>
								</div>
							</div>
						)}
					</div>

					{/* Status + refresh row */}
					<div className="flex flex-wrap items-end gap-3">
						<div className="flex-1 min-w-[160px] space-y-1">
							<label htmlFor="status-filter" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
								Status
							</label>
							<Select value={statusFilter} onValueChange={handleStatusChange}>
								<SelectTrigger id="status-filter" className="h-8 text-xs w-full">
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent position="popper" align="start" side="bottom" sideOffset={6}>
									<SelectItem value="all">All Statuses</SelectItem>
									{ATTENDANCE_STATUSES.map((s) => (
										<SelectItem key={s.value} value={s.value} className="text-xs">
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							onClick={handleRefresh}
							disabled={loading}
							variant="outline"
							size="sm"
							className="h-8 gap-1.5 text-xs"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* ── Records section ── */}
			<Card className="border-border/60 bg-transparent shadow-sm">
				<CardHeader className="pb-2 pt-4 px-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle className="text-xs sm:text-sm font-semibold">Attendance Records</CardTitle>
							<CardDescription className="text-[10px] sm:text-xs">
								{filteredRecords.length} records shown
							</CardDescription>
						</div>
						<div className="w-full sm:w-64">
							<TableToolbar
								placeholder="Search by date, shift…"
								searchValue={searchTerm}
								onSearchChange={setSearchTerm}
							/>
						</div>
					</div>
				</CardHeader>

				<CardContent className="px-4 pb-4 space-y-3">
					{loading ? (
						<>
							{/* Mobile skeleton */}
							<div className="sm:hidden">
								<MobileCardSkeleton />
							</div>
							{/* Desktop skeleton */}
							<div className="hidden sm:flex justify-center py-8">
								<p className="text-sm text-muted-foreground">Loading attendance records…</p>
							</div>
						</>
					) : filteredRecords.length === 0 ? (
						<div className="flex justify-center py-10 text-center">
							<p className="text-xs sm:text-sm text-muted-foreground">No attendance records found.</p>
						</div>
					) : (
						<>
							{/*
							 * ── MOBILE: cards (hidden sm+) ──
							 *
							 * The API already returns only the current page of records
							 * (controlled by pageIndex + pageSize sent in params).
							 * So `filteredRecords` IS the current page — render all of them.
							 * The MobilePagination below calls setPageIndex which triggers
							 * a fresh API fetch via the fetchReports useCallback.
							 */}
							<div className="sm:hidden space-y-3">
								{filteredRecords.map((record, idx) => (
									<AttendanceRecordCard key={record.id ?? record.date ?? idx} record={record} />
								))}
							</div>

							{/* ── DESKTOP: DataTable with built-in pagination (hidden mobile) ── */}
							<div className="hidden sm:block">
								<DataTable
									columns={attendanceReportColumns}
									data={filteredRecords}
									isLoading={loading}
									page={pageIndex}
									pageSize={pageSize}
									total={pagination.total}
									setPage={setPageIndex}
									setPageSize={setPageSize}
								/>
							</div>

							{/*
							 * ── MOBILE pagination controls ──
							 * Always rendered on mobile (sm:hidden).
							 * Drives the same pageIndex state → re-fetches from API.
							 */}
							<div className="sm:hidden">
								<MobilePagination
									pageIndex={pageIndex}
									totalPages={pagination.pages}
									total={pagination.total}
									onPageChange={setPageIndex}
								/>
							</div>
						</>
					)}
				</CardContent>
			</Card>

		</div>
	);
}