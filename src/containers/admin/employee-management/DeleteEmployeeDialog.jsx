import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button"
export default function DeleteEmployeeDialog({ employee, open, onCancel, onConfirm, isDeleting }) {
    const name =
      employee
        ? [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "this employee"
        : "this employee"
  
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-base">Delete Employee</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{name}</span>? This
              action cannot be undone and will permanently remove the employee
              record.
            </DialogDescription>
          </DialogHeader>
  
          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }