'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "./tax-policy-utils";

const selectCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 " +
  "text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none " +
  "focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition";

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

function TaxFields({ form, setF, setForm }) {
  const addSlab = () => setForm((current) => ({ ...current, tax_slabs: [...(current.tax_slabs || []), { up_to: "", rate: 0 }] }));
  const removeSlab = (index) => setForm((current) => ({ ...current, tax_slabs: current.tax_slabs.filter((_, itemIndex) => itemIndex !== index) }));
  const updateSlab = (index, field, value) => setForm((current) => {
    const slabs = [...current.tax_slabs];
    slabs[index] = { ...slabs[index], [field]: value === "" || value === "null" ? null : Number(value) };
    return { ...current, tax_slabs: slabs };
  });

  return (
    <>
      <Field label="Tax Mode">
        <select className={selectCls} value={form.tax_mode_default || "slab"} onChange={setF("tax_mode_default")}>
          <option value="slab">Slab</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </Field>

      {(form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") && (
        <Field label={form.tax_mode_default === "percentage" ? "Tax Rate (%)" : "Fixed Tax Amount"}>
          <input type="number" min="0" step="0.01" className={inputCls} value={form.tax_rate_default ?? ""} onChange={setF("tax_rate_default")} />
        </Field>
      )}

      {form.tax_mode_default === "slab" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Tax Slabs</label>
            <button
              type="button"
              onClick={addSlab}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Slab
            </button>
          </div>

          <div className="grid grid-cols-[1fr_88px_32px] gap-2 px-0.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Income Up To</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rate %</span>
          </div>

          <div className="space-y-2">
            {(form.tax_slabs || []).map((slab, index) => (
              <div key={index} className="grid grid-cols-[1fr_88px_32px] gap-2 items-center">
                <input
                  type="number"
                  placeholder="∞ (leave empty)"
                  className={cn(inputCls, "text-sm")}
                  value={slab.up_to == null ? "" : slab.up_to}
                  onChange={(event) => updateSlab(index, "up_to", event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  className={cn(inputCls, "text-sm")}
                  value={slab.rate ?? ""}
                  onChange={(event) => updateSlab(index, "rate", event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSlab(index)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Leave "Income Up To" empty for the top slab (∞)</p>
        </div>
      )}

      <CheckRow checked={form.apply_proration_default ?? false} onChange={setF("apply_proration_default")}>
        Apply proration to fixed tax
      </CheckRow>
    </>
  );
}

export default function TaxPolicyForm({
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

              <TaxFields form={form} setF={setF} setForm={setForm} />
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
