// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { Activity, BarChart3, CalendarDays, FileText, LogIn, LogOut, RefreshCw, Timer, TrendingUp } from "lucide-react";
// import { toast } from "sonner";

// import KpiCard, { fmtTime } from "@/components/common/common";
// import axiosInstance from "@/lib/axiosInstance";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import AttendanceReports from "@/containers/shared/hr-manager-employee/attendance-reports/attendance-reports";
// import LateRegularization from "@/containers/shared/hr-manager-employee/late-regularization/late-regularization";

// function fmtLocalTime(localIso) {
// 	if (!localIso) return null;

// 	const parsed = new Date(localIso);
// 	if (!Number.isNaN(parsed.getTime())) {
// 		return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// 	}

// 	const fallback = localIso.split("T")[1] || localIso;
// 	return fallback.slice(0, 5);
// }

// export default function Attendance({ initialTab = "checkin", basePath } = {}) {
// 	const router = useRouter();
// 	const pathname = usePathname();
// 	const [activeTab, setActiveTab] = useState(initialTab);
// 	const [currentStatus, setCurrentStatus] = useState(null);
// 	const [loading, setLoading] = useState(true);
// 	const [actionLoading, setActionLoading] = useState(false);
// 	const [notes, setNotes] = useState("");

// 	const fetchStatus = useCallback(async () => {
// 		try {
// 			const res = await axiosInstance.get("/attendance/status");
// 			setCurrentStatus(res.data?.data ?? null);
// 		} catch (requestError) {
// 			console.error("Portal init failed", requestError);
// 			setCurrentStatus(null);
// 		}
// 	}, []);

// 	useEffect(() => {
// 		const init = async () => {
// 			try {
// 				await fetchStatus();
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		init();
// 	}, [fetchStatus]);

// 	const punchStatus = currentStatus?.punch_status;
// 	const canCheckIn = !punchStatus || punchStatus === "NOT_CHECKED_IN" || punchStatus === "CHECKED_OUT";
// 	const canCheckOut = punchStatus === "CHECKED_IN";

// 	const statusTone = useMemo(() => {
// 		if (punchStatus === "CHECKED_IN") return { label: "Active", accent: "green" };
// 		if (punchStatus === "CHECKED_OUT") return { label: "Done", accent: "blue" };
// 		return { label: "Pending", accent: "amber" };
// 	}, [punchStatus]);

// 	const attendanceBasePath = useMemo(() => {
// 		if (basePath) return basePath;
// 		if (pathname?.startsWith("/hr")) return "/hr/attendance";
// 		if (pathname?.startsWith("/manager")) return "/manager/attendance";
// 		return "/employee/attendance";
// 	}, [basePath, pathname]);

// 	const tabRoutes = useMemo(() => ({
// 		checkin: attendanceBasePath,
// 		reports: `${attendanceBasePath}/reports`,
// 		regularization: `${attendanceBasePath}/regularization`,
// 	}), [attendanceBasePath]);

// 	useEffect(() => {
// 		setActiveTab(initialTab);
// 	}, [initialTab]);

// 	const handleTabChange = (nextTab) => {
// 		setActiveTab(nextTab);
// 		const route = tabRoutes[nextTab];
// 		if (route && route !== pathname) {
// 			router.push(route);
// 		}
// 	};

// 	const submitAttendance = async (endpoint, successText, fallbackNotes) => {
// 		setActionLoading(true);
// 		try {
// 			const res = await axiosInstance.post(endpoint, {
// 				notes: notes.trim() || fallbackNotes,
// 			});
// 			toast.success(res.data?.message || successText);
// 			await fetchStatus();
// 		} catch (requestError) {
// 			// Error toast is dispatched by axios interceptor, do not set message here
// 		} finally {
// 			setActionLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="mt-4 flex flex-col space-y-4">
// 			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
// 				<TabsList className="inline-flex w-fit flex-wrap justify-start gap-2 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm">
// 					<TabsTrigger value="checkin" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
// 						<LogIn className="h-5 w-5" />
// 						<span>Check-In/Out</span>
// 					</TabsTrigger>
// 					<TabsTrigger value="reports" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
// 						<BarChart3 className="h-5 w-5" />
// 						<span>Reports</span>
// 					</TabsTrigger>
// 					<TabsTrigger value="regularization" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
// 						<FileText className="h-5 w-5" />
// 						<span>Regularization</span>
// 					</TabsTrigger>
// 				</TabsList>

