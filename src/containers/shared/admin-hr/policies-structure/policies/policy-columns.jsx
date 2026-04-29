'use client'

import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash, UserCheck, Clock, Receipt, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  attendancePolicyHeaders, getAttendancePolicySummaryFields,
} from "./attendance-policy/attendance-policy-columns";
import {
  overtimePolicyHeaders, getOvertimePolicySummaryFields,
} from "./overtime-policy/overtime-policy-columns";
import {
  taxPolicyHeaders, getTaxPolicySummaryFields,
} from "./tax-policy/tax-policy-columns";
import {
  bonusPolicyHeaders, getBonusPolicySummaryFields,
} from "./bonus-policy/bonus-policy-columns";

const policyColumnMeta = {
  attendance: { icon: UserCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  overtime: { icon: Clock, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
  tax: { icon: Receipt, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  bonus: { icon: Zap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
};

const policyColumnConfigByType = {
  attendance: { headers: attendancePolicyHeaders, getSummaryFields: getAttendancePolicySummaryFields },
  overtime: { headers: overtimePolicyHeaders, getSummaryFields: getOvertimePolicySummaryFields },
  tax: { headers: taxPolicyHeaders, getSummaryFields: getTaxPolicySummaryFields },
  bonus: { headers: bonusPolicyHeaders, getSummaryFields: getBonusPolicySummaryFields },
};

export const buildPolicyColumns = ({ type, canManage, onEdit, onDelete, onView }) => {
  const meta = policyColumnMeta[type] || policyColumnMeta.attendance;
  const summaryLabels = policyColumnConfigByType[type]?.headers?.slice(1) || [];
  const summaryAccessor = policyColumnConfigByType[type]?.getSummaryFields;

  return [
    {
      id: "name",
      header: "Name",
      accessorFn: (policy) => policy.name || "Unnamed Policy",
      cell: ({ row }) => {
        const policy = row.original;
        const Icon = meta.icon;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn("p-1.5 rounded-md shrink-0", meta.bg)}>
              <Icon className={cn("w-3.5 h-3.5", meta.color)} />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {policy.name || "Unnamed Policy"}
            </span>
          </div>
        );
      },
    },
    ...summaryLabels.map((label, index) => ({
      id: `${type}-${index}`,
      header: label,
      cell: ({ row }) => {
        const summary = summaryAccessor?.(row.original) || [];
        const value = summary[index]?.[1] ?? "—";
        return <span className="text-sm text-gray-700 dark:text-gray-300">{String(value)}</span>;
      },
    })),
    {
      id: "proration",
      header: "Proration",
      cell: ({ row }) => (
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
          row.original.apply_proration_default
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        )}>
          {row.original.apply_proration_default ? "Prorated" : "Fixed"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Open actions"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye className="w-4 h-4" />
                View
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(row.original)}>
                    <Trash className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
