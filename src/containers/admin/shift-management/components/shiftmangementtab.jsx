// import React, { useCallback, useEffect, useState } from "react";
// import axiosInstance from "@/lib/axiosInstance"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//   } from "@/components/ui/dialog"
//   import {
  
//     ChevronLeft,
//     ChevronRight,
//     Pencil,
//     Plus,
//     Search,
//     Trash2,
   
//   } from "lucide-react"
// import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../admin-shift";

// function toHHmm(value) {
//   if (!value) return "";

//   const directMatch = String(value).match(/(\d{2}):(\d{2})/);
//   if (directMatch) {
//     return `${directMatch[1]}:${directMatch[2]}`;
//   }

//   const parsed = new Date(value);
//   if (!Number.isNaN(parsed.getTime())) {
//     const h = String(parsed.getHours()).padStart(2, "0");
//     const m = String(parsed.getMinutes()).padStart(2, "0");
//     return `${h}:${m}`;
//   }

//   return "";
// }

// export default function ShiftsManagementTab() {
//   const [shifts, setShifts] =useState([])
//   const [loading, setLoading] =useState(true)
//   const [error, setError] =useState("")
//   const [success, setSuccess] =useState("")
//   const [page, setPage] =useState(1)
//   const [total, setTotal] =useState(0)
//   const [search, setSearch] =useState("")
//   const [dialogOpen, setDialogOpen] =useState(false)
//   const [editingShift, setEditingShift] =useState(null)
//   const [deleteTarget, setDeleteTarget] =useState(null)
//   const [submitting, setSubmitting] =useState(false)
//   const LIMIT = 10

//   const [formData, setFormData] =useState({
//     name: "",
//     start_time: "",
//     end_time: "",
//     duration_hours: "",
//     description: "",
//   })

//   // Auto-calculate duration when times change
//  useEffect(() => {
//     if (formData.start_time && formData.end_time) {
//       const [startH, startM] = formData.start_time.split(":").map(Number)
//       const [endH, endM] = formData.end_time.split(":").map(Number)

//       let startTotal = startH * 60 + startM
//       let endTotal = endH * 60 + endM

//       if (endTotal <= startTotal) {
//         endTotal += 24 * 60
//       }

//       const durationMinutes = endTotal - startTotal
//       const durationHours = Math.round((durationMinutes / 60) * 100) / 100

//       setFormData(prev => ({ ...prev, duration_hours: durationHours.toString() }))
//     }
//   }, [formData.start_time, formData.end_time])

//   const loadShifts =useCallback(async () => {
//     setLoading(true)
//     setError("")
//     try {
//       const { data } = await axiosInstance.get("/attendance/shifts", {
//         params: { page, limit: LIMIT }
//       })
//       // Your API returns data directly, not wrapped in data.data
//       setShifts(data.data || [])
//       setTotal(data.pagination?.total || 0)
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load shifts")
//     } finally {
//       setLoading(false)
//     }
//   }, [page])

//  useEffect(() => {
//     loadShifts()
//   }, [loadShifts])

//   const handleSubmit = async () => {
//     if (!formData.name || !formData.start_time || !formData.end_time || !formData.duration_hours) {
//       setError("Please fill all required fields")
//       return
//     }

//     const startTime = toHHmm(formData.start_time)
//     const endTime = toHHmm(formData.end_time)

//     if (!startTime || !endTime) {
//       setError("Time must be in HH:mm format (24-hour)")
//       return
//     }

//     setSubmitting(true)
//     setError("")
//     try {
//       if (editingShift) {
//         await axiosInstance.put(`/attendance/shifts/${editingShift.id}`, {
//           name: formData.name,
//           start_time: startTime,
//           end_time: endTime,
//           duration_hours: parseFloat(formData.duration_hours),
//         })
//         setSuccess("Shift updated successfully")
//       } else {
//         await axiosInstance.post("/attendance/shifts", {
//           name: formData.name,
//           start_time: startTime,
//           end_time: endTime,
//           duration_hours: parseFloat(formData.duration_hours),
//         })
//         setSuccess("Shift created successfully")
//       }
//       setDialogOpen(false)
//       resetForm()
//       loadShifts()
//       setTimeout(() => setSuccess(""), 3000)
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to save shift")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleDelete = async () => {
//     if (!deleteTarget) return
//     setSubmitting(true)
//     setError("")
//     try {
//       // Step 1: try to deactivate first (in case it has assignments)
//       try {
//         await axiosInstance.patch(`/attendance/shifts/${deleteTarget.id}/status`, {
//           is_active: false,
//         })
//       } catch (deactivateErr) {
//         // If it's already inactive or doesn't need deactivation, continue
//         const msg = deactivateErr.response?.data?.message || ""
//         if (!msg.toLowerCase().includes("already") && deactivateErr.response?.status !== 400) {
//           // ignore, still try to delete
//         }
//       }

