// import { useState } from "react";
// import { fmtNum, fmtPKR, Modal, ModalBody, ModalHeader, MONTH_NAMES, MONTH_SHORT, StatusBadge } from "../modal-components/modalcomponents";
// import { Banknote, BarChart3, Calendar, CheckCircle, CreditCard, Download, Info, Percent, RefreshCw, TrendingUp, UserCheck } from "lucide-react";
// import { cn } from "@/lib/utils";
// export default  function PayrollDetailModal({ payroll, open, onClose, perms, onApprove, onMarkPaid, onRegenerate, onPayslip, actionLoading }) {
//     const [showRegenConfirm, setShowRegenConfirm] = useState(false);
//     if (!payroll) return null;
//     const { employee: emp, period, attendance, totals, components, deductionsBreakdown, tax } = payroll;
//     const lateRule = payroll.summarySnapshot?.late_penalty_rule || {};
//     const taxInfo = tax && tax.mode ? tax : deductionsBreakdown?.tax || {};
  
//     return (
//       <>
//         <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
//           <ModalHeader
//             icon={CreditCard}
//             title={`${emp.first_name} ${emp.last_name} — ${MONTH_SHORT[(period.month || 1) - 1]} ${period.year}`}
//             badge={<StatusBadge status={payroll.status} />}
//             onClose={onClose}
//           />
//           <ModalBody>
//             <div className="px-6 py-5 space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><UserCheck className="w-3 h-3" />Employee</p>
//                   <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
//                     {[["Name", `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"], ["Designation", emp.designation || "—"], ["Department", emp.department || "—"]].map(([l, v]) => (
//                       <div key={l} className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">{l}</span><span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{v}</span></div>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" />Pay Period</p>
//                   <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
//                     <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Period</span><span className="text-xs text-gray-600 dark:text-gray-400">{period.start_date || "—"} → {period.end_date || "—"}</span></div>
//                     <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Working Days</span><span className="text-xs font-semibold">{fmtNum(period.working_days)}</span></div>
//                     <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Payable Days</span><span className="text-xs font-bold text-blue-600">{fmtNum(attendance.payable_days)}</span></div>
//                     <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Proration</span><span className="text-xs text-gray-600 dark:text-gray-400">{attendance.proration_factor_percent != null ? `${attendance.proration_factor_percent}%` : "—"}</span></div>
//                   </div>
//                 </div>
//               </div>
  
//               <div>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" />Attendance Summary</p>
//                 <div className="grid grid-cols-3 gap-2">
//                   {[
//                     { label: "Present", value: fmtNum(attendance.present_days), color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
//                     { label: "Paid Leave", value: fmtNum(attendance.paid_leaves), color: "bg-sky-50 border-sky-100 text-sky-700" },
//                     { label: "Unpaid Leave", value: fmtNum(attendance.unpaid_leaves), color: "bg-amber-50 border-amber-100 text-amber-700" },
//                     { label: "Overtime hrs", value: fmtNum(attendance.overtime_hours), color: "bg-gray-50 border-gray-100 text-gray-700" },
//                     { label: "Late Arrivals", value: fmtNum(attendance.late_arrivals), color: attendance.late_arrivals > 0 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-gray-50 border-gray-100 text-gray-700" },
//                     { label: "Late Penalty Days", value: fmtNum(attendance.late_penalty_days), color: attendance.late_penalty_days > 0 ? "bg-red-50 border-red-100 text-red-700" : "bg-gray-50 border-gray-100 text-gray-700" },
//                   ].map(({ label, value, color }) => (
//                     <div key={label} className={cn("rounded-xl border px-3 py-2.5 text-center", color)}>
//                       <p className="text-lg font-bold tabular-nums">{value}</p>
//                       <p className="text-[10px] font-medium mt-0.5 opacity-70">{label}</p>
//                     </div>
//                   ))}
//                 </div>
//                 {lateRule.late_count_for_unpaid_day && (
//                   <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
//                     <Info className="w-3 h-3" />Late penalty: every {lateRule.late_count_for_unpaid_day} lates = 1 unpaid day{lateRule.applied_unpaid_days_from_late > 0 && ` · ${lateRule.applied_unpaid_days_from_late} applied`}
//                   </p>
//                 )}
//               </div>
  
//               <hr className="border-gray-100 dark:border-gray-800" />
  
