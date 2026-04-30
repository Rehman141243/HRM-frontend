'use client'

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Clock, Receipt, Zap, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendancePolicyList } from "./attendance-policy/attendance-policy";
import { OvertimePolicyList } from "./overtime-policy/overtime-policy";
import { TaxPolicyList } from "./tax-policy/tax-policy";
import { BonusPolicyList } from "./bonus-policy/bonus-policy";
import AttendancePolicyForm from './attendance-policy/attendance-policy-form';
import BonusPolicyForm from './bonus-policy/bonus-policy-form';
import OvertimePolicyForm from './overtime-policy/overtime-policy-form';
import TaxPolicyForm from './tax-policy/tax-policy-form';

// ============= CONSTANTS =============
export const POLICY_TYPE_META = {
  attendance: {
    key: "attendance",
    label: "Attendance",
    title: "Attendance Policies",
    description: "Manage attendance-related policy settings.",
    Icon: UserCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  overtime: {
    key: "overtime",
    label: "Overtime",
    title: "Overtime Policies",
    description: "Manage overtime policy settings.",
    Icon: Clock,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  tax: {
    key: "tax",
    label: "Tax",
    title: "Tax Policies",
    description: "Manage tax policy settings.",
    Icon: Receipt,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  bonus: {
    key: "bonus",
    label: "Bonus",
    title: "Bonus Policies",
    description: "Manage bonus policy settings.",
    Icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
};

export const POLICY_TYPE_ORDER = ["attendance", "overtime", "tax", "bonus"];

const POLICY_COMPONENTS = {
  attendance: AttendancePolicyList,
  overtime: OvertimePolicyList,
  tax: TaxPolicyList,
  bonus: BonusPolicyList,
};

const POLICY_FORM_COMPONENTS = {
  attendance: AttendancePolicyForm,
  overtime: OvertimePolicyForm,
  tax: TaxPolicyForm,
  bonus: BonusPolicyForm,
};

// ============= POLICY LIST COMPONENT =============
export function PolicyList({
  type: typeProp,
  mode = "single",
  basePath = "/hr",
  showHeader = true,
}) {
  const [activeType, setActiveType] = useState(typeProp || "attendance");

  const resolvedType = mode === "combined" ? activeType : (typeProp || activeType);
  const PolicyComponent = POLICY_COMPONENTS[resolvedType] || AttendancePolicyList;

  if (mode === "single") {
    return <PolicyComponent showHeader={showHeader} basePath={basePath} />;
  }

  // Combined mode with sidebar
  return (
    <div className="flex gap-0 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-52 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Policy types</p>
        </div>
        <div className="py-2">
          {POLICY_TYPE_ORDER.map((typeKey) => {
            const item = POLICY_TYPE_META[typeKey];
            const active = activeType === typeKey;
            const TabIcon = item.Icon;
            return (
              <button
                key={typeKey}
                onClick={() => setActiveType(typeKey)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left",
                  active
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium border-r-2 border-gray-900 dark:border-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/40 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("p-1 rounded-md", active ? item.bg : "bg-transparent")}>
                    <TabIcon className={cn("w-3.5 h-3.5", active ? item.color : "text-gray-400 dark:text-gray-500")} />
                  </span>
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <PolicyComponent showHeader={false} basePath={basePath} />
      </div>
    </div>
  );
}

export default PolicyList;