//       // Step 2: now delete
//       const res = await axiosInstance.delete(`/attendance/shifts/${deleteTarget.id}`)
//       const result = res.data?.data

//       if (result?.action === "archived") {
//         setSuccess(result.message || "Shift deactivated (has attendance history, cannot be deleted)")
//       } else {
//         setSuccess("Shift deleted successfully")
//       }

//       setDeleteTarget(null)
//       loadShifts()
//       setTimeout(() => setSuccess(""), 5000)
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to delete shift")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const resetForm = () => {
//     setFormData({ name: "", start_time: "", end_time: "", duration_hours: "", description: "" })
//     setEditingShift(null)
//   }

//   const openEditDialog = (shift) => {
//     setEditingShift(shift)
//     setFormData({
//       name: shift.name,
//       start_time: toHHmm(shift.start_time),
//       end_time: toHHmm(shift.end_time),
//       duration_hours: shift.duration_hours.toString(),
//       description: shift.description || "",
//     })
//     setDialogOpen(true)
//   }

//   const totalPages = Math.ceil(total / LIMIT)

//   return (
//     <div className="flex flex-col gap-4">
//       <ErrorBanner message={error} onDismiss={() => setError("")} />
//       <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

//       <div className="flex items-center justify-between gap-4 flex-wrap">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search shifts..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-9"
//           />
//         </div>
//         <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
//           <Plus className="h-4 w-4" />
//           Add Shift
//         </Button>
//       </div>

//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base">Shift Definitions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex justify-center py-10"><Spinner size={6} /></div>
//           ) : shifts.length === 0 ? (
//             <div className="text-center py-10 text-muted-foreground">No shifts defined</div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b border-border/60">
//                       <table>
//                         <th className="py-3 text-left font-medium">Name</th>
//                         <th className="py-3 text-left font-medium">Start</th>
//                         <th className="py-3 text-left font-medium">End</th>
//                         <th className="py-3 text-left font-medium">Duration</th>
//                         <th className="py-3 text-left font-medium">Status</th>
//                         <th className="py-3 text-right font-medium">Actions</th>
//                       </table>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {shifts.map((shift) => (
//                       <tr key={shift.id} className="border-b border-border/40 last:border-0">
//                         <td className="py-3 font-medium">{shift.name}</td>
//                         <td className="py-3">{shift.start_time}</td>
//                         <td className="py-3">{shift.end_time}</td>
//                         <td className="py-3">{shift.duration_hours}h</td>
//                         <td className="py-3"><StatusBadge status={shift.is_active ? "active" : "inactive"} /></td>
//                         <td className="py-3 text-right">
//                           <div className="flex items-center justify-end gap-1">
//                             <Button variant="ghost" size="sm" onClick={() => openEditDialog(shift)}>
//                               <Pencil className="h-3.5 w-3.5" />
//                             </Button>
//                             <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget(shift)}>
//                               <Trash2 className="h-3.5 w-3.5" />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               {totalPages > 1 && (
//                 <div className="flex items-center justify-end gap-2 mt-4">
//                   <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
//                     <ChevronLeft className="h-4 w-4" />
//                   </Button>
//                   <span className="text-sm">Page {page} of {totalPages}</span>
//                   <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Shift Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editingShift ? "Edit Shift" : "Create Shift"}</DialogTitle>
//             <DialogDescription>
//               {editingShift ? "Modify shift details below" : "Define a new work shift"}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <div>
//               <Label className="mb-2">Shift Name *</Label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="e.g., Morning Shift"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <Label className="mb-2">Start Time *</Label>
//                 <Input
//                   type="time"
//                   value={formData.start_time}
//                   onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <Label className="mb-2">End Time *</Label>
//                 <Input
//                   type="time"
//                   value={formData.end_time}
//                   onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
//                 />
//               </div>
//             </div>
//             <div>
//               <Label className="mb-2">Duration Hours (auto-calculated)</Label>
//               <Input
//                 type="number"
//                 step="0.01"
//                 value={formData.duration_hours}
//                 readOnly
//                 className="bg-muted"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
//             <Button onClick={handleSubmit} disabled={submitting}>
//               {submitting && <Spinner size={4} />}
//               {editingShift ? "Update" : "Create"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete Shift</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
//               <br /><br />
//               • If the shift has <strong>active assignments</strong>, it will be deactivated first automatically.
//               <br />
//               • If it has <strong>attendance history</strong>, it will be archived (deactivated) instead of deleted.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
//             <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
//               {submitting && <Spinner size={4} />}
//               Delete / Deactivate
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../admin-shift";

