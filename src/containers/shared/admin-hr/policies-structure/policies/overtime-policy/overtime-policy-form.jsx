'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
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
} from "./overtime-policy-utils";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

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

function OvertimeFields({ form, setF, setN }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Multiplier">
          <input type="number" min="0" step="0.1" className={inputCls} value={form.multiplier ?? ""} onChange={setN("multiplier")} />
        </Field>
        <Field label="Standard Work Hours / Day">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.standard_work_hours_per_day ?? ""} onChange={setN("standard_work_hours_per_day")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Min OT / Day (h)">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_per_day ?? ""} onChange={setN("min_hours_per_day")} />
        </Field>
        <Field label="Max OT / Day (h)">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.max_hours_per_day ?? ""} onChange={setN("max_hours_per_day")} />
        </Field>
        <Field label="Max OT / Month (h)">
          <input type="number" min="0" className={inputCls} value={form.max_hours_per_month ?? ""} onChange={setN("max_hours_per_month")} />
        </Field>
      </div>
      <CheckRow checked={form.apply_proration_default ?? false} onChange={setF("apply_proration_default")}>
        Apply proration to overtime
      </CheckRow>
    </>
  );
}

export default function OvertimePolicyForm({
  mode = "create",
  policyId,
  basePath = "/hr",
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const meta = POLICY_META;
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => buildInitialForm(null));
  const [saving, setSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      setForm(buildInitialForm(null));
      return;
    }

    if (!policyId) return;

    setFetchLoading(true);
    axiosInstance.get(`${API_PATH}/${policyId}`)
      .then((response) => {
        const policy = response.data.policy;
        setForm(buildInitialForm(policy));
      })
      .catch((error) => {
        toast.error(extractErrorMessage(error, "Failed to load policy"));
        if (onCancel) onCancel();
        else router.back();
      })
      .finally(() => setFetchLoading(false));
  }, [isEdit, policyId]);

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
        await axiosInstance.put(`${API_PATH}/${policyId}`, payload);
        toast.success("Policy updated successfully!");
      } else {
        await axiosInstance.post(API_PATH, payload);
        toast.success("Policy created successfully!");
      }

      if (onSuccess) onSuccess();
      else router.push(`${basePath}/policies-structure/policies`);
    } catch (error) {
      toast.error(extractErrorMessage(error, `Failed to ${isEdit ? "update" : "create"} policy`));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
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

              <OvertimeFields form={form} setF={setF} setN={setN} />
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
