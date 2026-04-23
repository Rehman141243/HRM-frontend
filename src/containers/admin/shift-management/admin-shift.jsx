"use client"

import {
  Calendar,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertCircle,

} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/lib/axiosInstance"
import { getUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import EmployeeAssignmentsTab from "./components/employeeassignmenttab"
import ShiftsManagementTab from "./components/shiftmangementtab"
import ShiftRequestsTab from "./components/shiftrequesttab"
import React, { useEffect, useState } from "react"
import AdminLeaveManagement from "./admin-leave/adminleave"


export function Spinner({ size = 4 }) {
  return <Loader2 className={`h-${size} w-${size} animate-spin text-muted-foreground`} />
}


export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
      <button onClick={onDismiss} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
        ×
      </button>
    </div>
  )
}

// ─── Success Banner ──────────────────────────────────────────────────────────
export function SuccessBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {message}
      </div>
      <button onClick={onDismiss} className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-600">
        ×
      </button>
    </div>
  )
}

// ─── Status Badge ────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const variants = {
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${variants[status] || variants.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || status}
    </span>
  )
}

export default function AdminShiftManagement() {
  const [user, setUser] = useState(null)

  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    setUser(u)

    const role = (u?.role ?? "").toLowerCase()
    const designation = (u?.designation ?? "").toLowerCase()

    // ADMIN: full access
    if (role === "admin") return

    // USER: only hr + manager can access shift management
    if (role === "user") {
      if (designation === "hr" || designation === "manager") return

      // employee or others → block
      router.push("/dashboard")
    }
  }, [router])



  const role = user?.role?.toLowerCase()
  const designation = user?.designation?.toLowerCase()

  if (!user) return null

  if (role === "admin") {
    // allow
  } else if (role === "user") {
    if (designation !== "hr" && designation !== "manager") {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Access restricted.
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex items-center gap-3 mt-5">
        <div className="rounded-lg border bg-background p-2 shadow-xs">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shift Management</h1>
          <p className="text-sm text-muted-foreground">
            Define work shifts, assign to employees, and approve shift change requests.
          </p>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        
        </TabsList>
        <TabsContent value="assignments" className="mt-4">
          <EmployeeAssignmentsTab />
        </TabsContent>
        <TabsContent value="shifts" className="mt-4">
          <ShiftsManagementTab />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <ShiftRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}