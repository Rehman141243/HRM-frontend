'use client'

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { RefreshCw, Plus, CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EmployeeSearchCombobox,
  inputCls,
  ComponentEditor,
} from "@/components/modal-components/modalcomponents";
import { usePolicies, PolicySelect } from "@/components/modals/createstucturemodal";

// ============= CONSTANTS =============
export const STRUCTURE_API_PATH = "/salary-structures";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

// ============= SALARY STRUCTURE FORM =============
export default function SalaryStructureForm({
  mode = "create",
  structureId,
  basePath = "/hr",
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const params = useParams();
  const isEdit = mode === "edit";
  const { policies, fetchAllPolicies } = usePolicies();

  // Get structureId from params if not provided
  const resolvedStructureId = structureId || (Array.isArray(params?.id) ? params.id[0] : params?.id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [structure, setStructure] = useState(null);
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

  useEffect(() => {
    fetchAllPolicies();
  }, [fetchAllPolicies]);

  useEffect(() => {
    if (isEdit && resolvedStructureId) {
      setFetchLoading(true);
      axiosInstance.get(`${STRUCTURE_API_PATH}/${resolvedStructureId}`)
        .then((res) => {
          const s = res.data?.salary_structure || res.data;
          setStructure(s);
          setForm({
            name: s.name || "",
            basic_salary: String(s.basic_salary || ""),
            currency: s.currency || "PKR",
            effective_from: s.effective_from || "",
            is_active: s.is_active ?? true,
            attendance_policy_id: s.attendance_policy_id || "",
            overtime_policy_id: s.overtime_policy_id || "",
            tax_policy_id: s.tax_policy_id || "",
            bonus_policy_id: s.bonus_policy_id || "",
          });
          if (s.employee) setSelectedEmployee(s.employee);
          setAllowances((s.allowances || []).map((a) => ({
            ...a,
            value: String(a.value ?? a.amount ?? ""),
            apply_proration: a.apply_proration !== false,
            basis: a.basis || "basic_salary",
          })));
          setDeductions((s.deductions || []).map((d) => ({
            ...d,
            value: String(d.value ?? d.amount ?? ""),
            apply_proration: d.apply_proration !== false,
            basis: d.basis || "gross_salary",
          })));
        })
        .catch(() => {
          toast.error("Failed to load salary structure");
          if (onCancel) onCancel();
          else router.push(`${basePath}/policies-structure?tab=structure`);
        })
        .finally(() => setFetchLoading(false));
    }
  }, [isEdit, resolvedStructureId, onCancel, basePath, router]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPolicy = (k) => (id) => setForm((f) => ({ ...f, [k]: id }));

  const normalizeComponents = (comps) =>
    comps.filter((c) => c.name && c.value !== "").map((c) => ({
      name: c.name,
      type: c.type || "fixed",
      value: parseFloat(c.value) || 0,
      basis: c.basis || "basic_salary",
      apply_proration: c.apply_proration === true,
    }));

  const handleSubmit = async () => {
    if (isEdit) {
      const payload = {};
      if (form.name?.trim()) payload.name = form.name.trim();
      if (form.basic_salary && !isNaN(parseFloat(form.basic_salary))) payload.basic_salary = parseFloat(form.basic_salary);
      if (form.currency?.trim()) payload.currency = form.currency.trim();
      if (form.effective_from) payload.effective_from = form.effective_from;
      payload.is_active = form.is_active === true;
      if (form.attendance_policy_id?.trim()) payload.attendance_policy_id = form.attendance_policy_id.trim();
      if (form.overtime_policy_id?.trim()) payload.overtime_policy_id = form.overtime_policy_id.trim();
      if (form.tax_policy_id?.trim()) payload.tax_policy_id = form.tax_policy_id.trim();
      if (form.bonus_policy_id?.trim()) payload.bonus_policy_id = form.bonus_policy_id.trim();
      payload.allowances = normalizeComponents(allowances);
      payload.deductions = normalizeComponents(deductions);

      setLoading(true);
      try {
        await axiosInstance.patch(`${STRUCTURE_API_PATH}/${resolvedStructureId}`, payload);
        toast.success("Salary structure updated successfully!");
        if (onSuccess) onSuccess(structure);
        else router.push(`${basePath}/policies-structure?tab=structure`);
      } catch (e) {
        const d = e?.response?.data;
        toast.error(d?.message || d?.error || e?.message || "Failed to update salary structure");
      } finally {
        setLoading(false);
      }
    } else {
      if (!selectedEmployee) return toast.error("Please select an employee");
      if (!form.basic_salary || isNaN(parseFloat(form.basic_salary))) return toast.error("Valid basic salary is required");
      if (!form.attendance_policy_id) return toast.error("Attendance policy is required");
      if (!form.overtime_policy_id) return toast.error("Overtime policy is required");
      if (!form.tax_policy_id) return toast.error("Tax policy is required");

      const payload = {
        name: form.name?.trim() || `${selectedEmployee.first_name} ${selectedEmployee.last_name} - Salary Structure`,
        currency: form.currency?.trim() || "PKR",
        employee_id: selectedEmployee.id,
        attendance_policy_id: form.attendance_policy_id,
        overtime_policy_id: form.overtime_policy_id || null,
        tax_policy_id: form.tax_policy_id || null,
        basic_salary: parseFloat(form.basic_salary) || null,
        allowances: normalizeComponents(allowances),
        deductions: normalizeComponents(deductions),
        effective_from: form.effective_from,
        is_active: true,
      };

      if (form.bonus_policy_id?.trim()) {
        payload.bonus_policy_id = form.bonus_policy_id.trim();
      }

      setLoading(true);
      try {
        const res = await axiosInstance.post(STRUCTURE_API_PATH, payload);
        toast.success("Salary structure created successfully!");
        if (onSuccess) onSuccess(res.data);
        else router.push(`${basePath}/policies-structure?tab=structure`);
      } catch (e) {
        const d = e?.response?.data;
        toast.error(d?.message || d?.error || e?.message || "Failed to create salary structure");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.push(`${basePath}/policies-structure?tab=structure`);
  };

  const emp = structure?.employee || selectedEmployee || {};

  return (
    <div className="px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-lg border bg-background p-2 shadow-xs">
          {isEdit ? (
            <Pencil className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight">
            {isEdit ? "Edit Salary Structure" : "New Salary Structure"}
          </h1>
          {emp.first_name && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {emp.first_name} {emp.last_name}
              {emp.designation && ` · ${emp.designation}`}
            </p>
          )}
          {!emp.first_name && !isEdit && (
            <p className="text-sm text-muted-foreground mt-0.5">Create a salary structure for an employee.</p>
          )}
        </div>
      </div>

      {fetchLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading structure…</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-6 py-6 space-y-5">

            {!isEdit && (
              <div>
                <label className={labelCls}>Employee <span className="text-red-500">*</span></label>
                <EmployeeSearchCombobox value={selectedEmployee} onChange={setSelectedEmployee} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Basic Salary <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="50,000"
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

            <div className="space-y-2">
              <label className={labelCls}>Policies <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PolicySelect
                  type="attendance"
                  value={form.attendance_policy_id}
                  onChange={setPolicy("attendance_policy_id")}
                  policies={policies.attendance}
                  policyType="attendance"
                />
                <PolicySelect
                  type="overtime"
                  value={form.overtime_policy_id}
                  onChange={setPolicy("overtime_policy_id")}
                  policies={policies.overtime}
                  policyType="overtime"
                />
                <PolicySelect
                  type="tax"
                  value={form.tax_policy_id}
                  onChange={setPolicy("tax_policy_id")}
                  policies={policies.tax}
                  policyType="tax"
                />
                <PolicySelect
                  type="bonus"
                  value={form.bonus_policy_id}
                  onChange={setPolicy("bonus_policy_id")}
                  policies={policies.bonus}
                  policyType="bonus"
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls}>Allowances</label>
                <button
                  type="button"
                  onClick={() => setAllowances([...allowances, { name: "", value: "", type: "fixed", basis: "basic_salary", apply_proration: true }])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  + Add Allowance
                </button>
              </div>
              <ComponentEditor
                components={allowances}
                onChange={setAllowances}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls}>Deductions</label>
                <button
                  type="button"
                  onClick={() => setDeductions([...deductions, { name: "", value: "", type: "fixed", basis: "gross_salary", apply_proration: true }])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  + Add Deduction
                </button>
              </div>
              <ComponentEditor
                components={deductions}
                onChange={setDeductions}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || fetchLoading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors",
                "bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300",
                "text-white dark:text-gray-900 disabled:opacity-50 px-5 py-2.5 text-sm"
              )}
            >
              {loading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</>
                : <><CheckCircle2 className="w-3.5 h-3.5" />{isEdit ? "Save Changes" : "Create Structure"}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
