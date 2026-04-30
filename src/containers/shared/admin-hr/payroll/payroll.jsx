'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  RefreshCw, Plus, Wallet, AlertTriangle, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { buildPayrollColumns } from "./payroll-columns";
import PayrollDetails from "./payroll-details";

// ─── Constants ────────────────────────────────────────────────────────────────

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

const inputCls = "h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition w-full";
const selectCls = inputCls;
const labelCls = "block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide";

// ─── Employee Search Combobox ─────────────────────────────────────────────────

function EmployeeSearch({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    setSearching(true);
    try {
      const res = await axiosInstance.get("/employee", {
        params: { page: 1, limit: 10, search: q || undefined },
      });
      setResults(res.data?.employees ?? res.data?.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const displayName = value
    ? `${value.first_name ?? ""} ${value.last_name ?? ""}`.trim()
    : "";

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          className={cn(inputCls, "pl-9")}
          placeholder="Search employee…"
          value={open ? query : displayName}
          onFocus={() => { setOpen(true); search(query); }}
          onChange={(e) => { setQuery(e.target.value); onChange(null); }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setQuery(""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
          {searching ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No employees found.</p>
          ) : (
            results.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => { onChange(emp); setOpen(false); setQuery(""); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-medium">{`${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim()}</p>
                {(emp.designation || emp.department) && (
                  <p className="text-xs text-muted-foreground">{[emp.designation, emp.department].filter(Boolean).join(" · ")}</p>
                )}
              </button>
            ))
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ─── Generate Modal ───────────────────────────────────────────────────────────

function GenerateModal({ open, onClose, onGenerated }) {
  const [bulk, setBulk] = useState(true);
  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!bulk && !selectedEmployee) {
      toast.error("Please select an employee.");
      return;
    }
    setLoading(true);
    try {
      if (bulk) {
        // Bulk: POST /payroll/generate with { month, year }
        const res = await axiosInstance.post("/payroll/generate", {
          month: Number(month),
          year: Number(year),
        });
        const count = res.data?.payrolls?.length ?? res.data?.total ?? 0;
        toast.success(count > 0 ? `${count} payrolls generated successfully!` : "Payrolls generated successfully!");
      } else {
        // Single: POST /payroll/generate with { employee_id, month, year }
        await axiosInstance.post("/payroll/generate", {
          employee_id: selectedEmployee.id,
          month: Number(month),
          year: Number(year),
        });
        toast.success("Payroll generated successfully!");
      }
      onGenerated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate payroll.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
          <DialogDescription>Generate payroll for one or all employees.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Bulk / Single toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setBulk(true)}
              className={cn("flex-1 py-2 text-sm font-medium transition-colors", bulk ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            >
              All Employees
            </button>
            <button
              onClick={() => setBulk(false)}
              className={cn("flex-1 py-2 text-sm font-medium transition-colors", !bulk ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            >
              Single Employee
            </button>
          </div>

          {!bulk && (
            <div>
              <label className={labelCls}>Employee</label>
              <EmployeeSearch value={selectedEmployee} onChange={setSelectedEmployee} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Month</label>
              <select className={selectCls} value={month} onChange={(e) => setMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <input type="number" className={inputCls} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={loading} className="gap-1.5">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Regenerate Confirm Dialog ────────────────────────────────────────────────

function RegenerateDialog({ open, onClose, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Regenerate Payroll?
          </DialogTitle>
          <DialogDescription>
            This will delete the existing payroll and recalculate everything from scratch using the latest attendance data. The status will reset to <strong>draft</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading} className="gap-1.5">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Payroll Component ───────────────────────────────────────────────────

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [filters, setFilters] = useState({
    month: String(currentMonth),
    year: String(currentYear),
    status: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [actionId, setActionId] = useState(null);
  const [detailPayroll, setDetailPayroll] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [regenerateId, setRegenerateId] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPayrolls = useCallback(async (f = filters, emp = selectedEmployee, pg = page, ps = pageSize) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: ps };
      if (f.month) params.month = f.month;
      if (f.year) params.year = f.year;
      if (f.status) params.status = f.status;
      if (emp?.id) params.employee_id = emp.id;
      
      const res = await axiosInstance.get("/payrolls", { params });
      const data = res.data;
      const list = data?.payrolls ?? (data?.payroll ? [data.payroll] : data?.data ?? []);
      setPayrolls(list);
      setPagination(data?.pagination ?? { total: list.length, pages: 1 });
    } catch {
      toast.error("Failed to load payrolls.");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);

  const handleApply = () => { setPage(1); fetchPayrolls(filters, selectedEmployee, 1, pageSize); };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      const res = await axiosInstance.post(`/payroll/${id}/approve`);
      toast.success("Payroll approved successfully!");
      updateRow(res.data?.payroll);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve payroll.");
    } finally {
      setActionId(null);
    }
  };

  const handleMarkPaid = async (id) => {
    setActionId(id);
    try {
      const res = await axiosInstance.post(`/payroll/${id}/mark-paid`);
      toast.success("Payroll marked as paid!");
      updateRow(res.data?.payroll);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as paid.");
    } finally {
      setActionId(null);
    }
  };

  const handleRegenerate = async () => {
    if (!regenerateId) return;
    setRegenerating(true);
    try {
      const res = await axiosInstance.post(`/payroll/${regenerateId}/regenerate`);
      toast.success("Payroll regenerated successfully!");
      updateRow(res.data?.payroll);
      setRegenerateId(null);
      if (detailPayroll?.id === regenerateId) setDetailPayroll(res.data?.payroll);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to regenerate payroll.");
    } finally {
      setRegenerating(false);
    }
  };

  const handlePayslip = async (id) => {
    setActionId(id);
    try {
      const res = await axiosInstance.get(`/payslip/${id}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      toast.error("Failed to load payslip.");
    } finally {
      setActionId(null);
    }
  };

  const updateRow = (updated) => {
    if (!updated) return;
    setPayrolls((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
    if (detailPayroll?.id === updated.id) setDetailPayroll((prev) => ({ ...prev, ...updated }));
  };

  const columns = buildPayrollColumns({
    onView: setDetailPayroll,
    onApprove: handleApprove,
    onMarkPaid: handleMarkPaid,
    onRegenerate: (id) => setRegenerateId(id),
    onPayslip: handlePayslip,
    actionId,
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border bg-background p-2 shadow-xs">
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
            <p className="text-sm text-muted-foreground">Manage employee payroll — generate, approve, and disburse.</p>
          </div>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Generate Payroll
        </Button>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col min-w-[200px]">
              <label className={labelCls}>Employee</label>
              <EmployeeSearch
                value={selectedEmployee}
                onChange={(emp) => {
                  setSelectedEmployee(emp);
                }}
              />
            </div>
            <div className="flex flex-col min-w-[120px]">
              <label className={labelCls}>Month</label>              <select className={selectCls} value={filters.month} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}>
                <option value="">All</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col min-w-[100px]">
              <label className={labelCls}>Year</label>
              <input type="number" className={inputCls} value={filters.year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))} />
            </div>
            <div className="flex flex-col min-w-[130px]">
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>            </div>
            <div className="flex items-center gap-2 ml-auto">
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

        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <TableToolbar total={pagination.total} />
        </div>

        {/* Table */}
        <div className="p-4">
          <DataTable
            data={payrolls}
            columns={columns}
            page={page - 1}
            pageSize={pageSize}
            total={pagination.total}
            setPage={(nextPage) => {
              const pg = nextPage + 1;
              setPage(pg);
              fetchPayrolls(filters, selectedEmployee, pg, pageSize);
            }}
            setPageSize={(ps) => {
              setPageSize(ps);
              setPage(1);
              fetchPayrolls(filters, selectedEmployee, 1, ps);
            }}
            pagination
            columnsBtn={false}
            isLoading={loading}
            loadingText="Loading payrolls…"
          />
        </div>
      </div>

      {/* Detail Panel */}
      {detailPayroll && (
        <PayrollDetails
          payroll={detailPayroll}
          onClose={() => setDetailPayroll(null)}
          onApprove={handleApprove}
          onMarkPaid={handleMarkPaid}
          onRegenerate={(id) => setRegenerateId(id)}
          onPayslip={handlePayslip}
          actionId={actionId}
        />
      )}

      {/* Generate Modal */}
      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerated={() => fetchPayrolls(filters, selectedEmployee, 1, pageSize)}
      />

      {/* Regenerate Confirm */}
      <RegenerateDialog
        open={!!regenerateId}
        onClose={() => setRegenerateId(null)}
        onConfirm={handleRegenerate}
        loading={regenerating}
      />
    </div>
  );
}
