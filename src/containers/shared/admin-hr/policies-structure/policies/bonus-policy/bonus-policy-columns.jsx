'use client'

import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export const buildBonusPolicyColumns = ({ canManage, onEdit, onDelete, onView }) => {
  const meta = { icon: Zap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" };

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
    {
      id: "mode",
      header: "Mode",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
          {row.original.bonus_mode_default || "—"}
        </span>
      ),
    },
    {
      id: "rate",
      header: "Rate/Amount",
      cell: ({ row }) => {
        const policy = row.original;
        const value = policy.bonus_rate_default != null
          ? (policy.bonus_mode_default === "percentage" ? `${policy.bonus_rate_default}%` : fmtPKR(policy.bonus_rate_default))
          : "—";
        return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
      },
    },
    {
      id: "eligibility",
      header: "Eligibility",
      cell: ({ row }) => {
        const policy = row.original;
        const parts = [];
        if (policy.min_present_days) parts.push(`${policy.min_present_days}d present`);
        if (policy.require_full_attendance) parts.push("Full attendance");
        return (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {parts.length > 0 ? parts.join(", ") : "—"}
          </span>
        );
      },
    },
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
          {row.original.apply_proration_default ? "Yes" : "No"}
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
                View Details
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
