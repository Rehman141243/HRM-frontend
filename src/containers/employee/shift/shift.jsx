// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";

// import axiosInstance from "@/lib/axiosInstance";
// import { todayDateStr } from "@/components/common/common";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { DataTable } from "@/components/common/data-table";
// import TableToolbar from "@/components/common/table-toolbar";
// import { shiftColumns } from "./shift-columns";

// const PAGE_SIZE = 10;

// export default function Shift() {
// 	const [shifts, setShifts] = useState([]);
// 	const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
// 	const [pageIndex, setPageIndex] = useState(0);
// 	const [pageSize, setPageSize] = useState(PAGE_SIZE);
// 	const [selectedDate, setSelectedDate] = useState(todayDateStr());
// 	const [shiftStatus, setShiftStatus] = useState("all");
// 	const [loading, setLoading] = useState(true);
// 	const [refreshing, setRefreshing] = useState(false);
// 	const [error, setError] = useState(null);
// 	const [searchTerm, setSearchTerm] = useState("");

// 	const statusParams = useMemo(() => {
// 		if (shiftStatus === "active") return { is_active: true };
// 		if (shiftStatus === "inactive") return { is_active: false };
// 		return {};
// 	}, [shiftStatus]);

// 	const fetchShifts = useCallback(async ({ targetPage = 1, limit = pageSize, date = selectedDate, silent = false } = {}) => {
// 		if (silent) {
// 			setRefreshing(true);
// 		} else {
// 			setLoading(true);
// 		}

// 		setError(null);

// 		try {
// 			const response = await axiosInstance.get("/attendance/shifts/me", {
// 				params: {
// 					page: targetPage,
// 					limit,
// 					...statusParams,
// 					history: true,
// 					date,
// 				},
// 			});

// 			setShifts(response.data?.data ?? []);
// 			setPagination({
// 				page: response.data?.pagination?.page ?? targetPage,
// 				limit: response.data?.pagination?.limit ?? limit,
// 				total: response.data?.pagination?.total ?? 0,
// 				pages: response.data?.pagination?.pages ?? 1,
// 			});
// 		} catch (fetchError) {
// 			setShifts([]);
// 			setError(fetchError?.response?.data?.message || fetchError?.message || "Unable to load your shifts right now.");
// 		} finally {
// 			setLoading(false);
// 			setRefreshing(false);
// 		}
// 	}, [pageSize, selectedDate, statusParams]);

// 	useEffect(() => {
// 		fetchShifts({ targetPage: pageIndex + 1, limit: pageSize, date: selectedDate });
// 	}, [fetchShifts, pageIndex, pageSize, selectedDate]);

// 	const activeShifts = useMemo(() => shifts.filter((shift) => shift?.is_active), [shifts]);
// 	const historicalShifts = useMemo(() => shifts.filter((shift) => !shift?.is_active), [shifts]);
// 	const currentShift = activeShifts[0] ?? null;
// 	const filteredShifts = useMemo(() => {
// 		const query = searchTerm.trim().toLowerCase();

// 		if (!query) return shifts;

// 		return shifts.filter((shiftAssignment) => {
// 			const fullName = `${shiftAssignment.employee?.first_name ?? ""} ${shiftAssignment.employee?.last_name ?? ""}`.toLowerCase();
// 			return [
// 				shiftAssignment.shift?.name,
// 				shiftAssignment.assigned_from,
// 				shiftAssignment.assigned_to,
// 				fullName,
// 			]
// 				.filter(Boolean)
// 				.some((value) => String(value).toLowerCase().includes(query));
// 		});
// 	}, [searchTerm, shifts]);

// 	const columns = useMemo(() => shiftColumns, []);

// 	const handleDateChange = (value) => {
// 		setSelectedDate(value);
// 		setPageIndex(0);
// 	};

// 	const handleStatusChange = (value) => {
// 		setShiftStatus(value);
// 		setPageIndex(0);
// 	};

// 	const handleRefresh = () => {
// 		setShiftStatus("all");
// 		setSelectedDate(todayDateStr());
// 		setPageIndex(0);
// 		setSearchTerm("");
// 		fetchShifts({ targetPage: 1, limit: pageSize, date: todayDateStr(), silent: true });
// 	};