//               <div>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Earnings</p>
//                 <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 overflow-hidden">
//                   <table className="w-full text-sm">
//                     <tbody className="divide-y divide-emerald-100/60">
//                       <tr><td className="px-4 py-2.5 text-gray-600">Basic Salary</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">{fmtPKR(totals.basic_salary)}</td></tr>
//                       <tr><td className="px-4 py-2.5 text-gray-600">Allowances ({(components.allowances || []).length})</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">{fmtPKR(totals.allowances_total)}</td></tr>
//                       {(components.allowances || []).map((a, i) => (
//                         <tr key={i} className="bg-emerald-50/60"><td className="px-4 py-1.5 pl-8 text-xs text-gray-400">↳ {a.name}</td><td className="px-4 py-1.5 text-right font-mono text-xs text-gray-400">{fmtPKR(a.amount)}</td></tr>
//                       ))}
//                       <tr><td className="px-4 py-2.5 text-gray-600">Bonuses ({(components.bonuses || []).length})</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">{fmtPKR(totals.bonuses_total)}</td></tr>
//                       {(components.bonuses || []).map((b, i) => (
//                         <tr key={i} className="bg-emerald-50/60"><td className="px-4 py-1.5 pl-8 text-xs text-gray-400">↳ {b.name}{b.eligible === false ? " (ineligible)" : ""}</td><td className="px-4 py-1.5 text-right font-mono text-xs text-gray-400">{fmtPKR(b.amount)}</td></tr>
//                       ))}
//                       {totals.overtime_amount > 0 && (
//                         <tr><td className="px-4 py-2.5 text-gray-600">Overtime Pay</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">{fmtPKR(totals.overtime_amount)}</td></tr>
//                       )}
//                       <tr className="bg-emerald-50 font-bold">
//                         <td className="px-4 py-3 font-bold">Gross Salary</td>
//                         <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 text-base">{fmtPKR(totals.gross_salary)}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
  
//               <div>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Percent className="w-3 h-3" />Deductions</p>
//                 <div className="rounded-xl border border-red-100 bg-red-50/40 overflow-hidden">
//                   <table className="w-full text-sm">
//                     <tbody className="divide-y divide-red-100/60">
//                       <tr><td className="px-4 py-2.5 text-gray-600">Tax</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600">{fmtPKR(totals.tax_amount)}</td></tr>
//                       {taxInfo.mode && (
//                         <tr className="bg-red-50/60"><td className="px-4 py-1.5 pl-8 text-xs text-gray-400">↳ Mode: {taxInfo.mode}{taxInfo.applicable_rate != null ? ` · ${taxInfo.applicable_rate}% rate` : ""}</td><td></td></tr>
//                       )}
//                       {(components.deductions || []).map((d, i) => (
//                         <tr key={i}><td className="px-4 py-2.5 text-gray-600">{d.name}</td><td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600">{fmtPKR(d.amount)}</td></tr>
//                       ))}
//                       <tr className="bg-red-50 font-bold">
//                         <td className="px-4 py-3 font-bold">Total Deductions</td>
//                         <td className="px-4 py-3 text-right font-mono font-bold text-red-600 text-base">−{fmtPKR(totals.deductions_total)}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
  
//               <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl px-6 py-5 flex justify-between items-center">
//                 <div>
//                   <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Net Salary</p>
//                   <p className="text-white text-3xl font-bold tabular-nums">{fmtPKR(totals.net_salary)}</p>
//                   <p className="text-white/40 text-xs mt-1">{MONTH_NAMES[(period.month || 1) - 1]} {period.year}</p>
//                 </div>
//                 <Banknote className="w-12 h-12 text-white/20" />
//               </div>
  
//               <div className="flex flex-wrap gap-2 pb-1">
//                 {perms.canApprovePayroll && payroll.status === "draft" && (
//                   <button onClick={() => onApprove(payroll.id)} disabled={actionLoading}
//                     className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
//                     <CheckCircle className="w-3.5 h-3.5" />Approve
//                   </button>
//                 )}
//                 {perms.canMarkPaid && payroll.status === "processed" && (
//                   <button onClick={() => onMarkPaid(payroll.id)} disabled={actionLoading}
//                     className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
//                     <Banknote className="w-3.5 h-3.5" />Mark as Paid
//                   </button>
//                 )}
//                 {perms.canRegeneratePayroll && payroll.status === "draft" && (
//                   <button onClick={() => setShowRegenConfirm(true)} disabled={actionLoading}
//                     className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50">
//                     <RefreshCw className="w-3.5 h-3.5" />Regenerate
//                   </button>
//                 )}
//                 <button onClick={() => onPayslip(payroll)} disabled={actionLoading}
//                   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50">
//                   <Download className="w-3.5 h-3.5" />Download Payslip
//                 </button>
//               </div>
//             </div>
//           </ModalBody>
//         </Modal>
  
