'use client'

import { Zap } from "lucide-react";

export const API_PATH = "/policies/bonus";

export const POLICY_META = {
  key: "bonus",
  label: "Bonus",
  title: "Bonus Policies",
  description: "Manage bonus policy settings.",
  Icon: Zap,
  color: "text-emerald-600 dark:text-emerald-400",
  bg: "bg-emerald-50 dark:bg-emerald-900/20",
};

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const buildInitialForm = (policy) => {
  const source = policy ?? {};

  return {
    name: source.name || "",
    bonus_mode_default: source.bonus_mode_default || "fixed",
    bonus_rate_default: source.bonus_rate_default ?? "",
    apply_proration_default: source.apply_proration_default ?? true,
    min_present_days: source.min_present_days ?? "",
    min_payable_days: source.min_payable_days ?? "",
    max_unpaid_leave_days: source.max_unpaid_leave_days ?? "",
    require_full_attendance: source.require_full_attendance ?? false,
  };
};

export const buildPayload = (form) => {
  const payload = { ...form };

  payload.bonus_rate_default = Number(payload.bonus_rate_default);
  ["min_present_days", "min_payable_days", "max_unpaid_leave_days"].forEach((key) => {
    if (payload[key] === "") delete payload[key];
    else payload[key] = Number(payload[key]);
  });

  return payload;
};

export const validatePolicyForm = (form) => {
  if (!form.name?.trim()) return "Policy name is required";
  if (form.bonus_rate_default === "") return "Bonus rate / amount is required";
  return null;
};
