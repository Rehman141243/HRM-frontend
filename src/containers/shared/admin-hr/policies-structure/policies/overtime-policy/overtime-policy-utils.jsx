'use client'

import { Clock } from "lucide-react";

export const API_PATH = "/policies/overtime";

export const POLICY_META = {
  key: "overtime",
  label: "Overtime",
  title: "Overtime Policies",
  description: "Manage overtime policy settings.",
  Icon: Clock,
  color: "text-violet-600 dark:text-violet-400",
  bg: "bg-violet-50 dark:bg-violet-900/20",
};

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const buildInitialForm = (policy) => {
  const source = policy ?? {};

  return {
    name: source.name || "",
    apply_proration_default: source.apply_proration_default ?? false,
    standard_work_hours_per_day: source.standard_work_hours_per_day ?? 8,
    multiplier: source.multiplier ?? 1.5,
    min_hours_per_day: source.min_hours_per_day ?? 0,
    max_hours_per_day: source.max_hours_per_day ?? 4,
    max_hours_per_month: source.max_hours_per_month ?? 20,
  };
};

export const buildPayload = (form) => {
  const payload = { ...form };

  [
    "standard_work_hours_per_day",
    "multiplier",
    "min_hours_per_day",
    "max_hours_per_day",
    "max_hours_per_month",
  ].forEach((key) => { payload[key] = Number(payload[key]); });

  return payload;
};

export const validatePolicyForm = (form) => {
  if (!form.name?.trim()) return "Policy name is required";
  return null;
};