// 	return (
// 		<div className="space-y-4 pt-4 md:pt-6">
// 			<div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
// 				<div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
// 					<div className="space-y-4">
// 						<div className="space-y-1">
// 							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
// 								<CalendarDays className="h-4 w-4" />
// 								My Shifts
// 							</div>
// 							<h2 className="text-2xl font-semibold tracking-tight">Assigned shift history</h2>
// 							<p className="max-w-2xl text-sm text-muted-foreground">
// 								View your active assignment and shift history for the selected date without leaving this page.
// 							</p>
// 						</div>

// 						<div className="flex flex-wrap gap-3">
// 							<div className="rounded-xl border bg-background/60 px-3 py-2">
// 								<div className="text-xs text-muted-foreground">Total assignments</div>
// 								<div className="text-lg font-semibold tabular-nums">{pagination.total ?? 0}</div>
// 							</div>
// 							<div className="rounded-xl border bg-background/60 px-3 py-2">
// 								<div className="text-xs text-muted-foreground">Active today</div>
// 								<div className="text-lg font-semibold tabular-nums">{activeShifts.length}</div>
// 							</div>
// 							<div className="rounded-xl border bg-background/60 px-3 py-2">
// 								<div className="text-xs text-muted-foreground">History on page</div>
// 								<div className="text-lg font-semibold tabular-nums">{historicalShifts.length}</div>
// 							</div>
// 						</div>
// 					</div>

// 					<div className="rounded-2xl border bg-background/70 p-3 shadow-sm">
// 						<TableToolbar
// 							placeholder="Search shifts on this page…"
// 							searchValue={searchTerm}
// 							onSearchChange={setSearchTerm}
// 							total={filteredShifts.length}
// 							className="border-0 bg-transparent p-0 shadow-none md:flex-col md:items-stretch lg:flex-row lg:items-end"
// 							rightSlot={
// 								<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[11rem_10rem_auto] lg:items-end lg:gap-3">
// 									<div className="space-y-1.5">
// 										<Input
// 											id="shift-date"
// 											type="date"
// 											value={selectedDate}
// 											onChange={(event) => handleDateChange(event.target.value)}
// 											className="w-full"
// 										/>
// 									</div>
// 									<div className="space-y-1.5">
// 										<Select value={shiftStatus} onValueChange={handleStatusChange}>
// 											<SelectTrigger id="shift-status" className="w-full">
// 												<SelectValue placeholder="All shifts" />
// 											</SelectTrigger>
// 											<SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-[10rem]">
// 												<SelectItem value="all">All shifts</SelectItem>
// 												<SelectItem value="active">Active only</SelectItem>
// 												<SelectItem value="inactive">Inactive only</SelectItem>
// 											</SelectContent>
// 										</Select>
// 									</div>
// 									<Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading} className="w-full gap-2 sm:col-span-2 lg:col-span-1 lg:w-auto">
// 										<RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
// 										Refresh
// 									</Button>
// 								</div>
// 							}
// 						/>
// 					</div>
// 				</div>
// 			</div>

// 			{error && (
// 				<Alert variant="destructive">
// 					<AlertCircle className="h-4 w-4" />
// 					<AlertDescription>{error}</AlertDescription>
// 				</Alert>
// 			)}

// 			<div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
// 				<div className="mb-4 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
// 					<div>
// 						<h3 className="text-base font-semibold">Shift assignments</h3>
// 						<p className="text-sm text-muted-foreground">
// 							{currentShift
// 								? `Current shift: ${currentShift.shift?.name ?? "—"}`
// 								: "No active shift assignment found for the selected date."}
// 						</p>
// 					</div>
// 					<p className="text-sm text-muted-foreground">
// 						Showing {filteredShifts.length} result(s) on this page
// 					</p>
// 				</div>
// 				<DataTable
// 					data={filteredShifts}
// 					columns={columns}
// 					page={pageIndex}
// 					pageSize={pageSize}
// 					total={pagination.total}
// 					setPage={setPageIndex}
// 					setPageSize={setPageSize}
// 					pagination
// 					columnsBtn={false}
// 					isLoading={loading}
// 					loadingText="Loading your shift assignments…"
// 				/>
// 			</div>
// 		</div>
// 	);
// }
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import axiosInstance from "@/lib/axiosInstance";
import { todayDateStr } from "@/components/common/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/data-table";

import TableToolbar from "@/components/common/table-toolbar";
import { shiftColumns } from "./shift-columns";
import { fmtDate } from "@/components/common/common";
import { MobileCardList } from "../../../components/responsiveness/late-regulation-card";

const PAGE_SIZE = 10;

