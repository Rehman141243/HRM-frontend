// "use client";

// import axiosInstance from "@/lib/axiosInstance";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Textarea } from "@/components/ui/textarea";
// import { DataTable } from "@/components/common/data-table";
// import TableToolbar from "@/components/common/table-toolbar";

// import {
//   Alert,
//   AlertDescription,

// } from "@/components/ui/alert";


// import {
  
//   CheckCircle2,

//   RefreshCw,

//   Hourglass,
 
//   AlertCircle,

// } from "lucide-react";

// import { todayDateStr } from "@/components/common/common";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { getOvertimeColumns } from "./overtime-columns";



// export default function OvertimeTab() {
//   const [requests, setRequests] = useState([]);
//   const [pagination, setPagination] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
//   const [requestToCancel, setRequestToCancel] = useState(null);
//   const [cancelReason, setCancelReason] = useState("Plans changed");
//   const [cancellingId, setCancellingId] = useState(null);
//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(8);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const [form, setForm] = useState({
//     date: todayDateStr(),
//     start_time: "",
//     end_time: "",
//     hours: "",
//     reason: "",
//   });

//   // GET /attendance/overtime-requests/me → { success, data: [], pagination }
//   const fetchRequests = useCallback(async (p = 0, size = pageSize) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axiosInstance.get("/attendance/overtime-requests/me", {
//         params: {
//           page: p + 1,
//           limit: size,
//           ...(statusFilter !== "all" ? { status: statusFilter } : {}),
//         },
//       });
//       setRequests(res.data?.data ?? []);
//       setPagination(res.data?.pagination ?? {});
//     } catch (e) {
//       setError("Unable to load overtime requests. Please try again later.");
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [pageSize, statusFilter]);

//   useEffect(() => {
//     setPage(0);
//     fetchRequests(0, pageSize);
//   }, [fetchRequests, pageSize, statusFilter]);

//   // Auto-calculate hours from start/end time
//   useEffect(() => {
//     if (form.start_time && form.end_time) {
//       const [sh, sm] = form.start_time.split(":").map(Number);
//       const [eh, em] = form.end_time.split(":").map(Number);
//       const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
//       if (diff > 0) setForm((f) => ({ ...f, hours: diff.toFixed(2) }));
//     }
//   }, [form.start_time, form.end_time]);

//   // POST /attendance/overtime-requests → validator: createOvertimeRequestSchema
//   // Required: date (ISO), start_time (HH:MM), end_time (HH:MM), hours (positive number ≤ 24)
//   // Validation: end_time must be greater than start_time (hasInvalidTimeRange check)
//   const handleSubmit = async () => {
//     setSubmitting(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       await axiosInstance.post("/attendance/overtime-requests", {
//         date: form.date,
//         start_time: form.start_time,
//         end_time: form.end_time,
//         hours: parseFloat(form.hours),
//         ...(form.reason ? { reason: form.reason } : {}),
//       });
//       setSuccess("Overtime request submitted successfully!");
//       setForm({ date: todayDateStr(), start_time: "", end_time: "", hours: "", reason: "" });
//       setDialogOpen(false);
//       setPage(0);
//       await fetchRequests(0, pageSize);
//     } catch (e) {
//       setError(e.response?.data?.message || "Failed to submit overtime request.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCancelRequest = useCallback((request) => {
//     if (!request?.id) return;
//     setRequestToCancel(request);
//     setCancelReason("Plans changed");
//     setCancelDialogOpen(true);
//   }, []);

//   const handleConfirmCancel = async () => {
//     if (!requestToCancel?.id) return;

//     const reason = cancelReason.trim() || "Plans changed";

//     setCancellingId(requestToCancel.id);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await axiosInstance.put(`/attendance/overtime-requests/${requestToCancel.id}/cancel`, {
//         cancel_reason: reason,
//       });
//       setSuccess(res.data?.message || "Overtime request cancelled successfully!");
//       setCancelDialogOpen(false);
//       setRequestToCancel(null);
//       await fetchRequests(page, pageSize);
//     } catch (e) {
//       setError(e.response?.data?.message || "Failed to cancel overtime request.");
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   const total = pagination.total ?? 0;

