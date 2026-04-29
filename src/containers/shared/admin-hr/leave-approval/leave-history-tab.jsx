"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";

import { historyColumns } from "./leave-approval-columns";

const isSet = (value) => value !== undefined && value !== null && value !== "" && value !== "all";

export default function HistoryTab({
  role,
  refreshKey,
  filters = {},
  onClearFilters,
  onStatusChange,
  onManagerStatusChange,
  onHrStatusChange,
  onLeaveTypeChange,
  onEmployeeIdChange,
  onStartDateChange,
  onEndDateChange,
  onSortOrderChange,
}) {
  const {
    statusFilter,
    managerStatusFilter,
    hrStatusFilter,
    leaveTypeFilter,
    employeeIdFilter,
    startDateFilter,
    endDateFilter,
    sortOrder,
  } = filters;

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyPagination, setHistoryPagination] = useState({});
  const [error, setError] = useState(null);

  const historyPageRef = useRef(1);
  const historyPageSizeRef = useRef(10);

  const buildHistoryParams = useCallback(
    (page = historyPageRef.current, limit = historyPageSizeRef.current) => {
      const params = { page, limit };

      if (isSet(statusFilter)) params.status = statusFilter;
      if (isSet(managerStatusFilter)) params.manager_status = managerStatusFilter;
      if (isSet(hrStatusFilter)) params.hr_status = hrStatusFilter;
      if (isSet(leaveTypeFilter)) params.leave_type = leaveTypeFilter;
      if (employeeIdFilter?.trim()) params.employee_id = employeeIdFilter.trim();
      if (isSet(startDateFilter)) params.start_date = startDateFilter;
      if (isSet(endDateFilter)) params.end_date = endDateFilter;
      if (isSet(sortOrder)) params.sortOrder = sortOrder;

      return params;
    },
    [
      employeeIdFilter,
      endDateFilter,
      hrStatusFilter,
      leaveTypeFilter,
      managerStatusFilter,
      sortOrder,
      startDateFilter,
      statusFilter,
    ]
  );

  const fetchHistory = useCallback(
    async (page = historyPageRef.current, limit = historyPageSizeRef.current) => {
      setHistoryLoading(true);
      setError(null);
      try {
        const endpoint = role === "employee" ? "/leave/my" : "/leaves";
        const res = await axiosInstance.get(endpoint, {
          params: buildHistoryParams(page, limit),
        });

        setHistory(res.data?.leaves ?? []);
        setHistoryPagination(res.data?.pagination ?? {});
      } catch {
        setError("Unable to load history.");
        setHistory([]);
        setHistoryPagination({});
      } finally {
        setHistoryLoading(false);
      }
    },
    [buildHistoryParams, role]
  );

  useEffect(() => {
    fetchHistory(1, historyPageSizeRef.current);
  }, [fetchHistory, refreshKey]);

  const totalHistory = historyPagination.total ?? history.length ?? 0;

  const onHistoryPageChange = (nextPage) => {
    const pageNumber = nextPage + 1;
    historyPageRef.current = pageNumber;
    setHistoryPage(pageNumber);
    fetchHistory(pageNumber, historyPageSizeRef.current);
  };

  const onHistoryPageSizeChange = (nextPageSize) => {
    historyPageSizeRef.current = nextPageSize;
    setHistoryPageSize(nextPageSize);
    historyPageRef.current = 1;
    setHistoryPage(1);
    fetchHistory(1, nextPageSize);
  };

  const retryHistory = () => fetchHistory(historyPageRef.current, historyPageSizeRef.current);
  const hasFilters =
    statusFilter !== "all" ||
    managerStatusFilter !== "all" ||
    hrStatusFilter !== "all" ||
    leaveTypeFilter !== "all" ||
    Boolean(employeeIdFilter?.trim()) ||
    Boolean(startDateFilter) ||
    Boolean(endDateFilter) ||
    sortOrder === "asc";

  const emptyMessage = hasFilters
    ? "No leaves found matching your filters."
    : "No leave history yet.";

  const historyToolbar = (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Select value={sortOrder || "desc"} onValueChange={onSortOrderChange}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={retryHistory} disabled={historyLoading}>
          <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" variant="outline" onClick={onClearFilters} disabled={historyLoading}>
          Reset
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={managerStatusFilter || "all"} onValueChange={onManagerStatusChange}>
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="Manager status" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="all">All Manager Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={hrStatusFilter || "all"} onValueChange={onHrStatusChange}>
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="HR status" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="all">All HR Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={leaveTypeFilter || "all"} onValueChange={onLeaveTypeChange}>
          <SelectTrigger className="h-9 w-full text-xs">
            <SelectValue placeholder="Leave type" />
          </SelectTrigger>
          <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
            <SelectItem value="all">All Leave Types</SelectItem>
            <SelectItem value="full_day">Full Day</SelectItem>
            <SelectItem value="half_day">Half Day</SelectItem>
            <SelectItem value="short_leave">Short Leave</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={startDateFilter || ""}
          onChange={(e) => {
            onStartDateChange(e.target.value);
          }}
          className="h-9 w-full"
        />

        <Input
          type="date"
          value={endDateFilter || ""}
          onChange={(e) => {
            onEndDateChange(e.target.value);
          }}
          className="h-9 w-full"
        />

        <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-4">
          <Button size="sm" onClick={retryHistory} disabled={historyLoading}>
            Apply Filters
          </Button>
          <Button size="sm" variant="outline" onClick={onClearFilters} disabled={historyLoading}>
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={retryHistory}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {historyToolbar}

      {historyLoading || totalHistory > 0 ? (
        <DataTable
          data={history}
          columns={historyColumns}
          page={historyPage - 1}
          pageSize={historyPageSize}
          total={totalHistory}
          setPage={onHistoryPageChange}
          setPageSize={onHistoryPageSizeChange}
          pagination
          columnsBtn={false}
          isLoading={historyLoading}
          loadingText="Loading history…"
        />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          <p>{emptyMessage}</p>
          {hasFilters ? (
            <div className="mt-3 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={onClearFilters} disabled={!onClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
