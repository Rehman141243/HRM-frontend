"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Calendar, CheckCircle2, Clock, RefreshCw, TrendingUp } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import StatCard from "@/components/common/stat-card";
import axiosInstance from "@/lib/axiosInstance";
import { todayDateStr, fmtDate } from "@/components/common/common";
import { attendanceReportColumns } from "./attendance-reports-columns";

const ATTENDANCE_STATUSES = [
	{ value: "PRESENT", label: "Present" },
	{ value: "ABSENT", label: "Absent" },
	{ value: "ON_LEAVE", label: "On Leave" },
	{ value: "HALF_DAY", label: "Half Day" },
	{ value: "ON_HOLIDAY", label: "On Holiday" },
];

export default function AttendanceReports() {
	const [reports, setReports] = useState([]);
	const [summary, setSummary] = useState(null);
	const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Filters
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [dateRangeOpen, setDateRangeOpen] = useState(false);

	const fetchReports = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const params = {
				page: pageIndex + 1,
				limit: pageSize,
			};

			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;
			if (statusFilter && statusFilter !== "all") params.status = statusFilter;

			const res = await axiosInstance.get("/attendance/reports/me", { params });
			const data = res.data?.data ?? {};

			setReports(data.records ?? []);
			setSummary(data.summary ?? null);
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

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	const handleDateRangeChange = (start, end) => {
		setStartDate(start);
		setEndDate(end);
		setPageIndex(0); // Reset to first page
	};

	const handleStatusChange = (status) => {
		setStatusFilter(status);
		setPageIndex(0); // Reset to first page
	};

	const handleRefresh = () => {
		const hasActiveFilters =
			Boolean(startDate) ||
			Boolean(endDate) ||
			statusFilter !== "all" ||
			Boolean(searchTerm);

		setStartDate("");
		setEndDate("");
		setStatusFilter("all");
		setSearchTerm("");
		setDateRangeOpen(false);
		setPageIndex(0);

		if (!hasActiveFilters) {
			fetchReports();
		}
	};

	const filteredRecords = useMemo(() => {
		if (!searchTerm) return reports;

		const lowerSearch = searchTerm.toLowerCase();
		return reports.filter(
			(record) =>
				fmtDate(record.date).toLowerCase().includes(lowerSearch) ||
				record.shift?.name?.toLowerCase().includes(lowerSearch) ||
				record.employee?.first_name?.toLowerCase().includes(lowerSearch) ||
				record.employee?.last_name?.toLowerCase().includes(lowerSearch)
		);
	}, [reports, searchTerm]);

	const summaryStats = useMemo(() => {
		if (!summary) return { presentDays: 0, payableDays: 0, lateArrivals: 0, totalWorked: 0 };

		return {
			presentDays: summary.evaluated?.present_days ?? 0,
			payableDays: summary.evaluated?.payable_days ?? 0,
			lateArrivals: summary.evaluated?.late_arrivals ?? 0,
			totalWorked: summary.total_worked_hours ?? 0,
		};
	}, [summary]);

	return (
		<div className="space-y-6 pt-4 md:pt-6">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<div className="rounded-lg border bg-background p-2 shadow-xs">
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</div>
					<h2 className="text-2xl font-bold tracking-tight">Attendance Reports</h2>
				</div>
				<p className="mt-2 text-sm text-muted-foreground">Review your detailed attendance history and metrics</p>
			</div>

			{/* Summary Stats */}
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Filters Card */}
			<Card className="border-border/60 bg-transparent shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Filters</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Date Range Toggle */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium">Date Range:</label>
							<Button
								variant={dateRangeOpen ? "default" : "outline"}
								size="sm"
								onClick={() => setDateRangeOpen(!dateRangeOpen)}
								className="text-xs"
							>
								{startDate || endDate ? `${startDate ? fmtDate(startDate) : "Start"} - ${endDate ? fmtDate(endDate) : "End"}` : "Select Range"}
							</Button>
						</div>

						{dateRangeOpen && (
							<div className="grid gap-3 pt-2 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
										From Date
									</label>
									<Input
										id="start-date"
										type="date"
										value={startDate}
										onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
										className="text-sm"
									/>
								</div>
								<div className="space-y-1.5">
									<label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
										To Date
									</label>
									<Input
										id="end-date"
										type="date"
										value={endDate}
										onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
										className="text-sm"
									/>
								</div>
							</div>
						)}
					</div>

					{/* Status Filter */}
					<div className="space-y-1.5">
						<label htmlFor="status-filter" className="text-sm font-medium">
							Status Filter
						</label>
						<Select value={statusFilter} onValueChange={handleStatusChange}>
							<SelectTrigger id="status-filter" className="w-full sm:w-64">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent position="popper" align="start" side="bottom" sideOffset={6}>
								<SelectItem value="all">All Statuses</SelectItem>
								{ATTENDANCE_STATUSES.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Refresh Button */}
					<div className="flex gap-2">
						<Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm" className="gap-2">
							<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Table Card */}
			<Card className="border-border/60 bg-transparent shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Attendance Records</CardTitle>
					<CardDescription>{filteredRecords.length} records shown</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search & Toolbar */}
					<TableToolbar
						placeholder="Search by date, shift, or name..."
						searchValue={searchTerm}
						onSearchChange={setSearchTerm}
					/>

					{/* Table */}
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="text-sm text-muted-foreground">Loading attendance records...</div>
						</div>
					) : filteredRecords.length === 0 ? (
						<div className="flex justify-center py-8">
							<div className="text-sm text-muted-foreground">No attendance records found.</div>
						</div>
					) : (
						<>
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
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
