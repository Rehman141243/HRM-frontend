import {
    Card,
    CardContent,
 
  } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Badge } from "@/components/ui/badge";
// utils/timezone.js or wherever fmtTime is defined
// Make sure fmtTime converts to your target timezone

export const fmtTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi", // ← ADD THIS
  });
};

export const fmtDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Karachi", // ← ADD THIS
  });
};
  
  export const calcDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    try {
      const diff = new Date(checkOut) - new Date(checkIn);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return `${h}h ${m}m`;
    } catch {
      return null;
    }
  };
  
  export const todayDateStr = () => new Date().toISOString().split("T")[0];
  
  // ─── Token / Role helpers ────────────────────────────────────────────────────
  
  export const parseToken = () => {
    try {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      if (!token) return null;
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };
  
  export const getUserRole = () => {
    const payload = parseToken();
    if (!payload) return { role: null, designation: null };
    return {
      role: payload.role ?? null,
      designation: payload.designation ?? null,
      name: payload.name ?? payload.email ?? "User",
      email: payload.email ?? "",
    };
  };
  
  // ─── Shared UI components ────────────────────────────────────────────────────
  
  export  function StatusBadge({ status }) {
    const map = {
      PRESENT:          { label: "Present",        className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
      ABSENT:           { label: "Absent",          className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400" },
      ON_LEAVE:         { label: "On Leave",        className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" },
      ON_LEAVE_WORKING: { label: "Leave + Working", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400" },
      CHECKED_IN:       { label: "Checked In",      className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
      CHECKED_OUT:      { label: "Checked Out",     className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-400" },
      NOT_CHECKED_IN:   { label: "Not Checked In",  className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400" },
      online:           { label: "Present",         className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
      offline:          { label: "Checked Out",     className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-400" },
      leave:            { label: "On Leave",        className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" },
      absent:           { label: "Absent",          className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400" },
      approved:         { label: "Approved",        className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
      pending:          { label: "Pending",         className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" },
      rejected:         { label: "Rejected",        className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400" },
      cancelled:        { label: "Cancelled",       className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400" },
    };
    const config = map[status] || { label: status || "Unknown", className: "bg-zinc-100 text-zinc-600" };
    return (
      <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
        {config.label}
      </Badge>
    );
  }
  
export default function KpiCard({ icon: Icon, label, value, hint, accent, loading }) {
    const accentMap = {
      green:  "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
      amber:  "from-amber-500/10 to-amber-500/5 border-amber-500/20",
      blue:   "from-blue-500/10 to-blue-500/5 border-blue-500/20",
      red:    "from-red-500/10 to-red-500/5 border-red-500/20",
      purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    };
  
    if (loading) {
      return (
        <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border shadow-sm">
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card className={`bg-gradient-to-br ${accentMap[accent] || accentMap.blue} border shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{label}</p>
              <p className="text-xs sm:text-2xl font-bold tabular-nums tracking-tight">{value ?? "—"}</p>
              {hint && <p className="text-[10px] sm:text-xs text-muted-foreground">{hint}</p>}
            </div>
            <div className="rounded-xl bg-background/60 p-2.5 shrink-0 border border-border/40">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  