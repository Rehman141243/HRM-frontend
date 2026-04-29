'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, RefreshCw, Plus, CreditCard, CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import {
  EmptyState, getPermissions,
  EmployeeSearchCombobox, inputCls, ComponentEditor,
} from "@/components/modal-components/modalcomponents";
import SalaryStructureModal from "@/components/modals/SalaryStructureModal";
import { usePolicies, PolicySelect } from "@/components/modals/createstucturemodal";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { buildSalaryStructureColumns } from "./salary-structure-columns";

// ============= CONSTANTS =============
export const STRUCTURE_API_PATH = "/salary-structures";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

// ============= SALARY STRUCTURE LIST =============
export function SalaryStructureList({ showHeader = true, onEdit, onCreateNew, basePath = "/hr" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  const [structures, setStructures] = useState([]);
  const [structLoading, setStructLoading] = useState(false);
  const [structPage, setStructPage] = useState(1);
  const [structPageSize, setStructPageSize] = useState(10);
  const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });
  const [selectedStructure, setSelectedStructure] = useState(null);

  const { policies, fetchAllPolicies } = usePolicies();
  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  const loadStructures = useCallback(async (p, pageSize = structPageSize) => {
    setStructLoading(true);
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get(STRUCTURE_API_PATH, { params: { page: p, limit: pageSize } });
        setStructures(res.data.salary_structures ?? []);
        setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
      } else {
        const empId = perms.selfEmployeeId;
        if (!empId) {
          toast.error("Cannot determine your employee ID.");
          setStructures([]);
          return;
        }
        const res = await axiosInstance.get(`${STRUCTURE_API_PATH}/employee/${empId}`);
        const s = res.data?.salary_structure || res.data;
        setStructures(s?.id ? [s] : []);
        setStructPagination({ total: s?.id ? 1 : 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) toast.error("Failed to fetch salary structures");
      setStructures([]);
    } finally {
      setStructLoading(false);
    }
  }, [perms.canViewAllStructures, perms.selfEmployeeId, structPageSize]);

  useEffect(() => { if (user) loadStructures(structPage); }, [user, loadStructures, structPage]);

  const handleEdit = (structure) => {
    if (onEdit) onEdit(structure);
    else router.push(`${basePath}/policies-structure/salary-structure/${structure.id}`);
  };

  const handleCreateNew = () => {
    if (onCreateNew) onCreateNew();
    else router.push(`${basePath}/policies-structure/salary-structure/create`);
  };

  const columns = useMemo(() => buildSalaryStructureColumns({
    onView: setSelectedStructure,
    onEdit: handleEdit,
    canEdit: perms.canEditStructure,
  }), [perms.canEditStructure, handleEdit]);

  return (
    <div className="flex flex-col gap-6">
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border bg-background p-2 shadow-xs">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {perms.canViewAllStructures ? "Salary Structures" : "My Salary Structure"}
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {perms.canViewAllStructures
                ? "Manage employee salary structures, allowances, and deductions."
                : "View your assigned salary structure, allowances, and deductions."}
            </p>
          </div>
        </div>
      )}

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">
            {perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 w-full sm:w-auto shrink-0"
            onClick={() => loadStructures(structPage)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          <TableToolbar
            placeholder="Search salary structures…"
            total={structures.length}
            rightSlot={perms.canCreateStructure ? (
              <Button size="sm" className="h-8 gap-1.5 shrink-0" onClick={handleCreateNew}>
                <Plus className="w-3.5 h-3.5" /> New Structure
              </Button>
            ) : null}
          />

          <div className="p-4 pt-3">
            {structLoading ? (
              <div className="py-16">
                <EmptyState icon={RefreshCw} message="Loading structures…" />
              </div>
            ) : structures.length === 0 ? (
              <div className="py-16">
                <EmptyState icon={Building2} message="No salary structures found." />
              </div>
            ) : (
              <DataTable
                data={structures}
                columns={columns}
                page={structPage - 1}
                pageSize={structPageSize}
                total={structPagination.total}
                setPage={(nextPage) => {
                  const pageNumber = nextPage + 1;
                  setStructPage(pageNumber);
                  loadStructures(pageNumber, structPageSize);
                }}
                setPageSize={(nextPageSize) => {
                  setStructPageSize(nextPageSize);
                  setStructPage(1);
                  loadStructures(1, nextPageSize);
                }}
                pagination={true}
                columnsBtn={false}
                isLoading={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <SalaryStructureModal
        structure={selectedStructure}
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        perms={perms}
        policies={policies}
      />
    </div>
  );
}

// ============= SALARY STRUCTURE FORM =============
export function SalaryStructureForm({
  mode = "create",
  structureId,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { policies, fetchAllPolicies } = usePolicies();

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

  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  useEffect(() => {
    if (isEdit && structureId) {
      axiosInstance.get(`${STRUCTURE_API_PATH}/${structureId}`)
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
        .catch((e) => {
          toast.error("Failed to load salary structure");
          if (onCancel) onCancel();
        })
        .finally(() => setFetchLoading(false));
    }
  }, [isEdit, structureId, onCancel]);

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
        await axiosInstance.patch(`${STRUCTURE_API_PATH}/${structureId}`, payload);
        toast.success("Salary structure updated successfully!");
        if (onSuccess) onSuccess(structure);
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
        const res = await axiosInstance.post(STRUCTURE_API_PATH, payload);
        toast.success("Salary structure created successfully!");
        if (onSuccess) onSuccess(res.data);
      } catch (e) {
        const d = e?.response?.data;
        toast.error(d?.message || d?.error || e?.message || "Failed to create salary structure");
      } finally {
        setLoading(false);
      }
    }
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
              onClick={onCancel || (() => router.back())}
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

export default SalaryStructureList;
