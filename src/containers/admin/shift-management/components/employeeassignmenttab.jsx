'use client'
import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../admin-shift"
import { ChevronLeft, ChevronRight, PauseCircle, PlayCircle, Plus, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// ─── Dialog modes ─────────────────────────────────────────────────────────────
const MODE_ASSIGN   = "assign";
const MODE_REASSIGN = "reassign";

const EMPTY_FORM = {
  employee_id: "",
  shift_id: "",
  assigned_from: "",
  assigned_to: "",
};

export default function EmployeeAssignmentsTab() {
  const [assignments, setAssignments]   = useState([])
  const [shifts, setShifts]             = useState([])
  const [employees, setEmployees]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState("")
  const [success, setSuccess]           = useState("")
  const [page, setPage]                 = useState(1)
  const [total, setTotal]               = useState(0)
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterShift, setFilterShift]   = useState("")

  // Dialog state
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [dialogMode, setDialogMode]     = useState(MODE_ASSIGN)   // "assign" | "reassign"
  const [editingAssignment, setEditingAssignment] = useState(null) // full row being reassigned
  const [submitting, setSubmitting]     = useState(false)
  const [formData, setFormData]         = useState(EMPTY_FORM)

  const LIMIT = 10

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [assignmentsRes, shiftsRes, employeesRes] = await Promise.all([
        axiosInstance.get("/attendance/assignments", {
          params: {
            page,
            limit: LIMIT,
            ...(filterEmployee && { employee_id: filterEmployee }),
            ...(filterShift    && { shift_id:    filterShift }),
          },
        }),
        axiosInstance.get("/attendance/shifts",  { params: { limit: 100 } }),
        axiosInstance.get("/employee",            { params: { page: 1, limit: 50 } }),
      ])

      setAssignments(assignmentsRes.data.data       || [])
      setTotal(assignmentsRes.data.pagination?.total || 0)
      setShifts(shiftsRes.data.data                 || [])
      setEmployees(employeesRes.data.employees      || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [page, filterEmployee, filterShift])

  useEffect(() => { loadData() },                    [loadData])
  useEffect(() => { setPage(1) },                    [filterEmployee, filterShift])

  // ── Open dialogs ──────────────────────────────────────────────────────────
  const openAssignDialog = () => {
    setDialogMode(MODE_ASSIGN)
    setEditingAssignment(null)
    setFormData(EMPTY_FORM)
    setError("")
    setDialogOpen(true)
  }

  const openReassignDialog = (assignment) => {
    setDialogMode(MODE_REASSIGN)
    setEditingAssignment(assignment)
    setFormData({
      employee_id:   assignment.employee?.id || assignment.employee_id || "",
      shift_id:      assignment.shift?.id    || assignment.shift_id    || "",
      assigned_from: assignment.assigned_from || "",
      assigned_to:   assignment.assigned_to  || "",
    })
    setError("")
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingAssignment(null)
    setFormData(EMPTY_FORM)
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.shift_id) {
      setError("Please select both employee and shift")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      if (dialogMode === MODE_ASSIGN) {
        // New assignment
        await axiosInstance.post("/attendance/assignments", {
          employee_id:   formData.employee_id,
          shift_id:      formData.shift_id,
          assigned_from: formData.assigned_from || undefined,
          assigned_to:   formData.assigned_to   || undefined,
        })
        setSuccess("Shift assigned successfully")
      } else {
        // Reassign: update the existing assignment row
        await axiosInstance.put(`/attendance/assignments/${editingAssignment.id}`, {
          shift_id:      formData.shift_id,
          assigned_from: formData.assigned_from || undefined,
          assigned_to:   formData.assigned_to   || undefined,
        })
        setSuccess("Assignment updated successfully")
      }
      closeDialog()
      loadData()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save assignment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (assignment) => {
    const next = !assignment.is_active
    if (!confirm(`${next ? "Activate" : "Deactivate"} this assignment?`)) return
    setSubmitting(true)
    setError("")
    try {
      await axiosInstance.put(`/attendance/assignments/${assignment.id}`, { is_active: next })
      setSuccess(`Assignment ${next ? "activated" : "deactivated"}`)
      loadData()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update assignment")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  // ── Helpers ───────────────────────────────────────────────────────────────
  const shiftLabel = (assignment) =>
    assignment.shift?.name
      ? `${assignment.shift.name} (${assignment.shift.start_time}–${assignment.shift.end_time})`
      : "—"

  const employeeLabel = (assignment) =>
    assignment.employee
      ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
      : "—"

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <ErrorBanner   message={error}   onDismiss={() => setError("")} />
      <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-1 flex-wrap">
          <Select
            value={filterEmployee || "all"}
            onValueChange={(v) => setFilterEmployee(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => { setFilterEmployee(""); setFilterShift("") }}
          >
            Clear
          </Button>
        </div>

        <Button onClick={openAssignDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Shift
        </Button>
      </div>

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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-3 text-left font-medium">Employee</th>
                      <th className="py-3 text-left font-medium">Shift</th>
                      <th className="py-3 text-left font-medium">Valid From</th>
                      <th className="py-3 text-left font-medium">Valid To</th>
                      <th className="py-3 text-left font-medium">Status</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assign) => (
                      <tr
                        key={assign.id}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="py-3 font-medium">{employeeLabel(assign)}</td>
                        <td className="py-3 text-muted-foreground">{shiftLabel(assign)}</td>
                        <td className="py-3 text-muted-foreground">
                          {assign.assigned_from || "Start"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {assign.assigned_to || "Ongoing"}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={assign.is_active ? "active" : "inactive"} />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Change shift button — only when active */}
                            {assign.is_active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 gap-1 px-2"
                                onClick={() => openReassignDialog(assign)}
                                disabled={submitting}
                                title="Change shift"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Change
                              </Button>
                            )}

                            {/* Toggle active/inactive */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                assign.is_active
                                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                                  : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              }
                              onClick={() => handleToggleActive(assign)}
                              disabled={submitting}
                              title={assign.is_active ? "Deactivate" : "Activate"}
                            >
                              {assign.is_active ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign / Reassign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === MODE_ASSIGN ? "Assign Shift to Employee" : "Change Employee's Shift"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === MODE_ASSIGN
                ? "Select an employee and the shift to assign."
                : (
                  <span className="mt-3 ">
                    Updating assignment for{" "}
                    <span className="font-medium text-foreground">
                      {editingAssignment ? employeeLabel(editingAssignment) : ""}
                    </span>
                    . Current shift:{" "}
                    <Badge variant="secondary" className="text-xs mt-2">
                      {editingAssignment?.shift?.name || "—"}
                    </Badge>
                  </span>
                )
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Employee selector — locked in reassign mode */}
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

            {/* Shift selector */}
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

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2">Valid From</Label>
                <Input
                  type="date"
                  value={formData.assigned_from}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_from: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2">Valid To</Label>
                <Input
                  type="date"
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              {dialogMode === MODE_ASSIGN ? "Assign" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}