// ── Mobile card field configs ──────────────────────────────────────────────────

const shiftCardFields = [
	{
		label: "Shift Name",
		accessor: (row) => row.shift?.name || "--",
	},
	{
		label: "Assigned From",
		accessor: (row) => fmtDate(row.assigned_from) || "--",
		className: "text-muted-foreground",
	},
	{
		label: "Assigned To",
		accessor: (row) => fmtDate(row.assigned_to) || "--",
		className: "text-muted-foreground",
	},
	{
		label: "Timing",
		accessor: (row) => {
			const start = row.shift?.start_time || row.shift?.shift_start || "--";
			const end   = row.shift?.end_time   || row.shift?.shift_end   || "--";
			return start === "--" && end === "--" ? "--" : `${start} – ${end}`;
		},
		className: "text-muted-foreground",
	},
];

const shiftCardHighlight = {
	accessor: (row) => {
		const isActive = row?.is_active;
		return (
			<Badge
				variant="outline"
				className={
					isActive
						? "text-xs font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
						: "text-xs font-medium border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300"
				}
			>
				{isActive ? "Active" : "Inactive"}
			</Badge>
		);
	},
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function Shift() {
	const [shifts, setShifts] = useState([]);
	const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);
	const [selectedDate, setSelectedDate] = useState(todayDateStr());
	const [shiftStatus, setShiftStatus] = useState("all");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const statusParams = useMemo(() => {
		if (shiftStatus === "active")   return { is_active: true };
		if (shiftStatus === "inactive") return { is_active: false };
		return {};
	}, [shiftStatus]);

	const fetchShifts = useCallback(async ({ targetPage = 1, limit = pageSize, date = selectedDate, silent = false } = {}) => {
		if (silent) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		setError(null);

		try {
			const response = await axiosInstance.get("/attendance/shifts/me", {
				params: {
					page: targetPage,
					limit,
					...statusParams,
					history: true,
					date,
				},
			});

			setShifts(response.data?.data ?? []);
			setPagination({
				page:  response.data?.pagination?.page  ?? targetPage,
				limit: response.data?.pagination?.limit ?? limit,
				total: response.data?.pagination?.total ?? 0,
				pages: response.data?.pagination?.pages ?? 1,
			});
		} catch (fetchError) {
			setShifts([]);
			setError(fetchError?.response?.data?.message || fetchError?.message || "Unable to load your shifts right now.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [pageSize, selectedDate, statusParams]);

	useEffect(() => {
		fetchShifts({ targetPage: pageIndex + 1, limit: pageSize, date: selectedDate });
	}, [fetchShifts, pageIndex, pageSize, selectedDate]);

	const activeShifts     = useMemo(() => shifts.filter((shift) => shift?.is_active),  [shifts]);
	const historicalShifts = useMemo(() => shifts.filter((shift) => !shift?.is_active), [shifts]);
	const currentShift     = activeShifts[0] ?? null;

	const filteredShifts = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		if (!query) return shifts;

		return shifts.filter((shiftAssignment) => {
			const fullName = `${shiftAssignment.employee?.first_name ?? ""} ${shiftAssignment.employee?.last_name ?? ""}`.toLowerCase();
			return [
				shiftAssignment.shift?.name,
				shiftAssignment.assigned_from,
				shiftAssignment.assigned_to,
				fullName,
			]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		});
	}, [searchTerm, shifts]);

	const columns = useMemo(() => shiftColumns, []);

	const handleDateChange   = (value) => { setSelectedDate(value); setPageIndex(0); };
	const handleStatusChange = (value) => { setShiftStatus(value);  setPageIndex(0); };

	const handleRefresh = () => {
		setShiftStatus("all");
		setSelectedDate(todayDateStr());
		setPageIndex(0);
		setSearchTerm("");
		fetchShifts({ targetPage: 1, limit: pageSize, date: todayDateStr(), silent: true });
	};

	return (
		<div className="space-y-4 pt-4 md:pt-6">

			{/* ── Header card ── */}
			<div className="rounded-2xl border bg-card/80 p-3 sm:p-4 shadow-sm backdrop-blur">
				<div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">

					{/* Left: title + stats */}
					<div className="space-y-3 sm:space-y-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
								<CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								My Shifts
							</div>
							<h2 className="text-lg sm:text-2xl font-semibold tracking-tight">Assigned shift history</h2>
							<p className="max-w-2xl text-[10px] sm:text-sm text-muted-foreground">
								View your active assignment and shift history for the selected date without leaving this page.
							</p>
						</div>

						{/* Stat pills */}
						<div className="flex flex-wrap gap-2 sm:gap-3">
							<div className="rounded-xl border bg-background/60 px-3 py-2">
								<div className="text-[10px] sm:text-xs text-muted-foreground">Total assignments</div>
								<div className="text-base sm:text-lg font-semibold tabular-nums">{pagination.total ?? 0}</div>
							</div>
							<div className="rounded-xl border bg-background/60 px-3 py-2">
								<div className="text-[10px] sm:text-xs text-muted-foreground">Active today</div>
								<div className="text-base sm:text-lg font-semibold tabular-nums">{activeShifts.length}</div>
							</div>
							<div className="rounded-xl border bg-background/60 px-3 py-2">
								<div className="text-[10px] sm:text-xs text-muted-foreground">History on page</div>
								<div className="text-base sm:text-lg font-semibold tabular-nums">{historicalShifts.length}</div>
							</div>
						</div>
					</div>

					{/* Right: filters */}
					<div className="rounded-2xl border bg-background/70 p-3 shadow-sm">
						<TableToolbar
							placeholder="Search shifts on this page…"
							searchValue={searchTerm}
							onSearchChange={setSearchTerm}
							total={filteredShifts.length}
							className="border-0 bg-transparent p-0 shadow-none md:flex-col md:items-stretch lg:flex-row lg:items-end"
							rightSlot={
								<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[11rem_10rem_auto] lg:items-end lg:gap-3">
									<div className="space-y-1.5">
										<Input
											id="shift-date"
											type="date"
											value={selectedDate}
											onChange={(event) => handleDateChange(event.target.value)}
											className="w-full h-8 text-xs sm:h-9 sm:text-sm"
										/>
									</div>
									<div className="space-y-1.5">
										<Select value={shiftStatus} onValueChange={handleStatusChange}>
											<SelectTrigger id="shift-status" className="w-full h-8 text-xs sm:h-9 sm:text-sm">
												<SelectValue placeholder="All shifts" />
											</SelectTrigger>
											<SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-[10rem]">
												<SelectItem value="all"      className="text-xs sm:text-sm">All shifts</SelectItem>
												<SelectItem value="active"   className="text-xs sm:text-sm">Active only</SelectItem>
												<SelectItem value="inactive" className="text-xs sm:text-sm">Inactive only</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<Button
										variant="outline"
										onClick={handleRefresh}
										disabled={refreshing || loading}
										className="w-full h-8 text-xs gap-1.5 sm:h-9 sm:text-sm sm:gap-2 sm:col-span-2 lg:col-span-1 lg:w-auto"
									>
										<RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", refreshing && "animate-spin")} />
										Refresh
									</Button>
								</div>
							}
						/>
					</div>
				</div>
			</div>

			{/* ── Error alert ── */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
				</Alert>
			)}

			{/* ── Table / cards ── */}
			<div className="rounded-2xl border bg-card/70 p-3 sm:p-4 shadow-sm">
				<div className="mb-4 flex flex-col gap-1.5 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="text-sm sm:text-base font-semibold">Shift assignments</h3>
						<p className="text-[10px] sm:text-sm text-muted-foreground">
							{currentShift
								? `Current shift: ${currentShift.shift?.name ?? "—"}`
								: "No active shift assignment found for the selected date."}
						</p>
					</div>
					<p className="text-[10px] sm:text-sm text-muted-foreground">
						Showing {filteredShifts.length} result(s) on this page
					</p>
				</div>

				{/* Desktop: table — unchanged */}
				<div className="hidden md:block">
					<DataTable
						data={filteredShifts}
						columns={columns}
						page={pageIndex}
						pageSize={pageSize}
						total={pagination.total}
						setPage={setPageIndex}
						setPageSize={setPageSize}
						pagination
						columnsBtn={false}
						isLoading={loading}
						loadingText="Loading your shift assignments…"
					/>
				</div>

				{/* Mobile: cards */}
				<div className="block md:hidden">
					<MobileCardList
						data={filteredShifts}
						fields={shiftCardFields}
						highlight={shiftCardHighlight}
						keyExtractor={(row) => row.id || row._id || row.shift?.id}
						isLoading={loading}
						loadingText="Loading your shift assignments…"
						emptyText="No shift assignments found."
					/>
				</div>
			</div>
		</div>
	);
}