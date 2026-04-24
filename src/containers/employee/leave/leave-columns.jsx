"use client";

import { fmtDate, StatusBadge } from "@/components/common/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, XCircle } from "lucide-react";

export const leaveTypeLabel = {
  full_day: "Full Day",
  half_day: "Half Day",
  short_leave: "Short Leave",
};

export function getLeaveColumns({ onCancel, cancellingId } = {}) {
  return [
    {
      accessorKey: "leave_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{leaveTypeLabel[row.original.leave_type] || row.original.leave_type}</span>
      ),
    },
    {
      accessorKey: "start_date",
      header: "From",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.start_date)}</span>,
    },
    {
      accessorKey: "end_date",
      header: "To",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.end_date)}</span>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="inline-block max-w-45 truncate text-xs text-muted-foreground">{row.original.reason || "-"}</span>
      ),
    },
    {
      accessorKey: "submitted_at",
      header: "Applied",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.submitted_at || row.original.created_at)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const leave = row.original;
        const canCancel = leave?.status?.toLowerCase?.() === "pending";

        if (!canCancel) return <span className="text-xs text-muted-foreground text-center ml-3.5">-</span>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!onCancel || cancellingId === leave.id}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
              <DropdownMenuItem
                onClick={() => onCancel?.(leave)}
                className="cursor-pointer text-destructive focus:text-destructive"
                disabled={cancellingId === leave.id}
              >
                {cancellingId === leave.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}