import { Button } from "@/components/ui/button";
import { MONTH_SHORT, StatusBadge, fmtNum, fmtPKR } from "@/components/modal-components/modalcomponents";

export function getPayrollColumns({ onView }) {
  return [
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => {
        const payroll = row.original;
        return (
          <div className="text-sm font-medium whitespace-nowrap">
            {MONTH_SHORT[(payroll.period.month || 1) - 1]} {payroll.period.year}
          </div>
        );
      },
    },
    {
      id: "working_days",
      header: "Working Days",
      cell: ({ row }) => (
        <div className="text-sm text-center tabular-nums text-muted-foreground">
          {fmtNum(row.original.period.working_days)}
        </div>
      ),
    },
    {
      id: "payable_days",
      header: "Payable Days",
      cell: ({ row }) => (
        <div className="text-sm text-center tabular-nums font-bold text-primary">
          {fmtNum(row.original.attendance.payable_days)}
        </div>
      ),
    },
    {
      id: "gross",
      header: "Gross",
      cell: ({ row }) => (
        <div className="text-sm font-mono tabular-nums text-muted-foreground">
          {fmtPKR(row.original.totals.gross_salary)}
        </div>
      ),
    },
    {
      id: "deductions",
      header: "Deductions",
      cell: ({ row }) => (
        <div className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">
          -{fmtPKR(row.original.totals.deductions_total)}
        </div>
      ),
    },
    {
      id: "net_salary",
      header: "Net Salary",
      cell: ({ row }) => (
        <div className="text-sm font-mono tabular-nums font-bold">
          {fmtPKR(row.original.totals.net_salary)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onView(row.original);
          }}
        >
          View
        </Button>
      ),
    },
  ];
}