function toHHmm(value) {
  if (!value) return "";
  const directMatch = String(value).match(/(\d{2}):(\d{2})/);
  if (directMatch) return `${directMatch[1]}:${directMatch[2]}`;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
  }
  return "";
}

export default function ShiftsManagementTab() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const LIMIT = 10

  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    duration_hours: "",
    description: "",
  })

  // Auto-calculate duration when times change
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const [startH, startM] = formData.start_time.split(":").map(Number)
      const [endH, endM] = formData.end_time.split(":").map(Number)
      let startTotal = startH * 60 + startM
      let endTotal = endH * 60 + endM
      if (endTotal <= startTotal) endTotal += 24 * 60
      const durationHours = Math.round(((endTotal - startTotal) / 60) * 100) / 100
      setFormData(prev => ({ ...prev, duration_hours: durationHours.toString() }))
    }
  }, [formData.start_time, formData.end_time])

  const loadShifts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await axiosInstance.get("/attendance/shifts", {
        params: { page, limit: LIMIT }
      })
      setShifts(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shifts")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadShifts() }, [loadShifts])

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time || !formData.duration_hours) {
      setError("Please fill all required fields")
      return
    }
    const startTime = toHHmm(formData.start_time)
    const endTime = toHHmm(formData.end_time)
    if (!startTime || !endTime) {
      setError("Time must be in HH:mm format (24-hour)")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      if (editingShift) {
        await axiosInstance.put(`/attendance/shifts/${editingShift.id}`, {
          name: formData.name,
          start_time: startTime,
          end_time: endTime,
          duration_hours: parseFloat(formData.duration_hours),
        })
        setSuccess("Shift updated successfully")
      } else {
        await axiosInstance.post("/attendance/shifts", {
          name: formData.name,
          start_time: startTime,
          end_time: endTime,
          duration_hours: parseFloat(formData.duration_hours),
        })
        setSuccess("Shift created successfully")
      }
      setDialogOpen(false)
      resetForm()
      loadShifts()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shift")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    setError("")
    try {
      try {
        await axiosInstance.patch(`/attendance/shifts/${deleteTarget.id}/status`, { is_active: false })
      } catch (deactivateErr) {
        // ignore, still try to delete
      }
      const res = await axiosInstance.delete(`/attendance/shifts/${deleteTarget.id}`)
      const result = res.data?.data
      if (result?.action === "archived") {
        setSuccess(result.message || "Shift deactivated (has attendance history, cannot be deleted)")
      } else {
        setSuccess("Shift deleted successfully")
      }
      setDeleteTarget(null)
      loadShifts()
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete shift")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", start_time: "", end_time: "", duration_hours: "", description: "" })
    setEditingShift(null)
  }

  const openEditDialog = (shift) => {
    setEditingShift(shift)
    setFormData({
      name: shift.name,
      start_time: toHHmm(shift.start_time),
      end_time: toHHmm(shift.end_time),
      duration_hours: shift.duration_hours.toString(),
      description: shift.description || "",
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="flex flex-col gap-4">
      <ErrorBanner message={error} onDismiss={() => setError("")} />
      <SuccessBanner message={success} onDismiss={() => setSuccess("")} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shift
        </Button>
      </div>

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
                {/* ✅ Fixed: removed the erroneous nested <table> inside <thead> */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-3 text-left font-medium">Name</th>
                      <th className="py-3 text-left font-medium">Start</th>
                      <th className="py-3 text-left font-medium">End</th>
                      <th className="py-3 text-left font-medium">Duration</th>
                      <th className="py-3 text-left font-medium">Status</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((shift) => (
                      <tr key={shift.id} className="border-b border-border/40 last:border-0">
                        <td className="py-3 font-medium">{shift.name}</td>
                        <td className="py-3">{shift.start_time}</td>
                        <td className="py-3">{shift.end_time}</td>
                        <td className="py-3">{shift.duration_hours}h</td>
                        <td className="py-3"><StatusBadge status={shift.is_active ? "active" : "inactive"} /></td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(shift)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteTarget(shift)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      {/* Shift Dialog */}
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
              <br /><br />
              • If the shift has <strong>active assignments</strong>, it will be deactivated first automatically.
              <br />
              • If it has <strong>attendance history</strong>, it will be archived (deactivated) instead of deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Spinner size={4} />}
              Delete / Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}