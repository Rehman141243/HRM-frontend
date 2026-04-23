'use client'
import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../admin-shift";
import { ChevronLeft, ChevronRight, PauseCircle, PlayCircle, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"

export default function EmployeeAssignmentsTab() {
    const [assignments, setAssignments] = useState([])
    const [shifts, setShifts] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [filterEmployee, setFilterEmployee] = useState("")
    const [filterShift, setFilterShift] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
      employee_id: "",
      shift_id: "",
      assigned_from: "",
      assigned_to: "",
    })
    const LIMIT = 10
  
    const loadData = useCallback(async () => {
      setLoading(true)
      try {
        // Load assignments - using /attendance/assignments endpoint
        const assignmentsRes = await axiosInstance.get("/attendance/assignments", {
          params: {
            page,
            limit: LIMIT,
            ...(filterEmployee && { employee_id: filterEmployee }),
            ...(filterShift && { shift_id: filterShift })
          }
        })
  
        // Load shifts
        const shiftsRes = await axiosInstance.get("/attendance/shifts", { params: { limit: 100 } })
  
        // Load employees - with proper pagination params
        const employeesRes = await axiosInstance.get("/employee", {
          params: { page: 1, limit: 50 }
        })
  
        setAssignments(assignmentsRes.data.data || [])
        setTotal(assignmentsRes.data.pagination?.total || 0)
        setShifts(shiftsRes.data.data || [])
        setEmployees(employeesRes.data.employees || [])
      } catch (err) {
        console.error("Load data error:", err)
        setError(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }, [page, filterEmployee, filterShift])
  
    useEffect(() => { loadData() }, [loadData])
    useEffect(() => { setPage(1) }, [filterEmployee, filterShift])
  
    const handleAssign = async () => {
      if (!formData.employee_id || !formData.shift_id) {
        setError("Please select both employee and shift")
        return
      }
      setSubmitting(true)
      setError("")
      try {
        await axiosInstance.post("/attendance/assignments", {
          employee_id: formData.employee_id,
          shift_id: formData.shift_id,
          assigned_from: formData.assigned_from || undefined,
          assigned_to: formData.assigned_to || undefined,
        })
        setSuccess("Shift assigned successfully")
        setDialogOpen(false)
        setFormData({ employee_id: "", shift_id: "", assigned_from: "", assigned_to: "" })
        loadData()
        setTimeout(() => setSuccess(""), 3000)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to assign shift")
      } finally {
        setSubmitting(false)
      }
    }
  
    // const handleUnassign = async (id) => {
    //   if (!confirm("Remove this shift assignment?")) return;
    //   setSubmitting(true);
    //   try {
    //     await axiosInstance.delete(`/attendance/assignments/${id}`);
    //     setSuccess("Assignment removed");
    //     loadData();
    //     setTimeout(() => setSuccess(""), 3000);
    //   } catch (err) {
    //     setError(err.response?.data?.message || "Failed to remove assignment");
    //   } finally {
    //     setSubmitting(false);
    //   }
    // };
    const handleUnassign = async (id) => {
      if (!confirm("Remove this shift assignment?")) return
  
      setSubmitting(true)
      setError("")
  
      try {
        await axiosInstance.put(`/attendance/assignments/${id}`, {
          is_active: false,
        })
  
        setSuccess("Assignment deactivated")
        loadData()
        setTimeout(() => setSuccess(""), 3000)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to remove assignment")
      } finally {
        setSubmitting(false)
      }
    }
  
    const totalPages = Math.ceil(total / LIMIT)
  
    return (
      <div className="flex flex-col gap-4">
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        <SuccessBanner message={success} onDismiss={() => setSuccess("")} />
  
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-1 flex-wrap">
            <Select value={filterEmployee || "all"} onValueChange={(v) => setFilterEmployee(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            <Select value={filterShift || "all"} onValueChange={(v) => setFilterShift(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            <Button variant="outline" onClick={() => { setFilterEmployee(""); setFilterShift("") }}>
              Clear
            </Button>
          </div>
  
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Assign Shift
          </Button>
        </div>
  
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Employee Shift Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Spinner size={6} /></div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No shift assignments found</div>
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
                        <tr key={assign.id} className="border-b border-border/40 last:border-0">
                          <td className="py-3">
                            {assign.employee?.first_name} {assign.employee?.last_name}
                            <br />
                            <span className="text-xs text-muted-foreground">{assign.employee?.employee_id || "—"}</span>
                          </td>
                          <td className="py-3">{assign.shift?.name || "—"}</td>
                          <td className="py-3">{assign.assigned_from || "Start"}</td>
                          <td className="py-3">{assign.assigned_to || "Ongoing"}</td>
                          <td className="py-3"><StatusBadge status={assign.is_active ? "active" : "inactive"} /></td>
                          <td className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={assign.is_active ? "text-amber-500" : "text-emerald-500"}
                              onClick={() => handleUnassign(assign.id)}
                              disabled={submitting}
                            >
                              {assign.is_active ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
  
        {/* Assign Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Shift to Employee</DialogTitle>
              <DialogDescription>Select employee and shift to assign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
  
              <div>
                <Label>Shift *</Label>
                <Select value={formData.shift_id} onValueChange={(v) => setFormData({ ...formData, shift_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start_time}–{shift.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={formData.assigned_from}
                    onChange={(e) => setFormData({ ...formData, assigned_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Valid To</Label>
                  <Input
                    type="date"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={submitting}>
                {submitting && <Spinner size={4} />}
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }