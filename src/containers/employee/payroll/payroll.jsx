'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { MONTH_NAMES, MONTH_SHORT, fmtPKR, normalizePayroll } from "@/components/modal-components/modalcomponents";
import { CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getPayrollColumns } from "./payroll-columns";
import { useRouter } from "next/navigation";

export default function Payroll() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  const [myLoading, setMyLoading] = useState(false);
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [myPagination, setMyPagination] = useState({ total: 0, pages: 1 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [myFilterStatus, setMyFilterStatus] = useState("all");
  const [myFilterMonth, setMyFilterMonth] = useState("all");
  const [myFilterYear, setMyFilterYear] = useState(String(new Date().getFullYear()));

  const employeeUserId = useMemo(
    () => user?.employee_id ?? null,
    [user]
  );

  const normalizedPayrolls = useMemo(
    () => (Array.isArray(myPayrolls) ? myPayrolls.map((item) => normalizePayroll(item)) : []),
    [myPayrolls]
  );

  const totalPayrolls = useMemo(() => {
    const raw =
      myPagination?.total ??
      myPagination?.totalItems ??
      myPagination?.total_items ??
      myPagination?.count ??
      myPagination?.itemCount ??
      myPagination?.recordsTotal;

    const parsed = Number(raw);
    const computed = Number.isFinite(parsed) ? parsed : 0;
    return Math.max(computed, normalizedPayrolls.length);
  }, [myPagination, normalizedPayrolls.length]);

  const filteredPayrolls = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedPayrolls;

    return normalizedPayrolls.filter((payroll) => {
      const periodText = `${MONTH_SHORT[(payroll.period.month || 1) - 1]} ${payroll.period.year}`;
      const values = [
        periodText,
        payroll.status || "",
        String(payroll.period.working_days ?? ""),
        String(payroll.attendance.payable_days ?? ""),
        fmtPKR(payroll.totals.gross_salary),
        fmtPKR(payroll.totals.net_salary),
      ];
      return values.some((value) => String(value).toLowerCase().includes(term));
    });
  }, [normalizedPayrolls, searchTerm]);

  const tableTotal = searchTerm.trim() ? filteredPayrolls.length : totalPayrolls;

  const handleViewPayroll = useCallback(
    (payroll) => {
      if (!payroll?.id) return;
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(`payroll:details:${payroll.id}`, JSON.stringify(payroll));
        }
      } catch {
        // Ignore session storage errors and still navigate.
      }
      router.push(`/employee/payroll/${payroll.id}`);
    },
    [router]
  );

  const payrollColumns = useMemo(
    () => getPayrollColumns({ onView: handleViewPayroll }),
    [handleViewPayroll]
  );

  const loadMyPayrolls = useCallback(
    async (pageNumber = pageIndex + 1, size = pageSize) => {
      if (!employeeUserId) return;

      setMyLoading(true);
      try {
        // Always send all filters as query params
        const params = {
          page: pageNumber,
          limit: size,
          month: myFilterMonth !== "all" ? Number(myFilterMonth) : undefined,
          year: myFilterYear || undefined,
          status: myFilterStatus !== "all" ? myFilterStatus : undefined,
        };

        const res = await axiosInstance.get(`/payroll/${employeeUserId}`, { params });
        const payload = res.data ?? {};

        let records = [];
        let total = 0;
        if (Array.isArray(payload.payrolls)) {
          records = payload.payrolls;
          total = records.length;
        } else if (payload.payroll) {
          records = [payload.payroll];
          total = 1;
        }
        const pagination = payload.pagination ?? { total, pages: 1 };
        setMyPayrolls(records);
        setMyPagination(pagination);
      } catch (error) {
        // Only show toast if it's not just 'not found' (no data)
        if (error.response?.status !== 404 && error.message !== 'Payroll not found for the selected period') {
          toast.error(extractErrorMessage(error, "Failed to fetch your payrolls"));
        }
        setMyPayrolls([]);
        setMyPagination({ total: 0, pages: 1 });
      } finally {
        setMyLoading(false);
      }
    },
    [employeeUserId, myFilterStatus, myFilterMonth, myFilterYear, pageIndex, pageSize]
  );

  useEffect(() => {
    if (!employeeUserId) return;
    loadMyPayrolls(1, pageSize);
  }, [employeeUserId, loadMyPayrolls, pageSize]);

  const handleApplyFilters = () => {
    setPageIndex(0);
    loadMyPayrolls(1, pageSize);
  };

  const handleRefresh = () => {
    setMyFilterStatus("all");
    setMyFilterMonth("all");
    setMyFilterYear(String(new Date().getFullYear()));
    setPageIndex(0);
    setSearchTerm("");
    loadMyPayrolls(1, pageSize);
  };

  return (
    <div className="flex flex-col gap-6 mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Review payroll history, apply filters, and open payslips.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-end">
          <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-4">
          <TableToolbar
            placeholder="Search period, status, or amounts..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            className="mb-4"
            rightSlot={
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={myFilterStatus} onValueChange={setMyFilterStatus}>
                    <SelectTrigger className="h-8 w-[130px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Month</Label>
                  <Select value={myFilterMonth} onValueChange={setMyFilterMonth}>
                    <SelectTrigger className="h-8 w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                      <SelectItem value="all">All Months</SelectItem>
                      {MONTH_NAMES.map((month, index) => (
                        <SelectItem key={month} value={String(index + 1)}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Input
                    className="h-8 w-20 text-sm"
                    type="number"
                    min="2000"
                    max="2100"
                    value={myFilterYear}
                    onChange={(e) => setMyFilterYear(e.target.value)}
                  />
                </div>
                <Button size="sm" className="h-8" onClick={handleApplyFilters}>Apply</Button>
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{tableTotal}</span> records
                </span>
              </div>
            }
          />

          <DataTable
            data={filteredPayrolls}
            columns={payrollColumns}
            page={pageIndex}
            pageSize={pageSize}
            total={tableTotal}
            setPage={(nextPage) => {
              setPageIndex(nextPage);
              if (!searchTerm.trim()) {
                loadMyPayrolls(nextPage + 1, pageSize);
              }
            }}
            setPageSize={(nextSize) => {
              setPageIndex(0);
              setPageSize(nextSize);
              if (!searchTerm.trim()) {
                loadMyPayrolls(1, nextSize);
              }
            }}
            columnsBtn={false}
            isLoading={myLoading}
            loadingText="Loading payrolls..."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function extractErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}
