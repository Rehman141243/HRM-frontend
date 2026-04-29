import { Loader2, MoreHorizontal, PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 4 }) {
  return <Loader2 className={`h-${size} w-${size} animate-spin text-muted-foreground`} />;
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
export function ErrorBanner({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    toast.error(message);
    onDismiss?.();
  }, [message, onDismiss]);
  return null;
}

// ─── Success Banner 
export function SuccessBanner({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    toast.success(message);
    onDismiss?.();
  }, [message, onDismiss]);
  return null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const variants = {
    approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${variants[status] || "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
        }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1) || status}
    </span>
  );
}

// ─── Helper: format time to HH:mm ─────────────────────────────────────────────
export const toHHmm = (value) => {
  if (!value) return "";
  const directMatch = String(value).match(/(\d{2}):(\d{2})/);
  if (directMatch) return `${directMatch[1]}:${directMatch[2]}`;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const h = String(parsed.getHours()).padStart(2, "0");
    const m = String(parsed.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return "";
};

// ─── Shifts management columns factory ────────────────────────────────────────
export const getShiftsColumns = ({ openEditDialog, setDeleteTarget, showActions = true }) => {
  const baseColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "start_time", header: "Start", cell: ({ getValue }) => toHHmm(getValue()) },
  { accessorKey: "end_time", header: "End", cell: ({ getValue }) => toHHmm(getValue()) },
  { accessorKey: "duration_hours", header: "Duration", cell: ({ getValue }) => `${getValue()}h` },
  { accessorKey: "is_active", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} /> },
  ];

  if (!showActions) return baseColumns;

  return [
    ...baseColumns,
    {
      id: "actions",
      header: () => <div className="">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-start pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setDeleteTarget(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};

// ─── Employee assignment columns factory ─────────────────────────────────────
export const getEmployeeAssignmentColumns = ({
  employeeLabel,
  shiftLabel,
  openReassignDialog,
  openDeactivateDialog,
  handleToggleActive,
  submitting,
  showActions = true,
}) => {
  const baseColumns = [
    { accessorKey: "employee", header: "Employee", cell: ({ row }) => employeeLabel(row.original) },
    { accessorKey: "shift", header: "Shift", cell: ({ row }) => shiftLabel(row.original) },
    { accessorKey: "assigned_from", header: "Valid From", cell: ({ getValue }) => getValue() || "Start" },
    { accessorKey: "assigned_to", header: "Valid To", cell: ({ getValue }) => getValue() || "Ongoing" },
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} /> },
  ];

  if (!showActions) return baseColumns;

  return [
    ...baseColumns,
    {
      id: "actions",
      header: () => <div className="pr-2">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-start pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {row.original.is_active && (
                <DropdownMenuItem onClick={() => openDeactivateDialog(row.original)} disabled={submitting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {row.original.is_active && (
                <DropdownMenuItem onClick={() => openReassignDialog(row.original)} disabled={submitting}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Change
                </DropdownMenuItem>
              )}
              {!row.original.is_active && (
                <DropdownMenuItem
                  onClick={() => handleToggleActive(row.original)}
                  disabled={submitting}
                  className="text-emerald-600 focus:text-emerald-600"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
};
