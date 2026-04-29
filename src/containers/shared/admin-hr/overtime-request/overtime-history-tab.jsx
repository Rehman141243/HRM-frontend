"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import { getHistoryOvertimeColumns } from "./overtime-request-columns";

export default function OvertimeHistoryTab({
  role,
  refreshKey,
  filters = {},
  onStatusChange,
  onClearFilters,
}) {
  const { statusFilter } = filters;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  const pageRef = useRef(1);
  const pageSizeRef = useRef(10);

  const buildParams = useCallback(
    (pageNum = pageRef.current, limit = pageSizeRef.current) => {
      const params = { page: pageNum, limit };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return params;
    },
    [statusFilter]
  );

  const fetchHistory = useCallback(
    async (pageNum = pageRef.current, limit = pageSizeRef.current) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/attendance/overtime-requests", {
          params: buildParams(pageNum, limit),
        });
        let data = res.data?.data ?? [];
        // If 'all', exclude pending records from history
        if (!statusFilter || statusFilter === "all") {
          data = data.filter((item) => item.status !== "pending");
        }
        setHistory(data);
        setPagination(res.data?.pagination ?? {});
      } catch {
        setError("Unable to load overtime history.");
        setHistory([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    },
    [buildParams, statusFilter]
  );

  useEffect(() => {
    fetchHistory(1, pageSizeRef.current);
  }, [fetchHistory, refreshKey]);

  const total = pagination.total ?? history.length ?? 0;

  const onPageChange = (nextPage) => {
    const pageNumber = nextPage + 1;
    pageRef.current = pageNumber;
    setPage(pageNumber);
    fetchHistory(pageNumber, pageSizeRef.current);
  };

  const onPageSizeChange = (nextPageSize) => {
    pageSizeRef.current = nextPageSize;
    setPageSize(nextPageSize);
    pageRef.current = 1;
    setPage(1);
    fetchHistory(1, nextPageSize);
  };

  const retryFetch = () => fetchHistory(pageRef.current, pageSizeRef.current);

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={retryFetch}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <TableToolbar
        total={total}
        rightSlot={
          <div className="flex items-center gap-2">
            <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" side="bottom" sideOffset={6}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={retryFetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" variant="outline" onClick={onClearFilters} disabled={loading}>
              Reset
            </Button>
          </div>
        }
      />

      <DataTable
        data={history}
        columns={getHistoryOvertimeColumns}
        page={page - 1}
        pageSize={pageSize}
        total={total}
        setPage={onPageChange}
        setPageSize={onPageSizeChange}
        columnsBtn={false}
        isLoading={loading}
        loadingText="Loading overtime history…"
        emptyText="No overtime history found."
      />
    </div>
  );
}
