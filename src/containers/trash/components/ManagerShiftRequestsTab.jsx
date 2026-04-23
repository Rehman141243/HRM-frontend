"use client";

import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,

} from "@/components/ui/card";


import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import {
  Alert,
  AlertDescription,

} from "@/components/ui/alert";


import {

  CheckCircle2,
  XCircle,
  RefreshCw,

  AlertCircle,

  ThumbsUp,
  ThumbsDown,
  Building2,
} from "lucide-react";

import { StatusBadge, fmtDate } from "../common/page";
import { useCallback, useEffect, useState } from "react";






export default function ManagerShiftRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // GET /attendance/shift-requests?status=pending
  const fetchRequests = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/attendance/shift-requests", {
        params: { page: p, limit: 10, status: "pending" },
      });
      setRequests(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? {});
    } catch (e) {
      setError("Unable to load shift requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  // PUT /attendance/shift-requests/:id/approve or /reject
  const handleAction = async (id, action) => {
    setActionId(id);
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.put(`/attendance/shift-requests/${id}/${action}`);
      setSuccess(`Shift request ${action}d successfully.`);
      await fetchRequests(page);
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Shift Change Requests</h3>
          <p className="text-sm text-muted-foreground">Review and act on shift change requests</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => fetchRequests(page)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-sm">No pending shift change requests.</TableCell></TableRow>
                ) : (
                  requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-medium">
                        {r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.request_date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.current_shift?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{r.requested_shift?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{r.reason || "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        {r.status === "pending" ? (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10" disabled={actionId === r.id} onClick={() => handleAction(r.id, "approve")}>
                              {actionId === r.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-500/40 text-red-600 hover:bg-red-500/10" disabled={actionId === r.id} onClick={() => handleAction(r.id, "reject")}>
                              <ThumbsDown className="h-3 w-3" />Reject
                            </Button>
                          </div>
                        ) : <StatusBadge status={r.status} />}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
