import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtPKR } from "@/components/modal-components/modalcomponents";

export const salaryStructureColumns = ({ onView }) => [
    {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => {
            const item = row.original;
            const emp = item.employee || {};
            const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "—";
            return (
                <div>
                    <div className="font-semibold text-sm leading-tight">{name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: "Structure",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.name || "—"}</span>,
    },
    {
        id: "basic",
        header: "Basic Salary",
        cell: ({ row }) => (
            <span className="text-sm font-mono tabular-nums font-bold text-primary">
                {fmtPKR(row.original.basic_salary)}
            </span>
        ),
    },
    {
        id: "allowances",
        header: "Allowances",
        cell: ({ row }) => (
            <span className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {fmtPKR(row.original.allowance_total)}
            </span>
        ),
    },
    {
        id: "deductions",
        header: "Deductions",
        cell: ({ row }) => (
            <span className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">
                {fmtPKR(row.original.deduction_total)}
            </span>
        ),
    },
    {
        id: "currency",
        header: "Currency",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.currency || "PKR"}</span>,
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={row.original.is_active
                    ? "text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "text-xs font-semibold bg-muted text-muted-foreground border-border"}
            >
                {row.original.is_active ? "Active" : "Inactive"}
            </Badge>
        ),
    },

    {
        id: "actions",
        header: () => <div className="w-full text-center">Actions</div>,
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div className="flex w-full items-center justify-center">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-md px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(item);
                        }}
                    >
                        View
                    </Button>
                </div>
            );
        },
    }
];