//         <Modal open={showRegenConfirm} onClose={() => setShowRegenConfirm(false)} maxWidth="max-w-sm">
//           <ModalHeader title="Regenerate Payroll?" onClose={() => setShowRegenConfirm(false)} />
//           <ModalBody>
//             <div className="px-6 py-5 space-y-4">
//               <p className="text-sm text-gray-600">This will delete the current draft and recalculate from scratch. This cannot be undone.</p>
//               <div className="flex justify-end gap-2">
//                 <button onClick={() => setShowRegenConfirm(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
//                 <button onClick={() => { setShowRegenConfirm(false); onRegenerate(payroll.id); }} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors">Yes, Regenerate</button>
//               </div>
//             </div>
//           </ModalBody>
//         </Modal>
//       </>
//     );
//   }

import { useState } from "react";
import { fmtNum, fmtPKR, Modal, ModalBody, ModalHeader, MONTH_NAMES, MONTH_SHORT, StatusBadge } from "../modal-components/modalcomponents";
import { Banknote, BarChart3, Calendar, CheckCircle, CreditCard, Download, Info, Percent, RefreshCw, TrendingUp, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PayrollDetailModal({ payroll, open, onClose, perms, onApprove, onMarkPaid, onRegenerate, onPayslip, actionLoading }) {
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  if (!payroll) return null;
  const { employee: emp, period, attendance, totals, components, deductionsBreakdown, tax } = payroll;
  const lateRule = payroll.summarySnapshot?.late_penalty_rule || {};
  const taxInfo = tax && tax.mode ? tax : deductionsBreakdown?.tax || {};

  return (
    <>
      <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
        <ModalHeader
          icon={CreditCard}
          title={`${emp.first_name} ${emp.last_name} — ${MONTH_SHORT[(period.month || 1) - 1]} ${period.year}`}
          badge={<StatusBadge status={payroll.status} />}
          onClose={onClose}
        />
        <ModalBody>
          <div className="px-6 py-5 space-y-6">

            {/* ── Employee + Pay Period ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />Employee
                </p>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {[
                    ["Name", `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"],
                    ["Designation", emp.designation || "—"],
                    ["Department", emp.department || "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{l}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Pay Period
                </p>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Period</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{period.start_date || "—"} → {period.end_date || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Working Days</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{fmtNum(period.working_days)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Payable Days</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmtNum(attendance.payable_days)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Proration</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{attendance.proration_factor_percent != null ? `${attendance.proration_factor_percent}%` : "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Attendance Summary ── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />Attendance Summary
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Present", value: fmtNum(attendance.present_days), color: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400" },
                  { label: "Paid Leave", value: fmtNum(attendance.paid_leaves), color: "bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-400" },
                  { label: "Unpaid Leave", value: fmtNum(attendance.unpaid_leaves), color: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400" },
                  { label: "Overtime hrs", value: fmtNum(attendance.overtime_hours), color: "bg-gray-50 border-gray-100 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300" },
                  {
                    label: "Late Arrivals", value: fmtNum(attendance.late_arrivals),
                    color: attendance.late_arrivals > 0
                      ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                      : "bg-gray-50 border-gray-100 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  },
                  {
                    label: "Late Penalty Days", value: fmtNum(attendance.late_penalty_days),
                    color: attendance.late_penalty_days > 0
                      ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                      : "bg-gray-50 border-gray-100 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className={cn("rounded-xl border px-3 py-2.5 text-center", color)}>
                    <p className="text-lg font-bold tabular-nums">{value}</p>
                    <p className="text-[10px] font-medium mt-0.5 opacity-70">{label}</p>
                  </div>
                ))}
              </div>
              {lateRule.late_count_for_unpaid_day && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Late penalty: every {lateRule.late_count_for_unpaid_day} lates = 1 unpaid day
                  {lateRule.applied_unpaid_days_from_late > 0 && ` · ${lateRule.applied_unpaid_days_from_late} applied`}
                </p>
              )}
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* ── Earnings ── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />Earnings
              </p>
              <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-900/10 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-emerald-100/60 dark:divide-emerald-900/30">
                    <tr>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Basic Salary</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-gray-100">{fmtPKR(totals.basic_salary)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Allowances ({(components.allowances || []).length})</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">{fmtPKR(totals.allowances_total)}</td>
                    </tr>
                    {(components.allowances || []).map((a, i) => (
                      <tr key={i} className="bg-emerald-50/60 dark:bg-emerald-900/10">
                        <td className="px-4 py-1.5 pl-8 text-xs text-gray-400 dark:text-gray-500">↳ {a.name}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-xs text-gray-400 dark:text-gray-500">{fmtPKR(a.amount)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Bonuses ({(components.bonuses || []).length})</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">{fmtPKR(totals.bonuses_total)}</td>
                    </tr>
                    {(components.bonuses || []).map((b, i) => (
                      <tr key={i} className="bg-emerald-50/60 dark:bg-emerald-900/10">
                        <td className="px-4 py-1.5 pl-8 text-xs text-gray-400 dark:text-gray-500">↳ {b.name}{b.eligible === false ? " (ineligible)" : ""}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-xs text-gray-400 dark:text-gray-500">{fmtPKR(b.amount)}</td>
                      </tr>
                    ))}
                    {totals.overtime_amount > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Overtime Pay</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">{fmtPKR(totals.overtime_amount)}</td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 dark:bg-emerald-900/20 font-bold">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">Gross Salary</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">{fmtPKR(totals.gross_salary)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Deductions ── */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Percent className="w-3 h-3" />Deductions
              </p>
              <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/40 dark:bg-red-900/10 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-red-100/60 dark:divide-red-900/30">
                    <tr>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">Tax</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600 dark:text-red-400">{fmtPKR(totals.tax_amount)}</td>
                    </tr>
                    {taxInfo.mode && (
                      <tr className="bg-red-50/60 dark:bg-red-900/10">
                        <td className="px-4 py-1.5 pl-8 text-xs text-gray-400 dark:text-gray-500">
                          ↳ Mode: {taxInfo.mode}{taxInfo.applicable_rate != null ? ` · ${taxInfo.applicable_rate}% rate` : ""}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    {(components.deductions || []).map((d, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{d.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600 dark:text-red-400">{fmtPKR(d.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-red-50 dark:bg-red-900/20 font-bold">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">Total Deductions</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-red-600 dark:text-red-400 text-base">−{fmtPKR(totals.deductions_total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Net Salary ── */}
            <div className="bg-gray-900 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-2xl px-6 py-5 flex justify-between items-center">
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Net Salary</p>
                <p className="text-white text-3xl font-bold tabular-nums">{fmtPKR(totals.net_salary)}</p>
                <p className="text-white/40 text-xs mt-1">{MONTH_NAMES[(period.month || 1) - 1]} {period.year}</p>
              </div>
              <Banknote className="w-12 h-12 text-white/20" />
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-wrap gap-2 pb-1">
              {perms.canApprovePayroll && payroll.status === "draft" && (
                <button onClick={() => onApprove(payroll.id)} disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                  <CheckCircle className="w-3.5 h-3.5" />Approve
                </button>
              )}
              {perms.canMarkPaid && payroll.status === "processed" && (
                <button onClick={() => onMarkPaid(payroll.id)} disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                  <Banknote className="w-3.5 h-3.5" />Mark as Paid
                </button>
              )}
              {perms.canRegeneratePayroll && payroll.status === "draft" && (
                <button onClick={() => setShowRegenConfirm(true)} disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50">
                  <RefreshCw className="w-3.5 h-3.5" />Regenerate
                </button>
              )}
              <button onClick={() => onPayslip(payroll)} disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50">
                <Download className="w-3.5 h-3.5" />Download Payslip
              </button>
            </div>

          </div>
        </ModalBody>
      </Modal>

      {/* ── Regen Confirm Modal ── */}
      <Modal open={showRegenConfirm} onClose={() => setShowRegenConfirm(false)} maxWidth="max-w-sm">
        <ModalHeader title="Regenerate Payroll?" onClose={() => setShowRegenConfirm(false)} />
        <ModalBody>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will delete the current draft and recalculate from scratch. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRegenConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowRegenConfirm(false); onRegenerate(payroll.id); }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}