'use client'

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { Pencil, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import {
  ComponentEditor,
  inputCls,
} from "@/components/modal-components/modalcomponents";
import { usePolicies, PolicySelect } from "@/components/modals/createstucturemodal";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

export default function EditSalaryStructurePage() {
  const router = useRouter();
  const { id } = useParams();
  const { policies, fetchAllPolicies } = usePolicies();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [structure, setStructure] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchAllPolicies();
    axiosInstance.get(`/salary-structures/${id}`)
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
        router.back();
      })
      .finally(() => setFetchLoading(false));
  }, [id, fetchAllPolicies]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPolicy = (k) => (id) => setForm((f) => ({ ...f, [k]: id }));

  const handleSubmit = async () => {
    const normalizeComponents = (comps) =>
      comps.filter((c) => c.name && c.value !== "").map((c) => ({
        name: c.name,
        type: c.type,
        value: parseFloat(c.value) || 0,
        basis: c.basis,
        apply_proration: c.apply_proration === true,
      }));

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
      await axiosInstance.patch(`/salary-structures/${id}`, payload);
      toast.success("Salary structure updated successfully!");
      router.back();
    } catch (e) {
      const d = e?.response?.data;
      toast.error(d?.message || d?.error || e?.message || "Failed to update salary structure");
    } finally {
      setLoading(false);
    }
  };

  const emp = structure?.employee || {};

  return (
    <>
      {/* <BreadcrumbComponent data={[
        { name: "Compensation Setup", url: "/hr/policies_structure" },
        { name: "Salary Structure", url: "/hr/policies_structure/salary-stucture" },
        { name: "Edit Structure", url: `/hr/policies_structure/salary-stucture/${id}` },
      ]} /> */}

      <div className="px-4 sm:px-6 py-8 ">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-lg border bg-background p-2 shadow-xs">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Edit Salary Structure</h1>
            {emp.first_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {emp.first_name} {emp.last_name} · {emp.designation || "—"}
              </p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Structure Name</label>
                  <input className={inputCls} value={form.name || ""} onChange={setF("name")} />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <input className={inputCls} value={form.currency || ""} onChange={setF("currency")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Basic Salary</label>
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.basic_salary || ""} onChange={setF("basic_salary")} />
                </div>
                <div>
                  <label className={labelCls}>Effective From</label>
                  <input type="date" className={inputCls} value={form.effective_from || ""} onChange={setF("effective_from")} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.is_active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Policies</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Attendance Policy</label>
                  <PolicySelect value={form.attendance_policy_id} onChange={setPolicy("attendance_policy_id")} policies={policies.attendance} placeholder="Select attendance policy" />
                </div>
                <div>
                  <label className={labelCls}>Overtime Policy</label>
                  <PolicySelect value={form.overtime_policy_id} onChange={setPolicy("overtime_policy_id")} policies={policies.overtime} placeholder="Select overtime policy" />
                </div>
                <div>
                  <label className={labelCls}>Tax Policy</label>
                  <PolicySelect value={form.tax_policy_id} onChange={setPolicy("tax_policy_id")} policies={policies.tax} placeholder="Select tax policy" />
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
                {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}