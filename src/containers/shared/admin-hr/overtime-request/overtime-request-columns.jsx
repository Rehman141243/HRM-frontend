import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";

export const fmtDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const fmtTime = (timeStr) => {
  if (!timeStr) return "-";
  return timeStr.substring(0, 5);
};

export const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", label: "Pending" },
    approved: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "Approved" },
    rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Rejected" },
    cancelled: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", label: "Cancelled" },
  };
  const st = config[status] || config.pending;
  return (
    <div className={`${st.bg} ${st.border} ${st.text} px-2 py-0.5 rounded text-xs font-medium border inline-block`}>
      {st.label}
    </div>
  );
};

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

const dateCell = ({ getValue }) => (
  <span className="text-xs text-muted-foreground">{fmtDate(getValue())}</span>
);

export const getPendingOvertimeColumns = ({ role, actionId, onApprove, onRejectOpen }) => [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => renderEmployee(row.original.employee),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: dateCell,
  },
  {
    accessorKey: "start_time",
    header: "Start",
    cell: ({ getValue }) => <span className="text-xs">{fmtTime(getValue())}</span>,
  },
  {
    accessorKey: "end_time",
    header: "End",
    cell: ({ getValue }) => <span className="text-xs">{fmtTime(getValue())}</span>,
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ getValue }) => <span className="font-medium">{getValue()}h</span>,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
  {
    accessorKey: "requested_at",
    header: "Requested",
    cell: dateCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const overtime = row.original;
      const canApprove = overtime.status === "pending" && (role === "admin" || role === "hr" || role === "manager");
      return canApprove ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5"
            disabled={actionId === overtime.id}
            onClick={() => onApprove(overtime.id)}
          >
            {actionId === overtime.id ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-destructive hover:text-destructive"
            disabled={actionId === overtime.id}
            onClick={() => onRejectOpen(overtime.id)}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span className="text-xs">Reject</span>
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
];

export const getHistoryOvertimeColumns = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => renderEmployee(row.original.employee),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: dateCell,
  },
  {
    accessorKey: "start_time",
    header: "Start",
    cell: ({ getValue }) => <span className="text-xs">{fmtTime(getValue())}</span>,
  },
  {
    accessorKey: "end_time",
    header: "End",
    cell: ({ getValue }) => <span className="text-xs">{fmtTime(getValue())}</span>,
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ getValue }) => <span className="font-medium">{getValue()}h</span>,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  },
  {
    accessorKey: "requested_at",
    header: "Requested",
    cell: dateCell,
  },
];
