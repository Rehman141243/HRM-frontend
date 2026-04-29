import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, fmtDate } from "@/components/common/common";

const formatLeaveType = (value) => value?.replace(/_/g, " ") || "—";

const renderEmployee = (employee) => {
  if (!employee) return <span className="text-muted-foreground">—</span>;

  return (
    <div>
      <p className="text-sm font-medium">{`${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim()}</p>
      {employee.department && (
        <p className="text-xs text-muted-foreground">{employee.department}</p>
      )}
    </div>
  );
};

const canManageLeave = (role, leave) => {
  if (role !== "manager" && role !== "hr") return false;
  if (leave?.status !== "pending") return false;
  if (role === "manager") return leave?.manager_status === "pending";
  if (role === "hr") return leave?.hr_status === "pending";
  return false;
};

const statusCell = ({ getValue }) => <StatusBadge status={getValue()} />;

const dateCell = ({ getValue }) => (
  <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
);

// ─── Pending Columns ──────────────────────────────────────────────────────────
export const getPendingColumns = ({ role, actionId, onApprove, onRejectOpen }) => {
  const columns = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => renderEmployee(row.original.employee),
    },
    {
      accessorKey: "leave_type",
      header: "Type",
      cell: ({ getValue }) => <span className="text-xs">{formatLeaveType(getValue())}</span>,
    },
    {
      accessorKey: "start_date",
      header: "From",
      cell: dateCell,
    },
    {
      accessorKey: "end_date",
      header: "To",
      cell: dateCell,
    },
    {
      accessorKey: "total_days",
      header: "Days",
      cell: ({ getValue }) => <span className="text-xs tabular-nums">{getValue() ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: statusCell,
    },
    {
      accessorKey: "manager_status",
      header: "Mgr Status",
      cell: statusCell,
    },
    {
      accessorKey: "hr_status",
      header: "HR Status",
      cell: statusCell,
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted",
      cell: dateCell,
    },
  ];

  if (role === "manager" || role === "hr") {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const leave = row.original;
        const manageable = canManageLeave(role, leave);

        return (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
              disabled={!manageable || actionId === leave.id}
              onClick={() => onApprove(leave.id)}
            >
              {actionId === leave.id ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <ThumbsUp className="h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-red-500/40 text-red-600 hover:bg-red-500/10"
              disabled={!manageable}
              onClick={() => onRejectOpen(leave.id)}
            >
              <ThumbsDown className="h-3 w-3" />
              Reject
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
};

// ─── History Columns ─────────────────────────────────────────────────────────
export const historyColumns = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => renderEmployee(row.original.employee),
  },
  {
    accessorKey: "leave_type",
    header: "Type",
    cell: ({ getValue }) => <span className="text-xs">{formatLeaveType(getValue())}</span>,
  },
  {
    accessorKey: "start_date",
    header: "From",
    cell: dateCell,
  },
  {
    accessorKey: "end_date",
    header: "To",
    cell: dateCell,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: statusCell,
  },
  {
    accessorKey: "manager_status",
    header: "Mgr Status",
    cell: statusCell,
  },
  {
    accessorKey: "hr_status",
    header: "HR Status",
    cell: statusCell,
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted",
    cell: dateCell,
  },
];
