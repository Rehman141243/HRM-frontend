'use client'

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { RefreshCw, FileText, Calendar, Clock, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import {
  attendanceDailyColumns,
  attendanceWeeklyColumns,
  attendanceMonthlyColumns,
  attendanceSummaryColumns,
  leavesColumns,
  overtimeColumns,
  assignmentsColumns,
  lateRegularizationColumns,
} from "./reports-columns";

// ─── Constants ───────────────────────────────────────────────────────────────

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();
const firstOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;

const REPORT_TYPES = [
  { key: "attendance",          label: "Attendance",          icon: Calendar },
  { key: "leaves",              label: "Leaves",              icon: FileText },
  { key: "overtime",            label: "Overtime",            icon: Clock },
  { key: "assignments",         label: "Shift Assignments",   icon: Users },
  { key: "late_regularization", label: "Regularizations",     icon: ClipboardList },
];

const ATTENDANCE_SUB_TYPES = [
  { key: "daily",   label: "Daily" },
  { key: "weekly",  label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "summary", label: "Summary" },
];

const REGULARIZATION_TYPES = [
  "late_arrival", "missed_checkin", "early_checkout", "short_hours",
  "shift_mismatch", "system_error", "transport_issue", "weather_issue",
  "medical_reason", "official_work", "emergency", "other",
];

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ summary }) {
  if (!summary || typeof summary !== "object") return null;
  const entries = Object.entries(summary).filter(([, v]) => v != null && typeof v !== "object");
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
            {key.replace(/_/g, " ")}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Filter Input helpers ─────────────────────────────────────────────────────

const inputCls = "h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition w-full";
const selectCls = inputCls;
const labelCls = "block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide";

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col min-w-[140px]">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── Filters per report type ──────────────────────────────────────────────────

function AttendanceFilters({ subType, filters, setFilters }) {
  return (
    <>
      {subType === "daily" && (
        <>
          <FilterField label="Date">
            <input type="date" className={inputCls} value={filters.date ?? todayStr}
              onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
          </FilterField>
          <FilterField label="Department">
            <input type="text" className={inputCls} placeholder="e.g. Engineering" value={filters.department ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} />
          </FilterField>
        </>
      )}
      {subType === "weekly" && (
        <>
          <FilterField label="Week Of (date)">
            <input type="date" className={inputCls} value={filters.week_of ?? todayStr}
              onChange={(e) => setFilters((f) => ({ ...f, week_of: e.target.value }))} />
          </FilterField>
          <FilterField label="Year">
            <input type="number" className={inputCls} value={filters.year ?? currentYear}
              onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))} />
          </FilterField>
        </>
      )}
      {subType === "monthly" && (
        <>
          <FilterField label="Month">
            <select className={selectCls} value={filters.month ?? currentMonth}
              onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Year">
            <input type="number" className={inputCls} value={filters.year ?? currentYear}
              onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))} />
          </FilterField>
          <FilterField label="Department">
            <input type="text" className={inputCls} placeholder="Optional" value={filters.department ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} />
          </FilterField>
        </>
      )}
      {subType === "summary" && (
        <>
          <FilterField label="Start Date">
            <input type="date" className={inputCls} value={filters.start_date ?? firstOfMonth}
              onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))} />
          </FilterField>
          <FilterField label="End Date">
            <input type="date" className={inputCls} value={filters.end_date ?? todayStr}
              onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))} />
          </FilterField>
          <FilterField label="Team ID">
            <input type="text" className={inputCls} placeholder="UUID (optional)" value={filters.team_id ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, team_id: e.target.value }))} />
          </FilterField>
        </>
      )}
    </>
  );
}

function LeavesFilters({ filters, setFilters }) {
  return (
    <>
      <FilterField label="Status">
        <select className={selectCls} value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterField>
      <FilterField label="Manager Status">
        <select className={selectCls} value={filters.manager_status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, manager_status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterField>
      <FilterField label="HR Status">
        <select className={selectCls} value={filters.hr_status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, hr_status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterField>
      <FilterField label="Leave Type">
        <select className={selectCls} value={filters.leave_type ?? ""} onChange={(e) => setFilters((f) => ({ ...f, leave_type: e.target.value }))}>
          <option value="">All</option>
          <option value="full_day">Full Day</option>
          <option value="half_day">Half Day</option>
          <option value="short_leave">Short Leave</option>
        </select>
      </FilterField>
      <FilterField label="Start Date">
        <input type="date" className={inputCls} value={filters.start_date ?? firstOfMonth}
          onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))} />
      </FilterField>
      <FilterField label="End Date">
        <input type="date" className={inputCls} value={filters.end_date ?? todayStr}
          onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))} />
      </FilterField>
    </>
  );
}

