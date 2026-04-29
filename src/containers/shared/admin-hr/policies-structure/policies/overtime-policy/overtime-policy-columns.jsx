'use client'

const yesNo = (value) => (value ? "Yes" : "No");

export const overtimePolicyHeaders = [
  "Name",
  "Std hrs/day",
  "Multiplier",
  "Min/day",
  "Max/day",
  "Max/month",
  "Enforce limits",
  "Limit mode",
  "Full shift",
];

export const getOvertimePolicySummaryFields = (policy) => ([
  ["Std hrs/day", policy.standard_work_hours_per_day ?? "—"],
  ["Multiplier", policy.multiplier != null ? `${policy.multiplier}×` : "—"],
  ["Min/day", policy.min_hours_per_day ?? "—"],
  ["Max/day", policy.max_hours_per_day ?? "—"],
  ["Max/month", policy.max_hours_per_month ?? "—"],
  ["Enforce limits", yesNo(policy.enforce_limits)],
  ["Limit mode", policy.limit_enforcement_mode || "—"],
  ["Full shift", yesNo(policy.require_full_shift_for_overtime)],
]);