//   const filteredRequests = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return requests;
  
//     return requests.filter((request) => {
//       const values = [
//         request.date,
//         request.start_time,
//         request.end_time,
//         request.hours,
//         request.reason || "",
//         request.status || "",
//       ];
//       return values.some((value) => String(value).toLowerCase().includes(term));
//     });
//   }, [requests, search]);

//   const columns = useMemo(
//     () => getOvertimeColumns({ onCancel: handleCancelRequest, cancellingId }),
//     [handleCancelRequest, cancellingId]
//   );

//   return (
//     <div className="space-y-4 mt-4">
//       {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
//       {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

//       <Dialog
//         open={cancelDialogOpen}
//         onOpenChange={(open) => {
//           setCancelDialogOpen(open);
//           if (!open) {
//             setRequestToCancel(null);
//             setCancelReason("Plans changed");
//           }
//         }}
//       >
//         <DialogContent className="sm:max-w-110">
//           <DialogHeader>
//             <DialogTitle>Cancel Overtime Request</DialogTitle>
//             <DialogDescription>
//               This will cancel your overtime request and send the cancellation reason.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-2 py-1">
//             <Label htmlFor="cancel-overtime-reason">Cancel reason</Label>
//             <Textarea
//               id="cancel-overtime-reason"
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Enter cancellation reason"
//               rows={3}
//               className="resize-none"
//             />
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
//               Keep Request
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleConfirmCancel}
//               disabled={!cancelReason.trim() || cancellingId === requestToCancel?.id}
//             >
//               {cancellingId === requestToCancel?.id && <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />}
//               Confirm Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="font-semibold">Overtime Requests</h3>
//           <p className="text-sm text-muted-foreground">Track and submit overtime claims</p>
//         </div>
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button size="sm" className="gap-1.5"><Hourglass className="h-4 w-4" />Request Overtime</Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-110">
//             <DialogHeader>
//               <DialogTitle>Overtime Request</DialogTitle>
//               <DialogDescription>Submit an overtime claim for approval.</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-2">
//               <div className="space-y-1.5">
//                 <Label>Date</Label>
//                 <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Start Time</Label>
//                   <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>End Time</Label>
//                   <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Hours (auto-calculated)</Label>
//                 <Input
//                   type="number"
//                   step="0.25"
//                   min="0.01"
//                   max="24"
//                   value={form.hours}
//                   onChange={(e) => setForm({ ...form, hours: e.target.value })}
//                   placeholder="e.g. 2.5"
//                 />
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Reason (optional)</Label>
//                 <Textarea
//                   value={form.reason}
//                   onChange={(e) => setForm({ ...form, reason: e.target.value })}
//                   placeholder="Describe the overtime work…"
//                   rows={3}
//                   className="resize-none"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
//               <Button
//                 onClick={handleSubmit}
//                 disabled={submitting || !form.date || !form.start_time || !form.end_time || !form.hours || parseFloat(form.hours) <= 0}
//               >
//                 {submitting && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}Submit
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardContent className="p-4">
//           <TableToolbar
//             placeholder="Search date, time, reason, status..."
//             searchValue={search}
//             onSearchChange={setSearch}
//             total={total}
//             className="mb-4"
//             rightSlot={
//               <div className="flex flex-wrap items-center gap-2">
//                 <Select
//                   value={statusFilter}
//                   onValueChange={setStatusFilter}
//                 >
//                   <SelectTrigger className="h-8 w-36">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
//                     <SelectItem value="all">All Statuses</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="approved">Approved</SelectItem>
//                     <SelectItem value="rejected">Rejected</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <span className="text-sm text-muted-foreground">
//                   <span className="font-medium text-foreground">{total}</span> requests
//                 </span>
//               </div>
//             }
//           />