function OvertimeFilters({ filters, setFilters }) {
  return (
    <>
      <FilterField label="Status">
        <select className={selectCls} value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterField>
      <FilterField label="Manager Status">
        <select className={selectCls} value={filters.manager_status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, manager_status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterField>
      <FilterField label="HR Status">
        <select className={selectCls} value={filters.hr_status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, hr_status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterField>
    </>
  );
}


function AssignmentsFilters({ filters, setFilters }) {
  return (
    <FilterField label="Active">
      <select className={selectCls} value={filters.is_active ?? ""} onChange={(e) => setFilters((f) => ({ ...f, is_active: e.target.value }))}>
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </FilterField>
  );
}

function LateRegularizationFilters({ filters, setFilters }) {
  return (
    <>
      <FilterField label="Status">
        <select className={selectCls} value={filters.status ?? ""} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterField>
      <FilterField label="Type">
        <select className={selectCls} value={filters.regularization_type ?? ""} onChange={(e) => setFilters((f) => ({ ...f, regularization_type: e.target.value }))}>
          <option value="">All</option>
          {REGULARIZATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </FilterField>
      <FilterField label="Start Date">
        <input type="date" className={inputCls} value={filters.start_date ?? firstOfMonth}
          onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))} />
      </FilterField>
      <FilterField label="End Date">
        <input type="date" className={inputCls} value={filters.end_date ?? todayStr}
          onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))} />
      </FilterField>
    </>
  );
}

// ─── Build API params ─────────────────────────────────────────────────────────

function buildParams(reportType, subType, filters, page, pageSize) {
  const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));

  if (reportType === "attendance") {
    const base = { report_type: "attendance", sub_type: subType };
    if (subType === "daily")   return clean({ ...base, date: filters.date ?? todayStr, department: filters.department });
    if (subType === "weekly")  return clean({ ...base, week_of: filters.week_of ?? todayStr, year: filters.year ?? currentYear });
    if (subType === "monthly") return clean({ ...base, month: filters.month ?? currentMonth, year: filters.year ?? currentYear, department: filters.department });
    if (subType === "summary") return clean({ ...base, start_date: filters.start_date ?? firstOfMonth, end_date: filters.end_date ?? todayStr, team_id: filters.team_id });
  }

  return clean({
    report_type: reportType,
    ...filters,
    page,
    limit: pageSize,
  });
}

// ─── Flatten response data ────────────────────────────────────────────────────

function extractData(reportType, subType, response) {
  if (!response) return { rows: [], summary: null, pagination: null };

  // Unwrap the API envelope: { success, message, data, pagination }
  const payload = response.data !== undefined ? response : { data: response };
  const inner = payload.data;
  const pagination = payload.pagination ?? null;

  if (reportType === "attendance") {
    // Attendance responses nest data inside the inner object
    if (subType === "daily")   return { rows: inner?.records ?? [], summary: inner?.summary ?? null, pagination: null };
    if (subType === "monthly") return { rows: inner?.records ?? [], summary: inner?.summary ?? null, pagination: null };
    if (subType === "summary") return { rows: inner?.employee_metrics ?? [], summary: inner?.summary ?? null, pagination: null };
    if (subType === "weekly") {
      const byEmp = inner?.records_by_employee ?? {};
      const rows = Object.values(byEmp).flatMap(({ employee, days }) =>
        (days ?? []).map((day) => ({ ...day, employee }))
      );
      return { rows, summary: null, pagination: null };
    }
  }

  // All other report types: data is the array, pagination is at top level
  return {
    rows: Array.isArray(inner) ? inner : [],
    summary: inner?.summary ?? null,
    pagination,
  };
}

function getColumns(reportType, subType) {
  if (reportType === "attendance") {
    if (subType === "daily")   return attendanceDailyColumns;
    if (subType === "weekly")  return attendanceWeeklyColumns;
    if (subType === "monthly") return attendanceMonthlyColumns;
    if (subType === "summary") return attendanceSummaryColumns;
  }
  if (reportType === "leaves")              return leavesColumns;
  if (reportType === "overtime")            return overtimeColumns;
  if (reportType === "assignments")         return assignmentsColumns;
  if (reportType === "late_regularization") return lateRegularizationColumns;
  return [];
}