// 				<TabsContent value="checkin" className="mt-4 space-y-4">
// 					<Card className="overflow-hidden border-border/60 bg-transparent py-0 shadow-sm">
// 						<div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 text-white ">
// 							<div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-stretch">
// 								<div className="flex h-full flex-col justify-between gap-4">
// 									<div className="space-y-3">
// 										<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
// 											<Activity className="h-3.5 w-3.5" />
// 											{loading ? "Loading attendance" : `Status: ${statusTone.label}`}
// 										</div>
// 										<div>
// 											<h2 className="text-xl font-semibold sm:text-2xl">Daily Attendance</h2>
// 											<p className="mt-1 max-w-2xl text-sm text-white/70">
// 												Check in or out from a single panel, then review your attendance summary below.
// 											</p>
// 											{currentStatus?.shift?.start_time && currentStatus?.shift?.end_time && (
// 												<p className="mt-2 text-xs text-white/60">
// 													Shift: <span className="tabular-nums">{currentStatus.shift.start_time.slice(0, 5)} - {currentStatus.shift.end_time.slice(0, 5)}</span>
// 												</p>
// 											)}
// 										</div>
// 									</div>

// 									<div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
// 										<div>
// 											<p className="text-xs uppercase tracking-wide text-white/50">Check In (Local)</p>
// 											<p className="mt-1 text-sm font-medium tabular-nums text-white">{fmtLocalTime(currentStatus?.check_in_time_local) || (currentStatus?.check_in_time ? fmtTime(currentStatus.check_in_time) : "--")}</p>
// 										</div>
// 										<div>
// 											<p className="text-xs uppercase tracking-wide text-white/50">Check Out (Local)</p>
// 											<p className="mt-1 text-sm font-medium tabular-nums text-white">{fmtLocalTime(currentStatus?.check_out_time_local) || (currentStatus?.check_out_time ? fmtTime(currentStatus.check_out_time) : "--")}</p>
// 										</div>
// 										<div>
// 											<p className="text-xs uppercase tracking-wide text-white/50">Worked / Shift</p>
// 											<p className="mt-1 text-sm font-medium tabular-nums text-white">{currentStatus?.worked_hours ?? currentStatus?.duration_hours ?? 0}h / {currentStatus?.shift_hours ?? currentStatus?.shift?.duration_hours ?? 0}h</p>
// 										</div>
// 									</div>
// 								</div>

// 								<div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
// 									<div className="space-y-1">
// 										<p className="text-sm font-medium text-white/90">Attendance note</p>
// 										<p className="text-xs text-white/50">Add a short note before checking in or out.</p>
// 									</div>

// 									<Textarea
// 										value={notes}
// 										onChange={(event) => setNotes(event.target.value)}
// 										rows={4}
// 										placeholder="Add a note for your attendance action"
// 										className="min-h-28 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/30"
// 									/>

// 									<div className="flex flex-wrap gap-2">
// 										<Button
// 											type="button"
// 											onClick={() => submitAttendance("/attendance/check-in", "Checked in successfully", "Checked in from office")}
// 											disabled={!canCheckIn || actionLoading}
// 											className="min-w-32 bg-emerald-500 text-white hover:bg-emerald-600"
// 										>
// 											<LogIn className="mr-2 h-4 w-4" />
// 											Check In
// 										</Button>
// 										<Button
// 											type="button"
// 											onClick={() => submitAttendance("/attendance/check-out", "Checked out successfully", "End of shift")}
// 											disabled={!canCheckOut || actionLoading}
// 											variant="secondary"
// 											className="min-w-32 bg-white/10 text-white hover:bg-white/15"
// 										>
// 											<LogOut className="mr-2 h-4 w-4" />
// 											Check Out
// 										</Button>
// 										<Button
// 											type="button"
// 											onClick={fetchStatus}
// 											disabled={loading || actionLoading}
// 											variant="ghost"
// 											className="text-white hover:bg-white/10 hover:text-white"
// 										>
// 											<RefreshCw className={`mr-2 h-4 w-4 ${loading || actionLoading ? "animate-spin" : ""}`} />
// 											Refresh
// 										</Button>
// 									</div>
// 								</div>
// 							</div>
// 						</div>

// 					</Card>

