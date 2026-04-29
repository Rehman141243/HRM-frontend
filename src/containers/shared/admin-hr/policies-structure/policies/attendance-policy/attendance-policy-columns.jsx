'use client'

const yesNo = (value) => (value ? "Yes" : "No");

export const attendancePolicyHeaders = [
  "Name",
  "Timezone",
  "Grace min",
  "Late unpaid",
  "Full day",
  "No checkout",
  "Short behavior",
  "Regularization window",
  "Monthly limit",
];

export const getAttendancePolicySummaryFields = (policy) => ([
  ["Timezone", policy.timezone || "—"],
  ["Grace min", policy.grace_minutes_default ?? "—"],
  ["Late unpaid", policy.late_count_for_unpaid_day ?? "—"],
  ["Full day", policy.full_day_hours ?? "—"],
  ["No checkout", policy.no_checkout_behavior || "—"],
  ["Short behavior", policy.short_hours_behavior || "—"],
  ["Regularization window", policy.late_regularization_window_hours ?? "—"],
  ["Monthly limit", policy.late_regularization_monthly_limit ?? "—"],
]);
