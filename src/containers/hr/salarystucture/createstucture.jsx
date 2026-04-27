'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { Plus, RefreshCw, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import {
  ComponentEditor,
  EmployeeSearchCombobox,
  inputCls,
} from "@/components/modal-components/modalcomponents";
import { usePolicies, PolicySelect } from "@/components/modals/createstucturemodal";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

export default function CreateSalaryStructurePage() {
  const router = useRouter();
  const { policies, fetchAllPolicies } = usePolicies();

  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    basic_salary: "",
    currency: "PKR",
    effective_from: new Date().toISOString().split("T")[0],
    is_active: true,
    attendance_policy_id: "",
    overtime_policy_id: "",
    tax_policy_id: "",
    bonus_policy_id: "",
  });

  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPolicy = (k) => (id) => setForm((f) => ({ ...f, [k]: id }));

  const handleSubmit = async () => {
    if (!selectedEmployee) return toast.error("Please select an employee");
    if (!form.basic_salary || isNaN(parseFloat(form.basic_salary))) return toast.error("Valid basic salary is required");
    if (!form.attendance_policy_id) return toast.error("Attendance policy is required");
    if (!form.overtime_policy_id) return toast.error("Overtime policy is required");
    if (!form.tax_policy_id) return toast.error("Tax policy is required");

    const normalizeComponents = (comps) =>
      comps.filter((c) => c.name && c.value !== "").map((c) => ({
        name: c.name,
        type: c.type || "fixed",
        value: parseFloat(c.value) || 0,
        basis: c.basis || "basic_salary",
        apply_proration: c.apply_proration === true,
      }));

    const payload = {
      name: form.name?.trim() || `${selectedEmployee.first_name} ${selectedEmployee.last_name} - Salary Structure`,
      currency: form.currency?.trim() || "PKR",
      employee_id: selectedEmployee.id,
      attendance_policy_id: form.attendance_policy_id,
      overtime_policy_id: form.overtime_policy_id,
      tax_policy_id: form.tax_policy_id,
      bonus_policy_id: form.bonus_policy_id || null,
      basic_salary: parseFloat(form.basic_salary),
      allowances: normalizeComponents(allowances),
      deductions: normalizeComponents(deductions),
      effective_from: form.effective_from,
      is_active: true,
    };

    setLoading(true);
    try {
      await axiosInstance.post("/salary-structures", payload);
      toast.success("Salary structure created successfully!");
      router.back();
    } catch (e) {
      const d = e?.response?.data;
      toast.error(d?.message || d?.error || e?.message || "Failed to create salary structure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <BreadcrumbComponent data={[
        { name: "Compensation Setup", url: "/hr/policies_structure" },
        { name: "Salary Structure", url: "/hr/policies_structure/salary-stucture" },
        { name: "New Structure", url: "/hr/policies_structure/salary-stucture/create" },
      ]} /> */}

      <div className="px-4 sm:px-6 py-8 ">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-lg border bg-background p-2 shadow-xs">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">New Salary Structure</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create a salary structure for an employee.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-6 py-6 space-y-5">

            {/* Employee */}
            <div>
              <label className={labelCls}>Employee <span className="text-red-500">*</span></label>
              <EmployeeSearchCombobox value={selectedEmployee} onChange={setSelectedEmployee} />
            </div>

            {/* Name + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Structure Name</label>
                <input className={inputCls} placeholder="e.g., Senior Engineer Package" value={form.name} onChange={setF("name")} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input className={inputCls} value={form.currency} onChange={setF("currency")} />
              </div>
            </div>

            {/* Basic salary + Effective from */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Basic Salary <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} value={form.basic_salary} onChange={setF("basic_salary")} />
              </div>
              <div>
                <label className={labelCls}>Effective From</label>
                <input type="date" className={inputCls} value={form.effective_from} onChange={setF("effective_from")} />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Policies</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Attendance Policy <span className="text-red-500">*</span></label>
                <PolicySelect value={form.attendance_policy_id} onChange={setPolicy("attendance_policy_id")} policies={policies.attendance} placeholder="Select attendance policy" required />
              </div>
              <div>
                <label className={labelCls}>Overtime Policy <span className="text-red-500">*</span></label>
                <PolicySelect value={form.overtime_policy_id} onChange={setPolicy("overtime_policy_id")} policies={policies.overtime} placeholder="Select overtime policy" required />
              </div>
              <div>
                <label className={labelCls}>Tax Policy <span className="text-red-500">*</span></label>
                <PolicySelect value={form.tax_policy_id} onChange={setPolicy("tax_policy_id")} policies={policies.tax} placeholder="Select tax policy" required />
              </div>
              <div>
                <label className={labelCls}>Bonus Policy <span className="text-gray-400 font-normal">(optional)</span></label>
                <PolicySelect value={form.bonus_policy_id} onChange={setPolicy("bonus_policy_id")} policies={policies.bonus} placeholder="Select bonus policy" />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />
            <ComponentEditor title="Allowances" components={allowances} onChange={setAllowances} basisOptions={["basic_salary", "gross_salary"]} />
            <ComponentEditor title="Deductions" components={deductions} onChange={setDeductions} basisOptions={["gross_salary", "basic_salary"]} />

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Creating…</> : "Create Structure"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}