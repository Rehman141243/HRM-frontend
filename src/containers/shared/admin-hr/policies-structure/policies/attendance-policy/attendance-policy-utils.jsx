'use client'

import { UserCheck } from "lucide-react";

export const API_PATH = "/policies/attendance";

export const POLICY_META = {
  key: "attendance",
  label: "Attendance",
  title: "Attendance Policies",
  description: "Manage attendance-related policy settings.",
  Icon: UserCheck,
  color: "text-blue-600 dark:text-blue-400",
  bg: "bg-blue-50 dark:bg-blue-900/20",
};

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const buildInitialForm = (policy) => {
  const source = policy ?? {};
  const joinArray = (value) => (Array.isArray(value) ? value.join(",") : (value || ""));

  return {
    name: source.name || "",
    timezone: source.timezone || "Asia/Karachi",
    apply_proration_default: source.apply_proration_default ?? true,
    grace_minutes_default: source.grace_minutes_default ?? 0,
    late_count_for_unpaid_day: source.late_count_for_unpaid_day ?? 3,
    min_hours_for_present: source.min_hours_for_present ?? 0,
    min_hours_for_half_day: source.min_hours_for_half_day ?? 2,
    full_day_hours: source.full_day_hours ?? 8,
    no_checkout_behavior: source.no_checkout_behavior || "present",
    short_hours_behavior: source.short_hours_behavior || "present",
    short_hours_payable: source.short_hours_payable ?? 1,
    weekly_off_days: joinArray(source.weekly_off_days) || "0,6",
    holiday_dates: joinArray(source.holiday_dates),
    working_weekend_dates: joinArray(source.working_weekend_dates),
    forced_working_dates: joinArray(source.forced_working_dates),
    manual_off_dates: joinArray(source.manual_off_dates),
  };
};

export const buildPayload = (form) => {
  const payload = { ...form };

  const allowed = [
    "name",
    "timezone",
    "apply_proration_default",
    "grace_minutes_default",
    "late_count_for_unpaid_day",
    "shift_grace_by_shift_name",
    "weekly_off_days",
    "working_weekend_dates",
    "holiday_dates",
    "forced_working_dates",
    "manual_off_dates",
  ];
  Object.keys(payload).forEach((key) => { if (!allowed.includes(key)) delete payload[key]; });

  ["grace_minutes_default", "late_count_for_unpaid_day"].forEach((key) => {
    if (payload[key] !== "") payload[key] = Number(payload[key]);
  });

  ["holiday_dates", "working_weekend_dates", "forced_working_dates", "manual_off_dates"].forEach((key) => {
    if (payload[key] === "") delete payload[key];
    else if (payload[key]) payload[key] = payload[key].trim();
  });

  if (payload.weekly_off_days === "") delete payload.weekly_off_days;

  return payload;
};

export const validatePolicyForm = (form) => {
  if (!form.name?.trim()) return "Policy name is required";
  return null;
};
