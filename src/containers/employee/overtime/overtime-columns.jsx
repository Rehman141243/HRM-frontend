"use client";

import { fmtDate, StatusBadge } from "@/components/common/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, XCircle } from "lucide-react";

export function getOvertimeColumns({ onCancel, cancellingId } = {}) {
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{fmtDate(row.original.date)}</span>,
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => (
        <span className="tabular-nums text-xs">
          {row.original.start_time} – {row.original.end_time}
        </span>
      ),
    },
    {
      accessorKey: "hours",
      header: "Hours",
      cell: ({ row }) => <span className="tabular-nums text-sm font-medium">{row.original.hours}h</span>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="inline-block max-w-45 truncate text-xs text-muted-foreground">{row.original.reason || "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    // {
    //   id: "actions",
    //   // header: () => <div className="w-full text-center">Actions</div>,
    //   cell: ({ row }) => {
    //     const request = row.original;
    //     const canCancel = request?.status?.toLowerCase?.() === "pending";

    //     if (!canCancel) {
    //       return (
    //         <></>
    //         // <div className="flex w-full items-center justify-center" aria-hidden="true">
    //         //   <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground">-</span>
    //         // </div>
    //       );
    //     }

    //     return (
    //       <></>
    //       // <div className="flex w-full items-center justify-center">
    //       //   <DropdownMenu>
    //       //     {/* <DropdownMenuTrigger asChild>
    //       //       <button
    //       //         type="button"
    //       //         className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    //       //         disabled={!onCancel || cancellingId === request.id}
    //       //       >
    //       //         <MoreHorizontal className="h-4 w-4" />
    //       //         <span className="sr-only">Open actions</span>
    //       //       </button>
    //       //     </DropdownMenuTrigger> */}
    //       //     <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
    //       //       <DropdownMenuItem
    //       //         onClick={() => onCancel?.(request)}
    //       //         className="cursor-pointer text-destructive focus:text-destructive"
    //       //         disabled={cancellingId === request.id}
    //       //       >
    //       //         {cancellingId === request.id ? (
    //       //           <Loader2 className="h-3.5 w-3.5 animate-spin" />
    //       //         ) : (
    //       //           <XCircle className="h-3.5 w-3.5" />
    //       //         )}
    //       //         Cancel
    //       //       </DropdownMenuItem>
    //       //     </DropdownMenuContent>
    //       //   </DropdownMenu>
    //       // </div>
    //     );
    //   },
    // },
  ];
}