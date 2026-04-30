'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Plus, RefreshCw, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  inputCls,
} from "@/components/modal-components/modalcomponents";
import {
  buildInitialForm,
  buildPayload,
  extractErrorMessage,
  POLICY_META,
  validatePolicyForm,
  API_PATH,
} from "./attendance-policy-utils";

const selectCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 " +
  "text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none " +
  "focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-1">{children}</p>
);

const Field = ({ label, children, className }) => (
  <div className={className}>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const CheckRow = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded accent-gray-900 dark:accent-gray-300"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
  </label>
);

function AttendanceFields({ form, setF, setN, setForm }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Timezone <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input className={inputCls} placeholder="Asia/Karachi" value={form.timezone || ""} onChange={setF("timezone")} />
        </Field>
        <Field label={<>Grace Minutes <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input type="number" min="0" className={inputCls} value={form.grace_minutes_default ?? ""} onChange={setN("grace_minutes_default")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Lates → Unpaid Day <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input type="number" min="1" className={inputCls} value={form.late_count_for_unpaid_day ?? ""} onChange={setN("late_count_for_unpaid_day")} />
        </Field>
        <Field label={<>Weekly Off Days <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input className={inputCls} placeholder="0,6  (Sun, Sat)" value={form.weekly_off_days || ""} onChange={setF("weekly_off_days")} />
        </Field>
      </div>

      <SectionLabel>Hour Thresholds</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Min Hours Present">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_for_present ?? ""} onChange={setN("min_hours_for_present")} />
        </Field>
        <Field label="Min Hours Half Day">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_for_half_day ?? ""} onChange={setN("min_hours_for_half_day")} />
        </Field>
        <Field label="Full Day Hours">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.full_day_hours ?? ""} onChange={setN("full_day_hours")} />
        </Field>
      </div>

      <SectionLabel>Behavior Rules</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="No Checkout Behavior">
          <select className={selectCls} value={form.no_checkout_behavior || "present"} onChange={setF("no_checkout_behavior")}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
        </Field>
        <Field label="Short Hours Behavior">
          <select className={selectCls} value={form.short_hours_behavior || "present"} onChange={setF("short_hours_behavior")}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Short Hours Payable Fraction">
          <select
            className={selectCls}
            value={String(form.short_hours_payable ?? 1)}
            onChange={(event) => setForm((current) => ({ ...current, short_hours_payable: Number(event.target.value) }))}
          >
            <option value="1">Full (1.0)</option>
            <option value="0.5">Half (0.5)</option>
            <option value="0">None (0)</option>
          </select>
        </Field>
      </div>

      <SectionLabel>Date Overrides</SectionLabel>
      <Field label={<>Holiday Dates <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
        <input className={inputCls} placeholder="2025-12-25, 2026-01-01" value={form.holiday_dates || ""} onChange={setF("holiday_dates")} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Working Weekend Dates <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input className={inputCls} placeholder="2025-12-27" value={form.working_weekend_dates || ""} onChange={setF("working_weekend_dates")} />
        </Field>
        <Field label={<>Manual Off Dates <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
          <input className={inputCls} placeholder="2025-12-26" value={form.manual_off_dates || ""} onChange={setF("manual_off_dates")} />
        </Field>
      </div>
      <Field label={<>Forced Working Dates <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></>}>
        <input className={inputCls} placeholder="2025-12-30" value={form.forced_working_dates || ""} onChange={setF("forced_working_dates")} />
      </Field>

      <CheckRow checked={form.apply_proration_default ?? true} onChange={setF("apply_proration_default")}>
        Apply proration by default
      </CheckRow>
    </>
  );
}

export default function AttendancePolicyForm({
  mode = "create",
  policyId,
  basePath = "/hr",
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const meta = POLICY_META;
  const isEdit = mode === "edit";

  // Get policyId from params if not provided
  const resolvedPolicyId = policyId || (Array.isArray(params?.id) ? params.id[0] : params?.id);

  const [form, setForm] = useState(() => buildInitialForm(null));
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      setForm(buildInitialForm(null));
      return;
    }

    if (!resolvedPolicyId) return;

    setFetchLoading(true);
    axiosInstance.get(`${API_PATH}/${resolvedPolicyId}`)
      .then((response) => {
        const policy = response.data.policy;
        setForm(buildInitialForm(policy));
      })
      .catch((error) => {
        toast.error(extractErrorMessage(error, "Failed to load policy"));
        if (onCancel) onCancel();
        else router.push(`${basePath}/policies-structure`);
      })
      .finally(() => setFetchLoading(false));
  }, [isEdit, resolvedPolicyId]);

  const setF = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setN = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value === "" ? "" : Number(event.target.value) }));

  const handleSubmit = async () => {
    const errorMessage = validatePolicyForm(form);
    if (errorMessage) return toast.error(errorMessage);

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`${API_PATH}/${resolvedPolicyId}`, payload);
        toast.success("Policy updated successfully!");
      } else {
        await axiosInstance.post(API_PATH, payload);
        toast.success("Policy created successfully!");
      }

      if (onSuccess) onSuccess();
      else router.push(`${basePath}/policies-structure`);
    } catch (error) {
      toast.error(extractErrorMessage(error, `Failed to ${isEdit ? "update" : "create"} policy`));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.push(`${basePath}/policies-structure`);
  };

  const SaveBtn = ({ size = "default" }) => (
    <button
      onClick={handleSubmit}
      disabled={saving || fetchLoading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors",
        "bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300",
        "text-white dark:text-gray-900 disabled:opacity-50",
        size === "sm" ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"
      )}
    >
      {saving
        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</>
        : <><CheckCircle2 className="w-3.5 h-3.5" />{isEdit ? "Save Changes" : "Create Policy"}</>
      }
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-0 dark:bg-gray-950">
      <div className="px-4 sm:px-6 py-8 space-y-6">
        {fetchLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading policy…</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <span className={cn("p-2 rounded-xl", meta.bg)}>
                <meta.Icon className={cn("w-4 h-4", meta.color)} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{meta.label} Policy Details</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fields marked <span className="text-red-500">*</span> are required.</p>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              <Field label={<>Policy Name <span className="text-red-500">*</span></>}>
                <input
                  className={inputCls}
                  placeholder={`e.g., Standard ${meta.label} Policy`}
                  value={form.name || ""}
                  onChange={setF("name")}
                />
              </Field>

              <AttendanceFields form={form} setF={setF} setN={setN} setForm={setForm} />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <SaveBtn size="default" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
