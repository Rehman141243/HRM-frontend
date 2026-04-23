import { Building2, DollarSign, Pencil, Percent, TrendingUp, UserCheck } from "lucide-react";
import { fmtPKR, Modal, ModalBody, ModalHeader, normalizeSalaryStructure } from "../modal-components/modalcomponents";
import { cn } from "@/lib/utils";
export default function SalaryStructureModal({ structure, open, onClose, perms, onEdit }) {
    if (!structure) return null;
    const emp = structure.employee || {};
    const s = normalizeSalaryStructure(structure);
  
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
        <ModalHeader
          icon={Building2}
          title="Salary Structure"
          subtitle={`${emp.first_name || ""} ${emp.last_name || ""} · ${emp.designation || "—"}`}
          badge={
            <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold border",
              s.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
              {s.is_active ? "Active" : "Inactive"}
            </span>
          }
          onClose={onClose}
          actions={perms?.canEditStructure && (
            <button onClick={() => onEdit?.(s)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
              <Pencil className="w-3 h-3" />Edit
            </button>
          )}
        />
        <ModalBody>
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><UserCheck className="w-3 h-3" />Employee</p>
                <div className="rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
                  {[["Name", `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"], ["Designation", emp.designation || "—"], ["Department", emp.department || "—"], ["Currency", s.currency || "PKR"], ["Effective From", s.effective_from || "—"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-xs text-gray-500">{l}</span>
                      <span className="text-xs font-semibold text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" />Salary Totals</p>
                <div className="rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
                  <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Basic Salary</span><span className="text-xs font-bold font-mono text-blue-600">{fmtPKR(s.basic_salary)}</span></div>
                  <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Total Allowances</span><span className="text-xs font-bold font-mono text-emerald-600">{fmtPKR(s.allowance_total)}</span></div>
                  <div className="flex justify-between items-center px-4 py-2.5"><span className="text-xs text-gray-500">Total Deductions</span><span className="text-xs font-bold font-mono text-red-600">{fmtPKR(s.deduction_total)}</span></div>
                </div>
              </div>
            </div>
  
            {(s.allowances || []).length > 0 && (
              <>
                <hr className="border-gray-100" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Allowances</p>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-emerald-100/60">
                        {s.allowances.map((a, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 text-gray-700">{a.name}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-700">
                              {a.type === "percentage" ? `${a.value}% of ${(a.basis || "basic_salary").replace(/_/g, " ")}` : fmtPKR(a.value ?? a.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
  
            {(s.deductions || []).length > 0 && (
              <>
                <hr className="border-gray-100" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Percent className="w-3 h-3" />Deductions</p>
                  <div className="rounded-xl border border-red-100 bg-red-50/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-red-100/60">
                        {s.deductions.map((d, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 text-gray-700">{d.name}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600">
                              {d.type === "percentage" ? `${d.value}% of ${(d.basis || "gross_salary").replace(/_/g, " ")}` : fmtPKR(d.value ?? d.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
  
            <hr className="border-gray-100" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Linked Policies</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Attendance", val: s.attendance_policy?.name || (s.attendance_policy_id ? `ID: ${s.attendance_policy_id.slice(0, 8)}…` : null) },
                  { label: "Overtime", val: s.overtime_policy?.name || (s.overtime_policy_id ? `ID: ${s.overtime_policy_id.slice(0, 8)}…` : null) },
                  { label: "Tax", val: s.tax_policy?.name || (s.tax_policy_id ? `ID: ${s.tax_policy_id.slice(0, 8)}…` : null) },
                  { label: "Bonus", val: s.bonus_policy?.name || (s.bonus_policy_id ? `ID: ${s.bonus_policy_id.slice(0, 8)}…` : null) },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">{label}</p>
                    <p className={cn("text-sm font-semibold", val ? "text-gray-900" : "text-gray-300")}>{val || "Not linked"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }