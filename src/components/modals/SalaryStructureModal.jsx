'use client'
import { Building2, DollarSign, Pencil, Percent, TrendingUp, UserCheck } from "lucide-react";
import { fmtPKR, Modal, ModalBody, ModalHeader, normalizeSalaryStructure } from "../modal-components/modalcomponents";
import { cn } from "@/lib/utils";

export default function SalaryStructureModal({ structure, open, onClose, perms, onEdit, policies }) {
  if (!structure) return null;
  const emp = structure.employee || {};
  const s = normalizeSalaryStructure(structure);

  // ── Resolve policy name ──────────────────────────────────────────────────
  // Priority:
  //   1) s[key]?.name        — normalized structure has nested object
  //   2) structure[key]?.name — raw structure has nested object
  //   3) look up by ID from the policies prop passed from parent
  const resolvePolicyName = (key, idKey, policyList = []) => {
    const fromNormalized = s[key]?.name;
    if (fromNormalized) return fromNormalized;

    const fromRaw = structure[key]?.name;
    if (fromRaw) return fromRaw;

    const id = s[idKey] || structure[idKey] || structure[key]?.id || s[key]?.id;
    if (id && policyList.length) {
      const found = policyList.find((p) => p.id === id);
      if (found?.name) return found.name;
    }

    return null;
  };

  const linkedPolicies = [
    {
      label: "Attendance",
      val: resolvePolicyName("attendance_policy", "attendance_policy_id", policies?.attendance),
    },
    {
      label: "Overtime",
      val: resolvePolicyName("overtime_policy", "overtime_policy_id", policies?.overtime),
    },
    {
      label: "Tax",
      val: resolvePolicyName("tax_policy", "tax_policy_id", policies?.tax),
    },
    {
      label: "Bonus",
      val: resolvePolicyName("bonus_policy", "bonus_policy_id", policies?.bonus),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} maxWidth="w-6xl" >
      <ModalHeader
        icon={Building2}
        title="Salary Structure"
        subtitle={`${emp.first_name || ""} ${emp.last_name || ""} · ${emp.designation || "—"}`}
        badge={
          <span className={cn(
            "inline-block px-2 py-0.5 rounded-full text-xs font-semibold border",
            s.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          )}>
            {s.is_active ? "Active" : "Inactive"}
          </span>
        }
        onClose={onClose}
        actions={perms?.canEditStructure && (
          <button
            onClick={() => onEdit?.(s)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Pencil className="w-3 h-3" />Edit
          </button>
        )}
      />
      <ModalBody>
        <div className="px-6 py-5 space-y-5">

          {/* ── Employee + Salary Totals ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />Employee
              </p>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  ["Name",           `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—"],
                  ["Designation",    emp.designation   || "—"],
                  ["Department",     emp.department    || "—"],
                  ["Currency",       s.currency        || "PKR"],
                  ["Effective From", s.effective_from  || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{l}</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />Salary Totals
              </p>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Basic Salary</span>
                  <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{fmtPKR(s.basic_salary)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Allowances</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{fmtPKR(s.allowance_total)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</span>
                  <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400">{fmtPKR(s.deduction_total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Allowances ── */}
          {(s.allowances || []).length > 0 && (
            <>
              <hr className="border-gray-100 dark:border-gray-700" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />Allowances
                </p>
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-emerald-100/60 dark:divide-emerald-900/30">
                      {s.allowances.map((a, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{a.name}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            {a.type === "percentage"
                              ? `${a.value}% of ${(a.basis || "basic_salary").replace(/_/g, " ")}`
                              : fmtPKR(a.value ?? a.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── Deductions ── */}
          {(s.deductions || []).length > 0 && (
            <>
              <hr className="border-gray-100 dark:border-gray-700" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Percent className="w-3 h-3" />Deductions
                </p>
                <div className="rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-900/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-red-100/60 dark:divide-red-900/30">
                      {s.deductions.map((d, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{d.name}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                            {d.type === "percentage"
                              ? `${d.value}% of ${(d.basis || "gross_salary").replace(/_/g, " ")}`
                              : fmtPKR(d.value ?? d.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── Linked Policies ── */}
          <hr className="border-gray-100 dark:border-gray-700" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Linked Policies
            </p>
            <div className="grid grid-cols-2 gap-2">
              {linkedPolicies.map(({ label, val }) => (
                <div
                  key={label}
                  className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 py-3"
                >
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className={cn(
                    "text-sm font-semibold",
                    val ? "text-gray-900 dark:text-gray-100" : "text-gray-300 dark:text-gray-600"
                  )}>
                    {val || "Not linked"}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ModalBody>
    </Modal>
  );
}