'use client'

import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const buildTaxPolicyColumns = ({ canManage, onEdit, onDelete, onView }) => {
  const meta = { icon: Receipt, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" };

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
          {row.original.tax_mode_default || "—"}
        </span>
      ),
    },
    {
      id: "rate",
      header: "Rate/Amount",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.original.tax_rate_default != null ? `${row.original.tax_rate_default}%` : "—"}
        </span>
      ),
    },
    {
      id: "slabs",
      header: "Tax Slabs",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {Array.isArray(row.original.tax_slabs) ? `${row.original.tax_slabs.length} slabs` : "—"}
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
