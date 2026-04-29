"use client";

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ErrorBanner,
  Spinner,
  StatusBadge,
  SuccessBanner,
} from "./shift-management-columns";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getEmployeeAssignmentColumns } from "./shift-management-columns";

const MODE_ASSIGN = "assign";
const MODE_REASSIGN = "reassign";

const EMPTY_FORM = {
  employee_id: "",
  shift_id: "",
  assigned_from: "",
  assigned_to: "",
};

export default function EmployeeAssignmentsTab({ showActions = true }) {
  const [assignments, setAssignments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(MODE_ASSIGN);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignmentsRes, shiftsRes, employeesRes] = await Promise.all([
        axiosInstance.get("/attendance/assignments", {
          params: {
            page,
            limit: pageSize,
            ...(filterActive !== "all" && { is_active: filterActive === "true" }),
            ...(filterEmployee && { employee_id: filterEmployee }),
            ...(filterShift && { shift_id: filterShift }),
          },
        }),
        axiosInstance.get("/attendance/shifts", { params: { limit: 100 } }),
        axiosInstance.get("/employee", { params: { page: 1, limit: 50 } }),
      ]);
      setAssignments(assignmentsRes.data.data || []);
      setTotal(assignmentsRes.data.pagination?.total || 0);
      setShifts(shiftsRes.data.data || []);
      setEmployees(employeesRes.data.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterActive, filterEmployee, filterShift]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(1); }, [filterActive, filterEmployee, filterShift]);

  const openAssignDialog = () => {
    setDialogMode(MODE_ASSIGN);
    setEditingAssignment(null);
    setFormData(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  };

  const openReassignDialog = (assignment) => {
    setDialogMode(MODE_REASSIGN);
    setEditingAssignment(assignment);
    setFormData({
      employee_id: assignment.employee?.id || assignment.employee_id || "",
      shift_id: assignment.shift?.id || assignment.shift_id || "",
      assigned_from: assignment.assigned_from || "",
      assigned_to: assignment.assigned_to || "",
    });
    setError("");
    setDialogOpen(true);
  };

  const openDeactivateDialog = (assignment) => {
    setDeactivateTarget(assignment);
    setError("");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAssignment(null);
    setFormData(EMPTY_FORM);
  };

  const closeDeactivateDialog = () => {
    setDeactivateTarget(null);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.shift_id) {
      setError("Please select both employee and shift");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (dialogMode === MODE_ASSIGN) {
        await axiosInstance.post("/attendance/assignments", {
          employee_id: formData.employee_id,
          shift_id: formData.shift_id,
          assigned_from: formData.assigned_from || undefined,
          assigned_to: formData.assigned_to || undefined,
        });
        setSuccess("Shift assigned successfully");
      } else {
        await axiosInstance.put(`/attendance/assignments/${editingAssignment.id}`, {
          shift_id: formData.shift_id,
          assigned_from: formData.assigned_from || undefined,
          assigned_to: formData.assigned_to || undefined,
        });
        setSuccess("Assignment updated successfully");
      }
      closeDialog();
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (assignment) => {
    const next = !assignment.is_active;
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.put(`/attendance/assignments/${assignment.id}`, { is_active: next });
      setSuccess(`Assignment ${next ? "activated" : "deactivated"}`);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.put(`/attendance/assignments/${deactivateTarget.id}`, { is_active: false });
      setSuccess("Assignment deactivated successfully");
      closeDeactivateDialog();
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const shiftLabel = (assignment) =>
    assignment.shift?.name
      ? `${assignment.shift.name} (${assignment.shift.start_time}–${assignment.shift.end_time})`
      : "—";

  const employeeLabel = (assignment) =>
    assignment.employee
      ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
      : "—";

  return (
    <div className="flex flex-col gap-4">
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

      <TableToolbar
        total={total}
        rightSlot={(
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 flex-1 flex-wrap">
              <Select
                value={filterEmployee || "all"}
                onValueChange={(v) => setFilterEmployee(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterShift || "all"}
                onValueChange={(v) => setFilterShift(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by shift" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                  <SelectItem value="all">All Shifts</SelectItem>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterActive}
                onValueChange={setFilterActive}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => { setFilterEmployee(""); setFilterShift(""); setFilterActive("all"); }}
              >
                Clear
              </Button>
            </div>

            {showActions && (
              <Button onClick={openAssignDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Assign Shift
              </Button>
            )}
          </div>
        )}
      />

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Employee Shift Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size={6} />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No shift assignments found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DataTable
                  data={assignments}
                  columns={getEmployeeAssignmentColumns({
                    employeeLabel,
                    shiftLabel,
                    openReassignDialog,
                    openDeactivateDialog,
                    handleToggleActive,
                    showActions,
                    submitting,
                  })}
                  page={page - 1}
                  pageSize={pageSize}
                  total={total}
                  setPage={(next) => setPage(next + 1)}
                  setPageSize={(size) => { setPageSize(size); setPage(1); }}
                  columnsBtn={false}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign / Reassign Dialog */}
      {showActions && (
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === MODE_ASSIGN ? "Assign Shift to Employee" : "Change Employee's Shift"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === MODE_ASSIGN
                ? "Select an employee and the shift to assign."
                : "Review the current assignment before changing the shift."}
            </DialogDescription>
            {dialogMode === MODE_REASSIGN && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Updating assignment for{" "}
                  <span className="font-medium text-foreground">
                    {editingAssignment ? employeeLabel(editingAssignment) : ""}
                  </span>
                  . Current shift:
                </span>
                <Badge variant="secondary" className="text-xs">
                  {editingAssignment?.shift?.name || "—"}
                </Badge>
              </div>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2">
                Employee <span className="text-destructive">*</span>
              </Label>
              {dialogMode === MODE_REASSIGN ? (
                <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  {editingAssignment ? employeeLabel(editingAssignment) : "—"}
                </div>
              ) : (
                <Select
                  value={formData.employee_id}
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label className="mb-2">
                {dialogMode === MODE_REASSIGN ? "New Shift" : "Shift"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.shift_id}
                onValueChange={(v) => setFormData({ ...formData, shift_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time}–{shift.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2">Valid From</Label>
                <Input
                  type="date"
                  value={formData.assigned_from}
                  onChange={(e) => setFormData({ ...formData, assigned_from: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2">Valid To</Label>
                <Input
                  type="date"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              {dialogMode === MODE_ASSIGN ? "Assign" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {showActions && (
      <Dialog open={!!deactivateTarget} onOpenChange={(open) => { if (!open) closeDeactivateDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Assignment</DialogTitle>
            <DialogDescription>
              This will deactivate the selected assignment. The employee will no longer be assigned to the shift.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Employee:
                <span className="ml-1 font-medium text-foreground">
                  {deactivateTarget ? employeeLabel(deactivateTarget) : "—"}
                </span>
              </span>
              <span className="text-muted-foreground/70">•</span>
              <span>
                Shift:
                <Badge variant="secondary" className="ml-1 text-xs">
                  {deactivateTarget?.shift?.name || "—"}
                </Badge>
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDeactivateDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
