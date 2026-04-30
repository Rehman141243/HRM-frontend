'use client'

import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const buildAttendancePolicyColumns = ({ canManage, onEdit, onDelete, onView }) => {
  const meta = { icon: UserCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" };

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
      id: "timezone",
      header: "Timezone",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.timezone || "—"}
        </span>
      ),
    },
    {
      id: "grace_minutes",
      header: "Grace (min)",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.grace_minutes_default ?? "—"}
        </span>
      ),
    },
    {
      id: "full_day_hours",
      header: "Full Day (hrs)",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.full_day_hours ?? "—"}
        </span>
      ),
    },
    {
      id: "no_checkout",
      header: "No Checkout",
      cell: ({ row }) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
          {row.original.no_checkout_behavior || "—"}
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
