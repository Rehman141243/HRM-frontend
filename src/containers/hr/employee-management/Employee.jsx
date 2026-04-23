
"use client"


import { Users, UserPlus, Trash2, RefreshCw, Pencil, EyeIcon, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import TableToolbar from "@/components/common/table-toolbar"
import { DataTable } from "@/components/common/data-table"
import { getUser } from "@/lib/auth"
import { AddEmployeeForm, RoleBadge, StatusBadge } from "./CreateEmployee"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axiosInstance"
import DeleteEmployeeDialog from "./DeleteEmployeeDialog";
import { useCallback, useEffect, useMemo, useState } from "react";

function buildColumns(onDelete, canDelete, onEdit, onView) {
  return [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const d = row.original
        const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || "—"
        return (
          <button
            onClick={() => onView?.(row.original.id)}
            className="text-left hover:underline"
          >
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground"></div>
          </button>
        )
      },
    },
    {
      id: "employee_id",
      header: "Employee ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.employee_id ?? "—"}</span>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: ({ row }) => row.original.department ?? "—",
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.designation} />,
    },
    {
      id: "employment_type",
      header: "Employment Type",
      cell: ({ row }) => {
        const t = row.original.employment_type ?? ""
        return (
          <span className="capitalize text-sm">{t.replace(/_/g, " ") || "—"}</span>
        )
      },
    },
    {
      id: "is_active",
      header: "Status",
      cell: ({ row }) => <StatusBadge value={row.original.is_active} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex  items-center gap-1">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(row.original.id)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onView && (
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onView(row.original.id)}
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function EmployeeContainer() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
  }, [])

  // ✅ Derive these INSIDE useMemo/render so they react to user changes
  const role = (user?.role ?? "").toLowerCase().trim()
  const designation = (user?.designation ?? "").toLowerCase().trim()
  const isAdmin = role === "admin"
  const isHr = role === "hr" || designation === "hr"
  const isAdminOrHr = isAdmin || isHr
  const canEditDeleteEmployee = isAdminOrHr

  
  // const isAdmin = role === "admin"
  
  // ✅ FIX HR detection (important)
  // const isHr =
  //   role === "hr" || designation === "hr"
  
  // const isAdminOrHr = isAdmin || isHr
  

  
  const [employees, setEmployees] =useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // ── Delete modal state ──
  const [deleteTarget, setDeleteTarget] = useState(null) // full employee object
  const [isDeleting, setIsDeleting] = useState(false)

  // const handleEdit = (id) => router.push(`/hr/employee-management/update-employee/${id}`)
  // const handleView = (id) => router.push(`/hr/employee-management/${id}`)
  const handleEdit = useCallback((id) => router.push(`/hr/employee-management/update-employee/${id}`), [router])
  const handleView = useCallback((id) => router.push(`/hr/employee-management/${id}`), [router])
  const openDeleteModal = useCallback((employee) => setDeleteTarget(employee), [])

  // Called from the column — receives the full row object so we can show the name
  // const openDeleteModal = (employee) => setDeleteTarget(employee)
  const closeDeleteModal = () => { if (!isDeleting) setDeleteTarget(null) }

  async function fetchEmployees(query = {}) {
    const { data } = await axiosInstance.get("/employee", { params: query })
    return data
  }

  async function deleteEmployee(id) {
    const { data } = await axiosInstance.delete(`/employee/${id}`)
    return data
  }

  // const load = useCallback(async () => {
  //   setLoading(true)
  //   setError("")
  //   try {
  //     const res = await fetchEmployees({
  //       search: query || undefined,
  //       page: page + 1,
  //       limit: pageSize,

  //     })
  //     setEmployees(res.employees ?? [])
  //     setTotal(res.pagination?.total ?? 0)
  //   } catch (err) {
  //     setError(err.response?.data?.message ?? err.message ?? "Failed to load employees.")
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [query, page, pageSize])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")

 
    
  
    try {
      const res = await fetchEmployees({
        search: query || undefined,
        page: page + 1,
        limit: pageSize,
        role: undefined,
        department: undefined,
        employmentType: undefined,
        gender: undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      })
      console.log("First employee:", res.employees?.[0]) 
      setEmployees(res.employees ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Failed to load employees.")
    } finally {
      setLoading(false)
    }
  }, [query, page, pageSize])
  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [query])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteEmployee(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // const columns = useMemo(
  //   () => buildColumns(openDeleteModal, isAdmin, isAdminOrHr ? handleEdit : null, handleView),
  //   [isAdmin, isAdminOrHr]
  // )
// ✅ Correct
const columns = useMemo(
  () =>
    buildColumns(
      openDeleteModal,
      canEditDeleteEmployee,
      canEditDeleteEmployee ? handleEdit : null,
      handleView
    ),
  [canEditDeleteEmployee, openDeleteModal, handleEdit, handleView]  // ← inside useMemo as second arg
)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Manage employee profiles, directories, and role-based access.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {isAdminOrHr && (
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={() => router.push('/hr/employee-management/create-employee')}
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Employee Directory</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TableToolbar
            placeholder="Search by name, ID, department, phone…"
            total={total}
            onSearchChange={setQuery}
            className="mb-4"
            rightSlot={
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{total}</span>{" "}
                employees
              </div>
            }
          />
          <DataTable
            data={employees}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            pagination
            columnsBtn
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* ── Delete Confirmation Modal ───────────────────────── */}
      <DeleteEmployeeDialog
        employee={deleteTarget}
        open={!!deleteTarget}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}