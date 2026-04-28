"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, CalendarDays, FileText, LogIn, LogOut, RefreshCw, Timer, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import KpiCard, { fmtTime } from "@/components/common/common";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceReports from "@/containers/shared/hr-manager-employee/attendance-reports/attendance-reports";
import LateRegularization from "@/containers/shared/hr-manager-employee/late-regularization/late-regularization";

function fmtLocalTime(localIso) {
	if (!localIso) return null;

	const parsed = new Date(localIso);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	const fallback = localIso.split("T")[1] || localIso;
	return fallback.slice(0, 5);
}

export default function Attendance({ initialTab = "checkin", basePath } = {}) {
	const router = useRouter();
	const pathname = usePathname();
	const [activeTab, setActiveTab] = useState(initialTab);
	const [currentStatus, setCurrentStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [notes, setNotes] = useState("");

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

	const attendanceBasePath = useMemo(() => {
		if (basePath) return basePath;
		if (pathname?.startsWith("/hr")) return "/hr/attendance";
		if (pathname?.startsWith("/manager")) return "/manager/attendance";
		return "/employee/attendance";
	}, [basePath, pathname]);

	const tabRoutes = useMemo(() => ({
		checkin: attendanceBasePath,
		reports: `${attendanceBasePath}/reports`,
		regularization: `${attendanceBasePath}/regularization`,
	}), [attendanceBasePath]);

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	const handleTabChange = (nextTab) => {
		setActiveTab(nextTab);
		const route = tabRoutes[nextTab];
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
			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
				<TabsList className="inline-flex w-fit flex-wrap justify-start gap-2 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm">
					<TabsTrigger value="checkin" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
						<LogIn className="h-5 w-5" />
						<span>Check-In/Out</span>
					</TabsTrigger>
					<TabsTrigger value="reports" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
						<BarChart3 className="h-5 w-5" />
						<span>Reports</span>
					</TabsTrigger>
					<TabsTrigger value="regularization" className="flex-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
						<FileText className="h-5 w-5" />
						<span>Regularization</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="checkin" className="mt-4 space-y-4">
					<Card className="overflow-hidden border-border/60 bg-transparent py-0 shadow-sm">
						<div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 text-white ">
							<div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-stretch">
								<div className="flex h-full flex-col justify-between gap-4">
									<div className="space-y-3">
										<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
											<Activity className="h-3.5 w-3.5" />
											{loading ? "Loading attendance" : `Status: ${statusTone.label}`}
										</div>
										<div>
											<h2 className="text-xl font-semibold sm:text-2xl">Daily Attendance</h2>
											<p className="mt-1 max-w-2xl text-sm text-white/70">
												Check in or out from a single panel, then review your attendance summary below.
											</p>
											{currentStatus?.shift?.start_time && currentStatus?.shift?.end_time && (
												<p className="mt-2 text-xs text-white/60">
													Shift: <span className="tabular-nums">{currentStatus.shift.start_time.slice(0, 5)} - {currentStatus.shift.end_time.slice(0, 5)}</span>
												</p>
											)}
										</div>
									</div>

									<div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
										<div>
											<p className="text-xs uppercase tracking-wide text-white/50">Check In (Local)</p>
											<p className="mt-1 text-sm font-medium tabular-nums text-white">{fmtLocalTime(currentStatus?.check_in_time_local) || (currentStatus?.check_in_time ? fmtTime(currentStatus.check_in_time) : "--")}</p>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-white/50">Check Out (Local)</p>
											<p className="mt-1 text-sm font-medium tabular-nums text-white">{fmtLocalTime(currentStatus?.check_out_time_local) || (currentStatus?.check_out_time ? fmtTime(currentStatus.check_out_time) : "--")}</p>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-white/50">Worked / Shift</p>
											<p className="mt-1 text-sm font-medium tabular-nums text-white">{currentStatus?.worked_hours ?? currentStatus?.duration_hours ?? 0}h / {currentStatus?.shift_hours ?? currentStatus?.shift?.duration_hours ?? 0}h</p>
										</div>
									</div>
								</div>

								<div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
									<div className="space-y-1">
										<p className="text-sm font-medium text-white/90">Attendance note</p>
										<p className="text-xs text-white/50">Add a short note before checking in or out.</p>
									</div>

									<Textarea
										value={notes}
										onChange={(event) => setNotes(event.target.value)}
										rows={4}
										placeholder="Add a note for your attendance action"
										className="min-h-28 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/30"
									/>

									<div className="flex flex-wrap gap-2">
										<Button
											type="button"
											onClick={() => submitAttendance("/attendance/check-in", "Checked in successfully", "Checked in from office")}
											disabled={!canCheckIn || actionLoading}
											className="min-w-32 bg-emerald-500 text-white hover:bg-emerald-600"
										>
											<LogIn className="mr-2 h-4 w-4" />
											Check In
										</Button>
										<Button
											type="button"
											onClick={() => submitAttendance("/attendance/check-out", "Checked out successfully", "End of shift")}
											disabled={!canCheckOut || actionLoading}
											variant="secondary"
											className="min-w-32 bg-white/10 text-white hover:bg-white/15"
										>
											<LogOut className="mr-2 h-4 w-4" />
											Check Out
										</Button>
										<Button
											type="button"
											onClick={fetchStatus}
											disabled={loading || actionLoading}
											variant="ghost"
											className="text-white hover:bg-white/10 hover:text-white"
										>
											<RefreshCw className={`mr-2 h-4 w-4 ${loading || actionLoading ? "animate-spin" : ""}`} />
											Refresh
										</Button>
									</div>
								</div>
							</div>
						</div>

					</Card>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<KpiCard icon={Activity} label="Today's Status" value={loading ? "—" : statusTone.label} hint={currentStatus?.check_in_time_local ? `In: ${fmtLocalTime(currentStatus.check_in_time_local)}` : currentStatus?.check_in_time ? `In: ${fmtTime(currentStatus.check_in_time)}` : "Not checked in"} accent={statusTone.accent} loading={loading} />
						<KpiCard icon={Timer} label="Today's Hours" value={loading ? "—" : currentStatus?.duration_hours ? `${currentStatus.duration_hours}h` : punchStatus === "CHECKED_IN" ? "In progress" : "—"} hint={currentStatus?.check_out_time_local ? `Out: ${fmtLocalTime(currentStatus.check_out_time_local)}` : currentStatus?.check_out_time ? `Out: ${fmtTime(currentStatus.check_out_time)}` : "Still working"} accent="blue" loading={loading} />
						<KpiCard icon={CalendarDays} label="Leave Status" value={loading ? "—" : currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave" ? "On Leave" : "—"} hint={currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave" ? "Approved leave" : "No leave today"} accent="amber" loading={loading} />
						<KpiCard icon={TrendingUp} label="Overtime" value="View" hint="Check requests tab" accent="purple" loading={loading} />
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
