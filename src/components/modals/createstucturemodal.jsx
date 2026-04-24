import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { ChevronDown, Plus, RefreshCw, Search } from "lucide-react";
import {
  ComponentEditor,
  EmployeeSearchCombobox,
  inputCls,
  Modal,
  ModalBody,
  ModalHeader,
} from "../modal-components/modalcomponents";
import { cn } from "@/lib/utils";

// ─── usePolicies hook ──────────────────────────────────────────────────────────
export const usePolicies = () => {
  const [policies, setPolicies] = useState({
    attendance: [],
    overtime: [],
    tax: [],
    bonus: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchAllPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRes, overtimeRes, taxRes, bonusRes] = await Promise.allSettled([
        axiosInstance.get("/policies/attendance"),
        axiosInstance.get("/policies/overtime"),
        axiosInstance.get("/policies/tax"),
        axiosInstance.get("/policies/bonus"),
      ]);

      setPolicies({
        attendance: attendanceRes.status === "fulfilled" ? attendanceRes.value.data?.policies || [] : [],
        overtime:   overtimeRes.status   === "fulfilled" ? overtimeRes.value.data?.policies   || [] : [],
        tax:        taxRes.status        === "fulfilled" ? taxRes.value.data?.policies        || [] : [],
        bonus:      bonusRes.status      === "fulfilled" ? bonusRes.value.data?.policies      || [] : [],
      });
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { policies, loading, fetchAllPolicies };
};

// ─── PolicySelect ──────────────────────────────────────────────────────────────
export function PolicySelect({
  value,
  onChange,
  policies,
  placeholder,
  required = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedPolicy = policies.find((p) => p.id === value);
  const filteredPolicies = policies.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          inputCls,
          "w-full text-left flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn(
          "truncate",
          value
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-400 dark:text-gray-500"
        )}>
          {selectedPolicy ? selectedPolicy.name : placeholder || "Select policy"}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform shrink-0 ml-2 text-gray-400 dark:text-gray-500",
            open && "rotate-180"
          )}
        />
      </button>

      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={cn(inputCls, "pl-8")}
                  placeholder="Search policy…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto">
              {filteredPolicies.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 text-center">
                  No policies found
                </div>
              ) : (
                filteredPolicies.map((policy) => (
                  <button
                    key={policy.id}
                    className={cn(
                      "w-full text-left px-4 py-2.5 transition-colors",
                      "border-b border-gray-100 dark:border-gray-700 last:border-0",
                      "hover:bg-gray-50 dark:hover:bg-gray-700",
                      value === policy.id && "bg-gray-50 dark:bg-gray-700/60"
                    )}
                    onClick={() => {
                      onChange(policy.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {policy.name}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {required && !value && !disabled && (
        <p className="text-xs text-red-500 mt-1">Policy required</p>
      )}
    </div>
  );
}

// ─── CreateStructureModal ──────────────────────────────────────────────────────
export default function CreateStructureModal({ open, onClose, onCreate, loading }) {
  const emptyForm = {
    basic_salary: "",
    currency: "PKR",
    name: "",
    attendance_policy_id: "",
    overtime_policy_id: "",
    tax_policy_id: "",
    bonus_policy_id: "",
    effective_from: new Date().toISOString().split("T")[0],
    is_active: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);

  const { policies, fetchAllPolicies } = usePolicies();

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setSelectedEmployee(null);
      setAllowances([]);
      setDeductions([]);
      fetchAllPolicies();
    }
  }, [open, fetchAllPolicies]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPolicy = (k) => (id) => setForm((f) => ({ ...f, [k]: id }));

  const handleSubmit = () => {
    if (!selectedEmployee)                                        return toast.error("Please select an employee");
    if (!form.basic_salary || isNaN(parseFloat(form.basic_salary))) return toast.error("Valid basic salary is required");
    if (!form.attendance_policy_id)                              return toast.error("Attendance policy is required");
    if (!form.overtime_policy_id)                                return toast.error("Overtime policy is required");
    if (!form.tax_policy_id)                                     return toast.error("Tax policy is required");

    const normalizeComponents = (comps) =>
      comps
        .filter((c) => c.name && c.value !== "")
        .map((c) => ({
          name:            c.name,
          type:            c.type || "fixed",
          value:           parseFloat(c.value) || 0,
          basis:           c.basis || "basic_salary",
          apply_proration: c.apply_proration === true,
        }));

    const payload = {
      name:                  form.name?.trim() || `${selectedEmployee.first_name} ${selectedEmployee.last_name} - Salary Structure`,
      currency:              form.currency?.trim() || "PKR",
      employee_id:           selectedEmployee.id,
      attendance_policy_id:  form.attendance_policy_id,
      overtime_policy_id:    form.overtime_policy_id,
      tax_policy_id:         form.tax_policy_id,
      bonus_policy_id:       form.bonus_policy_id || null,
      basic_salary:          parseFloat(form.basic_salary),
      allowances:            normalizeComponents(allowances),
      deductions:            normalizeComponents(deductions),
      effective_from:        form.effective_from,
      is_active:             true,
    };

    onCreate(payload);
  };

  // ── shared label style ──────────────────────────────────────────────────
  const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader icon={Plus} title="New Salary Structure" onClose={onClose} />
      <ModalBody>
        <div className="px-6 py-5 space-y-5">

          {/* Employee */}
          <div>
            <label className={labelCls}>
              Employee <span className="text-red-500">*</span>
            </label>
            <EmployeeSearchCombobox value={selectedEmployee} onChange={setSelectedEmployee} />
          </div>

          {/* Name + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Structure Name</label>
              <input
                className={inputCls}
                placeholder="e.g., Senior Engineer Package"
                value={form.name}
                onChange={setF("name")}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <input className={inputCls} value={form.currency} onChange={setF("currency")} />
            </div>
          </div>

          {/* Basic salary + Effective from */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Basic Salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                className={inputCls}
                value={form.basic_salary}
                onChange={setF("basic_salary")}
              />
            </div>
            <div>
              <label className={labelCls}>Effective From</label>
              <input
                type="date"
                className={inputCls}
                value={form.effective_from}
                onChange={setF("effective_from")}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Policies section — title only, so mt-3 on section header */}
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-3">
            Policies
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Attendance Policy <span className="text-red-500">*</span>
              </label>
              <PolicySelect
                value={form.attendance_policy_id}
                onChange={setPolicy("attendance_policy_id")}
                policies={policies.attendance}
                placeholder="Select attendance policy"
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                Overtime Policy <span className="text-red-500">*</span>
              </label>
              <PolicySelect
                value={form.overtime_policy_id}
                onChange={setPolicy("overtime_policy_id")}
                policies={policies.overtime}
                placeholder="Select overtime policy"
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                Tax Policy <span className="text-red-500">*</span>
              </label>
              <PolicySelect
                value={form.tax_policy_id}
                onChange={setPolicy("tax_policy_id")}
                policies={policies.tax}
                placeholder="Select tax policy"
                required
              />
            </div>
            <div>
              <label className={labelCls}>
                Bonus Policy{" "}
                <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
              </label>
              <PolicySelect
                value={form.bonus_policy_id}
                onChange={setPolicy("bonus_policy_id")}
                policies={policies.bonus}
                placeholder="Select bonus policy"
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          <ComponentEditor
            title="Allowances"
            components={allowances}
            onChange={setAllowances}
            basisOptions={["basic_salary", "gross_salary"]}
          />
          <ComponentEditor
            title="Deductions"
            components={deductions}
            onChange={setDeductions}
            basisOptions={["gross_salary", "basic_salary"]}
          />

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-2 pb-1">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-600/50 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Creating…</>
              ) : (
                "Create Structure"
              )}
            </button>
          </div>

        </div>
      </ModalBody>
    </Modal>
  );
}