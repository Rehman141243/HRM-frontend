'use client'
import { ChevronLeft, ChevronRight, CreditCard, Eye, FileText, PlayCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { EmptyState, fmtNum, fmtPKR, Modal, ModalBody, ModalHeader, MONTH_SHORT, normalizePayroll, StatusBadge } from "../modal-components/modalcomponents";

export default function EmployeePayrollHistoryModal({ employee, open, onClose, perms, onSelectPayroll, onGenerate, actionLoading }) {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  
    useEffect(() => {
      if (open && employee?.id) fetchPayrolls(1);
      else { setPayrolls([]); setPage(1); }
    }, [open, employee?.id]);
  
    useEffect(() => {
      if (open && employee?.id && !actionLoading) fetchPayrolls(page);
    }, [actionLoading]);
  
    const fetchPayrolls = async (p) => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/payroll/${employee.id}`, { params: { page: p, limit: 8 } });
        const d = res.data;
        if (d.payroll) { setPayrolls([d.payroll]); setPagination({ total: 1, pages: 1 }); }
        else { setPayrolls(d.payrolls || []); setPagination(d.pagination || { total: 0, pages: 1 }); }
      } catch (e) {
        if (e.response?.status !== 404) toast.error(extractErrorMessage(e, "Failed to load payrolls"));
        setPayrolls([]);
      } finally { setLoading(false); }
    };
  
    const empName = employee ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() : "";
  
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-4xl">
        <ModalHeader
          icon={CreditCard}
          title={`${empName} — Payroll History`}
          subtitle={`${employee?.designation || "—"}${employee?.department ? ` · ${employee.department}` : ""}${employee?.employee_id ? ` · ID: ${employee.employee_id}` : ""}`}
          onClose={onClose}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => fetchPayrolls(page)} disabled={loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50">
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
              {perms.canGeneratePayroll && (
                <button onClick={() => onGenerate(employee)}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors">
                  <PlayCircle className="w-3.5 h-3.5" />Generate
                </button>
              )}
            </div>
          }
        />
        <ModalBody>
          {loading ? (
            <EmptyState icon={RefreshCw} message="Loading payroll history…" />
          ) : payrolls.length === 0 ? (
            <EmptyState icon={FileText} message={`No payroll records found for ${empName}.`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800">
                    {["Period", "Working Days", "Payable Days", "Gross Salary", "Deductions", "Net Salary", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest dark:text-white text-gray-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payrolls.map((p, i) => {
                    const n = normalizePayroll(p);
                    return (
                      <tr key={n.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/10 cursor-pointer transition-colors" onClick={() => onSelectPayroll(n)}>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{MONTH_SHORT[(n.period.month || 1) - 1]} {n.period.year}</td>
                        <td className="px-4 py-3 text-center tabular-nums text-gray-500 dark:text-white">{fmtNum(n.period.working_days)}</td>
                        <td className="px-4 py-3 text-center tabular-nums font-bold text-blue-600">{fmtNum(n.attendance.payable_days)}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-xs text-gray-600 dark:text-white">{fmtPKR(n.totals.gross_salary)}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-xs text-red-600">−{fmtPKR(n.totals.deductions_total)}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-xs font-bold text-gray-900 dark:text-white">{fmtPKR(n.totals.net_salary)}</td>
                        <td className="px-4 py-3"><StatusBadge status={n.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={(e) => { e.stopPropagation(); onSelectPayroll(n); }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                            <Eye className="w-3.5 h-3.5" />View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
              <span className="text-xs text-gray-400">{pagination.total} record{pagination.total !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); fetchPayrolls(p); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 tabular-nums">Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => { const p = page + 1; setPage(p); fetchPayrolls(p); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    );
  }