// 					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
// 						<KpiCard icon={Activity} label="Today's Status" value={loading ? "—" : statusTone.label} hint={currentStatus?.check_in_time_local ? `In: ${fmtLocalTime(currentStatus.check_in_time_local)}` : currentStatus?.check_in_time ? `In: ${fmtTime(currentStatus.check_in_time)}` : "Not checked in"} accent={statusTone.accent} loading={loading} />
// 						<KpiCard icon={Timer} label="Today's Hours" value={loading ? "—" : currentStatus?.duration_hours ? `${currentStatus.duration_hours}h` : punchStatus === "CHECKED_IN" ? "In progress" : "—"} hint={currentStatus?.check_out_time_local ? `Out: ${fmtLocalTime(currentStatus.check_out_time_local)}` : currentStatus?.check_out_time ? `Out: ${fmtTime(currentStatus.check_out_time)}` : "Still working"} accent="blue" loading={loading} />
// 						<KpiCard icon={CalendarDays} label="Leave Status" value={loading ? "—" : currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave" ? "On Leave" : "—"} hint={currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave" ? "Approved leave" : "No leave today"} accent="amber" loading={loading} />
// 						<KpiCard icon={TrendingUp} label="Overtime" value="View" hint="Check requests tab" accent="purple" loading={loading} />
// 					</div>
// 				</TabsContent>

// 				<TabsContent value="reports">
// 					<AttendanceReports />
// 				</TabsContent>

// 				<TabsContent value="regularization">
// 					<LateRegularization />
// 				</TabsContent>
// 			</Tabs>
// 		</div>
// 	);
// }

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, CalendarDays, ChevronDown, FileText, LogIn, LogOut, RefreshCw, Timer, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import KpiCard, { fmtTime } from "@/components/common/common";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceReports from "../attendance-reports/attendance-reports";
import LateRegularization from "../late-regularization/late-regularization";

const TAB_ROUTES = {
	checkin: "/employee/attendance",
	reports: "/employee/attendance/reports",
	regularization: "/employee/attendance/regularization",
};

function fmtLocalTime(localIso) {
	if (!localIso) return null;

	const parsed = new Date(localIso);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	const fallback = localIso.split("T")[1] || localIso;
	return fallback.slice(0, 5);
}

