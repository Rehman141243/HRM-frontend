"use client";

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { ErrorBanner, Spinner, SuccessBanner, getShiftsColumns, toHHmm } from "./shift-management-columns";
import TableToolbar from "@/components/common/table-toolbar";
import { DataTable } from "@/components/common/data-table";



export default function ShiftsManagementTab({ showActions = true }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const LIMIT = 10;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIMIT);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [deleteDetailsLoading, setDeleteDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    duration_hours: "",
    description: "",
  });

  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const [startH, startM] = formData.start_time.split(":").map(Number);
      const [endH, endM] = formData.end_time.split(":").map(Number);
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      if (endTotal <= startTotal) endTotal += 24 * 60;
      const durationHours = Math.round(((endTotal - startTotal) / 60) * 100) / 100;
      setFormData((prev) => ({ ...prev, duration_hours: durationHours.toString() }));
    }
  }, [formData.start_time, formData.end_time]);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/attendance/shifts", {
        params: { page, limit: pageSize },
      });
      setShifts(data.data || []);
      setTotal(
        data.pagination?.total ??
        data.pagination?.totalItems ??
        data.pagination?.total_items ??
        data.pagination?.totalCount ??
        data.pagination?.total_count ??
        data.pagination?.itemCount ??
        data.total ??
        data.count ??
        0,
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { loadShifts(); }, [loadShifts]);
  const handleSubmit = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time || !formData.duration_hours) {
      setError("Please fill all required fields");
      return;
    }
    const startTime = toHHmm(formData.start_time);
    const endTime = toHHmm(formData.end_time);
    if (!startTime || !endTime) {
      setError("Time must be in HH:mm format (24-hour)");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (editingShift) {
        await axiosInstance.put(`/attendance/shifts/${editingShift.id}`, {
          name: formData.name,
          start_time: startTime,
          end_time: endTime,
          duration_hours: formData.duration_hours,
          description: formData.description || undefined,
        });
        setSuccess("Shift updated successfully");
      } else {
        await axiosInstance.post(`/attendance/shifts`, {
          name: formData.name,
          start_time: startTime,
          end_time: endTime,
          duration_hours: formData.duration_hours,
          description: formData.description || undefined,
        });
        setSuccess("Shift created successfully");
      }
      setDialogOpen(false);
      setEditingShift(null);
      setFormData({ name: "", start_time: "", end_time: "", duration_hours: "", description: "" });
      loadShifts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shift");
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({ name: "", start_time: "", end_time: "", duration_hours: "", description: "" });
    setEditingShift(null);
  };

  const openEditDialog = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: toHHmm(shift.start_time),
      end_time: toHHmm(shift.end_time),
      duration_hours: shift.duration_hours.toString(),
      description: shift.description || "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (shift) => {
    setDeleteTarget(shift);
    setDeleteDialogOpen(true);
    setActiveAssignments([]);
    setError("");
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    setActiveAssignments([]);
  };

  useEffect(() => {
    const loadActiveAssignments = async () => {
      if (!deleteDialogOpen || !deleteTarget) return;
      setDeleteDetailsLoading(true);
      try {
        const { data } = await axiosInstance.get("/attendance/assignments", {
          params: {
            page: 1,
            limit: 100,
            shift_id: deleteTarget.id,
            is_active: true,
          },
        });
        setActiveAssignments(data.data || []);
      } catch (err) {
        setActiveAssignments([]);
      } finally {
        setDeleteDetailsLoading(false);
      }
    };

    loadActiveAssignments();
  }, [deleteDialogOpen, deleteTarget]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.delete(`/attendance/shifts/${deleteTarget.id}`);
      setSuccess("Shift deleted or deactivated successfully");
      closeDeleteDialog();
      loadShifts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete shift");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

      <TableToolbar
        placeholder="Search shifts..."
        searchValue={search}
        onSearchChange={(v) => setSearch(v)}
        rightSlot={showActions ? (
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        ) : null}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shift Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={6} /></div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No shifts defined</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <DataTable
                  data={shifts.filter((s) => (s.name || "").toLowerCase().includes(search.toLowerCase()))}
                  columns={getShiftsColumns({ openEditDialog, setDeleteTarget: openDeleteDialog, showActions })}
                  page={page - 1}
                  pageSize={pageSize}
                  total={total}
                  setPage={(next) => setPage(next + 1)}
                  setPageSize={(size) => { setPageSize(size); setPage(1); }}
                  columnsBtn={false}
                  isLoading={loading}
                  loadingText="Loading shifts…"
                  emptyText="No shifts defined"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      {showActions && (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingShift ? "Edit Shift" : "Create Shift"}</DialogTitle>
            <DialogDescription>
              {editingShift ? "Modify shift details below" : "Define a new work shift"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2">Shift Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Shift"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2">Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2">End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="mb-2">Duration Hours (auto-calculated)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.duration_hours}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              {editingShift ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* Delete Confirmation */}
      {showActions && (
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) closeDeleteDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
              <br />
              If this shift has active assignments, they will be deactivated first automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {deleteDetailsLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size={5} />
              </div>
            ) : activeAssignments.length > 0 ? (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">Active assignments linked to this shift</p>
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {activeAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-md border bg-background p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {assignment.employee
                              ? `${assignment.employee.first_name ?? ""} ${assignment.employee.last_name ?? ""}`.trim()
                              : "Unknown employee"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.employee?.employee_id || "—"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <span>Shift: {assignment.shift?.name || deleteTarget?.name || "—"}</span>
                        <span>Valid from: {assignment.assigned_from || "Start"}</span>
                        <span>Valid to: {assignment.assigned_to || "Ongoing"}</span>
                        <span>Assignment ID: {assignment.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                No active assignments are currently linked to this shift.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              Delete / Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
