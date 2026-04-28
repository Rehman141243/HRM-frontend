"use client";

import { Badge } from "@/components/ui/badge";

function StatusBadge({ value }) {
  const variant =
    value === "Active" ? "default" : value === "On Leave" ? "secondary" : "outline";
  return <Badge variant={variant}>{value}</Badge>;
}

export const employeeColumns = [
  {
    accessorKey: "id",
    header: "Employee ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    meta: { label: "Employee ID" },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <div className="font-medium text-foreground">{row.getValue("name")}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
    meta: { label: "Name" },
  },
  {
    accessorKey: "department",
    header: "Department",
    meta: { label: "Department" },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: { label: "Role" },
  },
  {
    accessorKey: "joinDate",
    header: "Joining Date",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">{row.getValue("joinDate")}</span>
    ),
    meta: { label: "Joining Date" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.getValue("status")} />,
    meta: { label: "Status" },
  },
];

