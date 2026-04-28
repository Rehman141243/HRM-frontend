"use client";

import { Pencil, Trash2, EyeIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RoleBadge({ role }) {
  const variants = {
    manager: "destructive",
    hr: "default",
    employee: "outline",
  };
  return (
    <Badge variant={variants[role] || "outline"} className="capitalize">
      {role || "employee"}
    </Badge>
  );
}

export function StatusBadge({ value }) {
  return (
    <Badge variant={value === true ? "default" : "secondary"}>
      {value === true ? "Active" : "Inactive"}
    </Badge>
  );
}

export function buildColumns(onDelete, canDelete, onEdit, onView) {
  return [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const d = row.original;
        const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || "—";
        return (
          <button
            onClick={() => onView?.(row.original.id)}
            className="text-left hover:underline"
          >
            <div className="font-medium">{name}</div>
          </button>
        );
      },
    },
    {
      id: "employee_id",
      header: "Employee ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.employee_id ?? "—"}</span>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: ({ row }) => row.original.department ?? "—",
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.designation} />,
    },
    {
      id: "employment_type",
      header: "Employment Type",
      cell: ({ row }) => {
        const t = row.original.employment_type ?? "";
        return (
          <span className="capitalize text-sm">{t.replace(/_/g, " ") || "—"}</span>
        );
      },
    },
    {
      id: "is_active",
      header: "Status",
      cell: ({ row }) => <StatusBadge value={row.original.is_active} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original.id)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