export default function Attendance({ initialTab = "checkin" } = {}) {
	const router = useRouter();
	const pathname = usePathname();
	const [activeTab, setActiveTab] = useState(initialTab);
	const [currentStatus, setCurrentStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [notes, setNotes] = useState("Checked in from office");

	const fetchStatus = useCallback(async () => {
		try {
			const res = await axiosInstance.get("/attendance/status");
			setCurrentStatus(res.data?.data ?? null);
		} catch (requestError) {
			console.error("Portal init failed", requestError);
			setCurrentStatus(null);
		}
	}, []);

	useEffect(() => {
		const init = async () => {
			try {
				await fetchStatus();
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [fetchStatus]);

	const punchStatus = currentStatus?.punch_status;
	const canCheckIn = !punchStatus || punchStatus === "NOT_CHECKED_IN" || punchStatus === "CHECKED_OUT";
	const canCheckOut = punchStatus === "CHECKED_IN";

	const statusTone = useMemo(() => {
		if (punchStatus === "CHECKED_IN") return { label: "Active", accent: "green" };
		if (punchStatus === "CHECKED_OUT") return { label: "Done", accent: "blue" };
		return { label: "Pending", accent: "amber" };
	}, [punchStatus]);

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	const handleTabChange = (nextTab) => {
		setActiveTab(nextTab);
		const route = TAB_ROUTES[nextTab];
		if (route && route !== pathname) {
			router.push(route);
		}
	};

	const submitAttendance = async (endpoint, successText, fallbackNotes) => {
		setActionLoading(true);
		try {
			const res = await axiosInstance.post(endpoint, {
				notes: notes.trim() || fallbackNotes,
			});
			toast.success(res.data?.message || successText);
			await fetchStatus();
		} catch (requestError) {
			// Error toast is dispatched by axios interceptor, do not set message here
		} finally {
			setActionLoading(false);
		}
	};

	return (
		<div className="mt-4 flex flex-col space-y-4">
			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
				{/* ── Mobile only: Radix DropdownMenu (hidden sm+) ── */}
				{(() => {
					const TAB_META = {
						checkin: { label: "Check-In / Out", Icon: LogIn },
						reports: { label: "Reports", Icon: BarChart3 },
						regularization: { label: "Regularization", Icon: FileText },
					};
					const active = TAB_META[activeTab] ?? TAB_META.checkin;
					return (
						<div className="sm:hidden">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground shadow-sm ring-offset-background transition-all duration-150 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 data-[state=open]:bg-accent/60 data-[state=open]:ring-2 data-[state=open]:ring-primary/50">
										<span className="flex items-center gap-2">
											<span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
												<active.Icon className="h-3.5 w-3.5" />
											</span>
											<span className="text-xs font-medium">{active.label}</span>
										</span>
										<ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
									</button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="start"
									sideOffset={6}
									className=" rounded-xl border border-border/60 bg-popover p-1 shadow-lg backdrop-blur-sm"
								>
									{Object.entries(TAB_META).map(([value, { label, Icon }]) => {
										const isActive = activeTab === value;
										return (
											<DropdownMenuItem
												key={value}
												onSelect={() => handleTabChange(value)}
												className={cn(
													"flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
													isActive
														? "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground"
														: "text-foreground focus:bg-accent focus:text-accent-foreground"
												)}
											>
												<span className={cn(
													"flex h-6 w-6 items-center justify-center rounded-md transition-colors",
													isActive
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-muted text-muted-foreground"
												)}>
													<Icon className="h-3.5 w-3.5" />
												</span>
												{label}
												{isActive && (
													<span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
												)}
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				})()}

				{/* ── Desktop: full pill tab bar (hidden on mobile) ── */}
				<TabsList className="hidden sm:inline-flex w-fit gap-1.5 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm">
					<TabsTrigger
						value="checkin"
						className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<LogIn className="h-4 w-4 shrink-0" />
						Check-In/Out
					</TabsTrigger>
					<TabsTrigger
						value="reports"
						className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<BarChart3 className="h-4 w-4 shrink-0" />
						Reports
					</TabsTrigger>
					<TabsTrigger
						value="regularization"
						className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<FileText className="h-4 w-4 shrink-0" />
						Regularization
					</TabsTrigger>
				</TabsList>

		
				<TabsContent value="checkin" className="mt-4 space-y-4">
					<Card className="overflow-hidden border-border/60 bg-transparent py-0 shadow-sm">

					
						<div className="bg-slate-100 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
							<div className="grid gap-5 p-4 sm:p-5 lg:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-stretch">

								{/* ── Left panel ── */}
								<div className="flex h-full flex-col justify-between gap-4">
									<div className="space-y-3">

										{/* Status badge */}
										<div className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-200 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/90">
											<Activity className="h-3 w-3 shrink-0" />
											{loading ? "Loading attendance" : `Status: ${statusTone.label}`}
										</div>

										<div>
											{/* Section title */}
											<h2 className="text-base sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
												Daily Attendance
											</h2>
											{/* Description */}
											<p className="mt-1 max-w-2xl text-[10px] sm:text-xs text-slate-500 dark:text-white/70">
												Check in or out from a single panel, then review your attendance summary below.
											</p>
											{currentStatus?.shift?.start_time && currentStatus?.shift?.end_time && (
												<p className="mt-1.5 text-[10px] sm:text-xs text-slate-400 dark:text-white/60">
													Shift:{" "}
													<span className="tabular-nums">
														{currentStatus.shift.start_time.slice(0, 5)} –{" "}
														{currentStatus.shift.end_time.slice(0, 5)}
													</span>
												</p>
											)}
										</div>
									</div>

									{/* Stats grid */}
									<div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/60 p-3 sm:p-4 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
										<div>
											<p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/50">
												Check In (Local)
											</p>
											<p className="mt-1 text-xs sm:text-sm font-medium tabular-nums text-slate-800 dark:text-white">
												{fmtLocalTime(currentStatus?.check_in_time_local) ||
													(currentStatus?.check_in_time ? fmtTime(currentStatus.check_in_time) : "--")}
											</p>
										</div>
										<div>
											<p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/50">
												Check Out (Local)
											</p>
											<p className="mt-1 text-xs sm:text-sm font-medium tabular-nums text-slate-800 dark:text-white">
												{fmtLocalTime(currentStatus?.check_out_time_local) ||
													(currentStatus?.check_out_time ? fmtTime(currentStatus.check_out_time) : "--")}
											</p>
										</div>
										<div>
											<p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/50">
												Worked / Shift
											</p>
											<p className="mt-1 text-xs sm:text-sm font-medium tabular-nums text-slate-800 dark:text-white">
												{currentStatus?.worked_hours ?? currentStatus?.duration_hours ?? 0}h /{" "}
												{currentStatus?.shift_hours ?? currentStatus?.shift?.duration_hours ?? 0}h
											</p>
										</div>
									</div>
								</div>

								{/* ── Right panel — note input ── */}
								<div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
									<div className="space-y-0.5">
										<p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white/90">
											Attendance note
										</p>
										<p className="text-[10px] sm:text-xs text-slate-400 dark:text-white/50">
											Add a short note before checking in or out.
										</p>
									</div>

									<Textarea
										value={notes}
										onChange={(event) => setNotes(event.target.value)}
										rows={4}
										placeholder="Add a note for your attendance action"
										className="min-h-24 sm:min-h-28 border-slate-200 bg-white/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus-visible:ring-white/30"
									/>

									<div className="flex gap-2">
										<Button
											type="button"
											onClick={() =>
												submitAttendance(
													"/attendance/check-in",
													"Checked in successfully",
													"Checked in from office"
												)
											}
											disabled={!canCheckIn || actionLoading}
											className="min-w-18 sm:min-w-32 text-[10px] sm:text-xs md:text-sm bg-emerald-500 text-white hover:bg-emerald-600"
										>
											<LogIn className="mr-0 h-3 w-3 sm:h-4 sm:w-4" />
											Check In
										</Button>
										<Button
											type="button"
											onClick={() =>
												submitAttendance(
													"/attendance/check-out",
													"Checked out successfully",
													"End of shift"
												)
											}
											disabled={!canCheckOut || actionLoading}
											variant="secondary"
											className="min-w-18 sm:min-w-32 text-[10px] sm:text-xs md:text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
										>
											<LogOut className="mr-0 h-3 w-3 sm:h-4 sm:w-4" />
											Check Out
										</Button>
										<Button
											type="button"
											onClick={fetchStatus}
											disabled={loading || actionLoading}
											variant="ghost"
											className="text-[10px] sm:text-xs md:text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
										>
											<RefreshCw
												className={`mr-0 h-3 w-3 sm:h-4 sm:w-4 ${loading || actionLoading ? "animate-spin" : ""}`}
											/>
											Refresh
										</Button>
									</div>
								</div>

							</div>
						</div>
					</Card>

					{/* KPI cards */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<KpiCard
							icon={Activity}
							label="Today's Status"
							value={loading ? "—" : statusTone.label}
							hint={
								currentStatus?.check_in_time_local
									? `In: ${fmtLocalTime(currentStatus.check_in_time_local)}`
									: currentStatus?.check_in_time
										? `In: ${fmtTime(currentStatus.check_in_time)}`
										: "Not checked in"
							}
							accent={statusTone.accent}
							loading={loading}
						/>
						<KpiCard
							icon={Timer}
							label="Today's Hours"
							value={
								loading
									? "—"
									: currentStatus?.duration_hours
										? `${currentStatus.duration_hours}h`
										: punchStatus === "CHECKED_IN"
											? "In progress"
											: "—"
							}
							hint={
								currentStatus?.check_out_time_local
									? `Out: ${fmtLocalTime(currentStatus.check_out_time_local)}`
									: currentStatus?.check_out_time
										? `Out: ${fmtTime(currentStatus.check_out_time)}`
										: "Still working"
							}
							accent="blue"
							loading={loading}
						/>
						<KpiCard
							icon={CalendarDays}
							label="Leave Status"
							value={
								loading
									? "—"
									: currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave"
										? "On Leave"
										: "—"
							}
							hint={
								currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave"
									? "Approved leave"
									: "No leave today"
							}
							accent="amber"
							loading={loading}
						/>
						<KpiCard
							icon={TrendingUp}
							label="Overtime"
							value="View"
							hint="Check requests tab"
							accent="purple"
							loading={loading}
						/>
					</div>
				</TabsContent>

			
				<TabsContent value="reports">
					<AttendanceReports />
				</TabsContent>

				<TabsContent value="regularization">
					<LateRegularization />
				</TabsContent>
			</Tabs>
		</div>
	);
}