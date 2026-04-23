import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ErrorBanner, Spinner, StatusBadge, SuccessBanner } from "../admin-shift";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance"
export default function ShiftRequestsTab() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [statusFilter, setStatusFilter] = useState("pending")
    const [submitting, setSubmitting] = useState(false)
    const LIMIT = 10
  
    const loadRequests = useCallback(async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get("/attendance/shift-requests", {
          params: { page, limit: LIMIT, status: statusFilter }
        })
        setRequests(data.data || [])
        setTotal(data.pagination?.total || 0)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load requests")
      } finally {
        setLoading(false)
      }
    }, [page, statusFilter])
  
    useEffect(() => { loadRequests() }, [loadRequests])
    useEffect(() => { setPage(1) }, [statusFilter])
  
    const handleApprove = async (id) => {
      setSubmitting(true)
      try {
        await axiosInstance.put(`/attendance/shift-requests/${id}/approve`)
        setSuccess("Request approved")
        loadRequests()
        setTimeout(() => setSuccess(""), 3000)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to approve")
      } finally {
        setSubmitting(false)
      }
    }
  
    const handleReject = async (id) => {
      setSubmitting(true)
      try {
        await axiosInstance.put(`/attendance/shift-requests/${id}/reject`)
        setSuccess("Request rejected")
        loadRequests()
        setTimeout(() => setSuccess(""), 3000)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to reject")
      } finally {
        setSubmitting(false)
      }
    }
  
    const totalPages = Math.ceil(total / LIMIT)
  
    return (
      <div className="flex flex-col gap-4">
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        <SuccessBanner message={success} onDismiss={() => setSuccess("")} />
  
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
  
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shift Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Spinner size={6} /></div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No {statusFilter} requests</div>
            ) : (
              <>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-border/60 p-4">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex-1">
                          <div className="font-medium">
                            {req.employee?.first_name} {req.employee?.last_name}
                            <span className="text-xs text-muted-foreground ml-2">({req.employee?.employee_id})</span>
                          </div>
                          <div className="text-sm mt-1">
                            From: <span className="font-mono">{req.current_shift?.name || "—"}</span> →&nbsp;
                            To: <span className="font-mono text-emerald-600">{req.requested_shift?.name || "—"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Requested on: {new Date(req.request_date).toLocaleDateString()}
                          </div>
                          {req.reason && (
                            <div className="text-sm mt-2 p-2 rounded-md bg-muted/40">
                              <span className="text-muted-foreground">Reason:</span> {req.reason}
                            </div>
                          )}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600"
                              onClick={() => handleApprove(req.id)}
                              disabled={submitting}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleReject(req.id)}
                              disabled={submitting}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {req.status !== "pending" && <StatusBadge status={req.status} />}
                      </div>
                    </div>
                  ))}
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
      </div>
    )
  }