// ─── Default filters per type ─────────────────────────────────────────────────

function defaultFilters(reportType, subType) {
  if (reportType === "attendance") {
    if (subType === "daily")   return { date: todayStr };
    if (subType === "weekly")  return { week_of: todayStr, year: String(currentYear) };
    if (subType === "monthly") return { month: String(currentMonth), year: String(currentYear) };
    if (subType === "summary") return { start_date: firstOfMonth, end_date: todayStr };
  }
  if (reportType === "leaves" || reportType === "late_regularization") {
    return { start_date: firstOfMonth, end_date: todayStr };
  }
  return {};
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reports() {
  const [reportType, setReportType] = useState("attendance");
  const [subType, setSubType]       = useState("daily");
  const [filters, setFilters]       = useState(() => defaultFilters("attendance", "daily"));
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [rows, setRows]             = useState([]);
  const [summary, setSummary]       = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchReport = useCallback(async (rt, st, f, pg, ps) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(rt, st, f, pg, ps);
      const res = await axiosInstance.get("/attendance/reports", { params });
      const { rows: r, summary: s, pagination: p } = extractData(rt, st, res.data);
      setRows(r);
      setSummary(s);
      setPagination(p);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report.");
      setRows([]);
      setSummary(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when type/subtype changes
  useEffect(() => {
    fetchReport(reportType, subType, filters, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, subType]);

  const handleApply = () => {
    setPage(1);
    fetchReport(reportType, subType, filters, 1, pageSize);
  };

  const handleReportTypeChange = (rt) => {
    const newSub = rt === "attendance" ? "daily" : subType;
    const newFilters = defaultFilters(rt, newSub);
    setReportType(rt);
    setSubType(newSub);
    setFilters(newFilters);
    setPage(1);
    fetchReport(rt, newSub, newFilters, 1, pageSize);
  };

  const handleSubTypeChange = (st) => {
    const newFilters = defaultFilters(reportType, st);
    setSubType(st);
    setFilters(newFilters);
    setPage(1);
    fetchReport(reportType, st, newFilters, 1, pageSize);
  };

  const handlePageChange = (nextPage) => {
    const pg = nextPage + 1;
    setPage(pg);
    fetchReport(reportType, subType, filters, pg, pageSize);
  };

  const handlePageSizeChange = (ps) => {
    setPageSize(ps);
    setPage(1);
    fetchReport(reportType, subType, filters, 1, ps);
  };

  const columns = getColumns(reportType, subType);
  const total = pagination?.total ?? pagination?.totalPages != null ? (pagination.total ?? rows.length) : rows.length;

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg border bg-background p-2 shadow-xs">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">View and filter attendance, leave, overtime, and shift data.</p>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleReportTypeChange(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              reportType === key
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Attendance Sub-type Tabs */}
      {reportType === "attendance" && (
        <div className="flex gap-1.5 border-b border-gray-200 dark:border-gray-800">
          {ATTENDANCE_SUB_TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSubTypeChange(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                subType === key
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar with Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            {reportType === "attendance" && (
              <AttendanceFilters subType={subType} filters={filters} setFilters={setFilters} />
            )}
            {reportType === "leaves" && (
              <LeavesFilters filters={filters} setFilters={setFilters} />
            )}
            {reportType === "overtime" && (
              <OvertimeFilters filters={filters} setFilters={setFilters} />
            )}
            {reportType === "assignments" && (
              <AssignmentsFilters filters={filters} setFilters={setFilters} />
            )}
            {reportType === "late_regularization" && (
              <LateRegularizationFilters filters={filters} setFilters={setFilters} />
            )}

            <div className="flex items-end gap-2 ml-auto">
              <Button size="sm" onClick={handleApply} disabled={loading} className="h-8 gap-1.5">
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={handleApply} disabled={loading} className="h-8">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar total count */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <TableToolbar total={rows.length} />
        </div>

        {/* Summary Cards */}
        {summary && !loading && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <SummaryCards summary={summary} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {/* Table */}
        <div className="p-4">
          <DataTable
            data={rows}
            columns={columns}
            page={page - 1}
            pageSize={pageSize}
            total={total}
            setPage={handlePageChange}
            setPageSize={handlePageSizeChange}
            pagination={pagination != null}
            columnsBtn={false}
            isLoading={loading}
            loadingText="Loading report data…"
          />
        </div>
      </div>
    </div>
  );
}
