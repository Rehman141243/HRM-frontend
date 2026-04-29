'use client'

export const taxPolicyHeaders = [
  "Name",
  "Mode",
  "Rate",
  "Slabs",
];

export const getTaxPolicySummaryFields = (policy) => ([
  ["Mode", policy.tax_mode_default || "—"],
  ["Rate", policy.tax_rate_default != null ? `${policy.tax_rate_default}%` : "—"],
  ["Slabs", Array.isArray(policy.tax_slabs) ? `${policy.tax_slabs.length} slabs` : "—"],
]);
