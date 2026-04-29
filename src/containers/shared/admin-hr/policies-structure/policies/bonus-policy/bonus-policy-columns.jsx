'use client'

import { fmtPKR } from "@/components/modal-components/modalcomponents";

export const bonusPolicyHeaders = [
  "Name",
  "Mode",
  "Rate/amount",
  "Min present",
  "Min payable",
  "Max unpaid",
  "Full attendance",
];

export const getBonusPolicySummaryFields = (policy) => ([
  ["Mode", policy.bonus_mode_default || "—"],
  ["Rate/amount", policy.bonus_rate_default != null
    ? (policy.bonus_mode_default === "percentage" ? `${policy.bonus_rate_default}%` : fmtPKR(policy.bonus_rate_default))
    : "—"],
  ["Min present", policy.min_present_days ?? "—"],
  ["Min payable", policy.min_payable_days ?? "—"],
  ["Max unpaid", policy.max_unpaid_leave_days ?? "—"],
  ["Full attendance", policy.require_full_attendance ? "Yes" : "No"],
]);
