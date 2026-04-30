'use client'

import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const buildOvertimePolicyColumns = ({ canManage, onEdit, onDelete, onView }) => {
  const meta = { icon: Clock, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" };

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
      id: "multiplier",
      header: "Multiplier",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.multiplier != null ? `${row.original.multiplier}×` : "—"}
        </span>
      ),
    },
    {
      id: "std_hours",
      header: "Std Hrs/Day",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.standard_work_hours_per_day ?? "—"}
        </span>
      ),
    },
    {
      id: "min_max_day",
      header: "Min-Max/Day",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.min_hours_per_day ?? "—"} - {row.original.max_hours_per_day ?? "—"}
        </span>
      ),
    },
    {
      id: "max_month",
      header: "Max/Month",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.max_hours_per_month ?? "—"}
        </span>
      ),
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
