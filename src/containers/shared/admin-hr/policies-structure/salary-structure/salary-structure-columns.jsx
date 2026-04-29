'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeSalaryStructure, fmtPKR } from "@/components/modal-components/modalcomponents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const salaryStructureHeaders = [
  { key: "name", label: "Name", width: "20%" },
  { key: "employee", label: "Employee", width: "20%" },
  { key: "basic_salary", label: "Basic Salary", width: "15%" },
  { key: "effective_from", label: "Effective From", width: "15%" },
  { key: "is_active", label: "Status", width: "10%" },
];

export const getSalarySummaryFields = (structure) => {
  const normalized = normalizeSalaryStructure(structure);
  return {
    name: normalized.name || "—",
    employee: normalized.employee?.name || normalized.employee?.email || "—",
    basic_salary: normalized.basic_salary ? fmtPKR(normalized.basic_salary) : "—",
    effective_from: normalized.effective_from ? new Date(normalized.effective_from).toLocaleDateString() : "—",
    is_active: normalized.is_active ? "Active" : "Inactive",
  };
};

export const buildSalaryStructureColumns = ({ onView, onEdit, canEdit }) => ([
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      const employee = structure.employee || {};
      return (
        <div>
          <div className="font-semibold text-sm leading-tight">
            {employee.first_name} {employee.last_name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {employee.designation || "—"}
          </div>
        </div>
      );
    },
  },
  {
    id: "name",
    header: "Structure",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return <span className="text-sm text-muted-foreground">{structure.name || "—"}</span>;
    },
  },
  {
    id: "basic_salary",
    header: "Basic Salary",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return <span className="text-sm font-mono tabular-nums font-bold text-primary">{fmtPKR(structure.basic_salary)}</span>;
    },
  },
  {
    id: "allowances",
    header: "Allowances",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return <span className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{fmtPKR(structure.allowance_total)}</span>;
    },
  },
  {
    id: "deductions",
    header: "Deductions",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return <span className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">{fmtPKR(structure.deduction_total)}</span>;
    },
  },
  {
    id: "currency",
    header: "Currency",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return <span className="text-sm text-muted-foreground">{structure.currency || "PKR"}</span>;
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-semibold",
            structure.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {structure.is_active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    enableHiding: false,
    cell: ({ row }) => {
      const structure = normalizeSalaryStructure(row.original);
      return (
        <div className="flex items-center justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView?.(structure)}>
                <Eye className="h-4 w-4" />
                View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(structure)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
]);
