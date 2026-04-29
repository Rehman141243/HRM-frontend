'use client'

import { Receipt } from "lucide-react";

export const API_PATH = "/policies/tax";

export const POLICY_META = {
  key: "tax",
  label: "Tax",
  title: "Tax Policies",
  description: "Manage tax policy settings.",
  Icon: Receipt,
  color: "text-amber-600 dark:text-amber-400",
  bg: "bg-amber-50 dark:bg-amber-900/20",
};

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const buildInitialForm = (policy) => {
  const source = policy ?? {};

  return {
    name: source.name || "",
    tax_mode_default: source.tax_mode_default || "slab",
    apply_proration_default: source.apply_proration_default ?? false,
    tax_rate_default: source.tax_rate_default ?? "",
    tax_slabs: Array.isArray(source.tax_slabs)
      ? source.tax_slabs
      : [{ up_to: 50000, rate: 0 }, { up_to: 100000, rate: 5 }, { up_to: null, rate: 15 }],
  };
};

export const buildPayload = (form) => {
  const payload = { ...form };

  if (form.tax_mode_default === "slab") {
    delete payload.tax_rate_default;
    payload.tax_slabs = (payload.tax_slabs || []).map((slab) => ({
      up_to: slab.up_to === "" ? null : slab.up_to,
      rate: Number(slab.rate),
    }));
  } else {
    delete payload.tax_slabs;
    payload.tax_rate_default = Number(payload.tax_rate_default);
  }

  return payload;
};

export const validatePolicyForm = (form) => {
  if (!form.name?.trim()) return "Policy name is required";
  if ((form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") && form.tax_rate_default === "") {
    return "Tax rate is required for percentage / fixed mode";
  }
  return null;
};