//           {loading ? (
//             <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
//           ) : (
//             <DataTable
//               data={filteredRequests}
//               columns={columns}
//               page={page}
//               pageSize={pageSize}
//               total={total}
//               setPage={(nextPage) => {
//                 setPage(nextPage);
//                 fetchRequests(nextPage, pageSize);
//               }}
//               setPageSize={(nextSize) => {
//                 setPage(0);
//                 setPageSize(nextSize);
//                 fetchRequests(0, nextSize);
//               }}
//               pagination
//               columnsBtn={false}
//               isLoading={false}
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Badge } from "@/components/ui/badge";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  CheckCircle2,
  RefreshCw,
  Hourglass,
  AlertCircle,
} from "lucide-react";

import { todayDateStr, fmtDate } from "@/components/common/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOvertimeColumns } from "./overtime-columns";
import { MobileCardList } from "../../../components/responsiveness/late-regulation-card";

// ── Mobile card field configs ──────────────────────────────────────────────────

const overtimeStatusMeta = (status) => {
  const key = String(status || "pending").toLowerCase();
  const map = {
    pending:   { label: "Pending",   className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    approved:  { label: "Approved",  className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    rejected:  { label: "Rejected",  className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
    cancelled: { label: "Cancelled", className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" },
  };
  return map[key] || { label: key, className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" };
};

const overtimeCardFields = [
  {
    label: "Date",
    accessor: (row) => fmtDate(row.date) || "--",
    className: "text-muted-foreground",
  },
  {
    label: "Time",
    accessor: (row) => `${row.start_time || "--"} – ${row.end_time || "--"}`,
    className: "text-muted-foreground",
  },
  {
    label: "Hours",
    accessor: (row) => row.hours ? `${row.hours} hrs` : "--",
    className: "text-muted-foreground",
  },
  {
    label: "Submitted On",
    accessor: (row) => fmtDate(row.created_at || row.submitted_at) || "--",
    className: "text-muted-foreground",
  },
  {
    label: "Reason",
    accessor: (row) => row.reason || "--",
    className: "text-muted-foreground line-clamp-3",
    fullWidth: true,
  },
];

const overtimeCardHighlight = {
  accessor: (row) => {
    const meta = overtimeStatusMeta(row.status);
    return (
      <Badge variant="outline" className={`text-xs font-medium ${meta.className}`}>
        {meta.label}
      </Badge>
    );
  },
};

export default function OvertimeTab() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Plans changed");
  const [cancellingId, setCancellingId] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    date: todayDateStr(),
    start_time: "",
    end_time: "",
    hours: "",
    reason: "",
  });

  // GET /attendance/overtime-requests/me → { success, data: [], pagination }
  const fetchRequests = useCallback(async (p = 0, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/attendance/overtime-requests/me", {
        params: {
          page: p + 1,
          limit: size,
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        },
      });
      setRequests(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load overtime requests. Please try again later.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize, statusFilter]);

  useEffect(() => {
    setPage(0);
    fetchRequests(0, pageSize);
  }, [fetchRequests, pageSize, statusFilter]);

  // Auto-calculate hours from start/end time
  useEffect(() => {
    if (form.start_time && form.end_time) {
      const [sh, sm] = form.start_time.split(":").map(Number);
      const [eh, em] = form.end_time.split(":").map(Number);
      const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
      if (diff > 0) setForm((f) => ({ ...f, hours: diff.toFixed(2) }));
    }
  }, [form.start_time, form.end_time]);

  // POST /attendance/overtime-requests → validator: createOvertimeRequestSchema
  // Required: date (ISO), start_time (HH:MM), end_time (HH:MM), hours (positive number ≤ 24)
  // Validation: end_time must be greater than start_time (hasInvalidTimeRange check)
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.post("/attendance/overtime-requests", {
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        hours: parseFloat(form.hours),
        ...(form.reason ? { reason: form.reason } : {}),
      });
      setSuccess("Overtime request submitted successfully!");
      setForm({ date: todayDateStr(), start_time: "", end_time: "", hours: "", reason: "" });
      setDialogOpen(false);
      setPage(0);
      await fetchRequests(0, pageSize);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit overtime request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = useCallback((request) => {
    if (!request?.id) return;
    setRequestToCancel(request);
    setCancelReason("Plans changed");
    setCancelDialogOpen(true);
  }, []);

  const handleConfirmCancel = async () => {
    if (!requestToCancel?.id) return;

    const reason = cancelReason.trim() || "Plans changed";

    setCancellingId(requestToCancel.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await axiosInstance.put(`/attendance/overtime-requests/${requestToCancel.id}/cancel`, {
        cancel_reason: reason,
      });
      setSuccess(res.data?.message || "Overtime request cancelled successfully!");
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      await fetchRequests(page, pageSize);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to cancel overtime request.");
    } finally {
      setCancellingId(null);
    }
  };

  const total = pagination.total ?? 0;

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
  
    return requests.filter((request) => {
      const values = [
        request.date,
        request.start_time,
        request.end_time,
        request.hours,
        request.reason || "",
        request.status || "",
      ];
      return values.some((value) => String(value).toLowerCase().includes(term));
    });
  }, [requests, search]);

  const columns = useMemo(
    () => getOvertimeColumns({ onCancel: handleCancelRequest, cancellingId }),
    [handleCancelRequest, cancellingId]
  );

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setRequestToCancel(null);
            setCancelReason("Plans changed");
          }
        }}
      >
        <DialogContent className="sm:max-w-110">
          <DialogHeader>
            <DialogTitle>Cancel Overtime Request</DialogTitle>
            <DialogDescription>
              This will cancel your overtime request and send the cancellation reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <Label htmlFor="cancel-overtime-reason">Cancel reason</Label>
            <Textarea
              id="cancel-overtime-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason"
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim() || cancellingId === requestToCancel?.id}
            >
              {cancellingId === requestToCancel?.id && <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Overtime Requests</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Track and submit overtime claims</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs sm:text-sm"><Hourglass className="h-4 w-4" />Request Overtime</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-110">
            <DialogHeader>
              <DialogTitle>Overtime Request</DialogTitle>
              <DialogDescription>Submit an overtime claim for approval.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value })} 
                  className='text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm'
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={form.start_time} 
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })} 
                    className='text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm'
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={form.end_time} 
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })} 
                    className='text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm'
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Hours (auto-calculated)</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.01"
                  max="24"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="e.g. 2.5"
                  className='text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm'
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Describe the overtime work…"
                  rows={3}
                  className="text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm resize-none"
                />
              </div>
            </div>
            <DialogFooter className='flex flex-row justify-center sm:justify-normal'>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.date || !form.start_time || !form.end_time || !form.hours || parseFloat(form.hours) <= 0}
              >
                {submitting && <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />}Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <TableToolbar
            placeholder="Search date, time, reason, status..."
            searchValue={search}
            onSearchChange={setSearch}
            total={total}
            className="mb-4"
            rightSlot={
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-36 text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40">
                    <SelectItem value="all" className="text-xs sm:text-sm">All Statuses</SelectItem>
                    <SelectItem value="pending" className="text-xs sm:text-sm">Pending</SelectItem>
                    <SelectItem value="approved" className="text-xs sm:text-sm">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-xs sm:text-sm">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground text-xs sm:text-sm">{total}</span> requests
                </span>
              </div>
            }
          />

          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <>
              {/* Desktop: table */}
              <div className="hidden md:block">
                <DataTable
                  data={filteredRequests}
                  columns={columns}
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  setPage={(nextPage) => {
                    setPage(nextPage);
                    fetchRequests(nextPage, pageSize);
                  }}
                  setPageSize={(nextSize) => {
                    setPage(0);
                    setPageSize(nextSize);
                    fetchRequests(0, nextSize);
                  }}
                  pagination
                  columnsBtn={false}
                  isLoading={false}
                />
              </div>

              {/* Mobile: cards */}
              <div className="block md:hidden">
                <MobileCardList
                  data={filteredRequests}
                  fields={overtimeCardFields}
                  highlight={overtimeCardHighlight}
                  actions={(row) => {
                    const isPending = String(row.status || "").toLowerCase() === "pending";
                    if (!isPending) return null;
                    return (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={cancellingId === row.id}
                        onClick={() => handleCancelRequest(row)}
                      >
                        {cancellingId === row.id && (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Cancel Request
                      </Button>
                    );
                  }}
                  keyExtractor={(row) => row.id}
                  isLoading={false}
                  emptyText="No overtime requests found."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
