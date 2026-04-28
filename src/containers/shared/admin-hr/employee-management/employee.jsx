
"use client";

import { Users, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TableToolbar from "@/components/common/table-toolbar";
import { DataTable } from "@/components/common/data-table";
import { getUser } from "@/lib/auth";
import { buildColumns } from "./employee-columns";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import DeleteEmployeeDialog from "./delete-employee-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function EmployeeContainer() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const role = (user?.role ?? "").toLowerCase().trim();
  const designation = (user?.designation ?? "").toLowerCase().trim();
  const isAdmin = role === "admin";
  const isHr = role === "hr" || designation === "hr";
  const isAdminOrHr = isAdmin || isHr;
  const canEditDeleteEmployee = isAdminOrHr;

  const basePath = isAdmin ? "/admin/employee-management" : "/hr/employee-management";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleEdit = useCallback(
    (id) => router.push(`${basePath}/update-employee/${id}`),
    [router, basePath]
  );

  const handleView = useCallback(
    (id) => router.push(`${basePath}/${id}`),
    [router, basePath]
  );

  const openDeleteModal = useCallback(
    (employee) => setDeleteTarget(employee),
    []
  );

  const closeDeleteModal = () => {
    if (!isDeleting) setDeleteTarget(null);
  };

  async function fetchEmployees(query = {}) {
    const { data } = await axiosInstance.get("/employee", { params: query })
    return data
  }

  async function deleteEmployee(id) {
    const { data } = await axiosInstance.delete(`/employee/${id}`)
    return data
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

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
      });
      setEmployees(res.employees ?? []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      setError(
        err.response?.data?.message ?? err.message ?? "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, [query, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      buildColumns(
        openDeleteModal,
        canEditDeleteEmployee,
        canEditDeleteEmployee ? handleEdit : null,
        handleView
      ),
    [canEditDeleteEmployee, openDeleteModal, handleEdit, handleView]
  );

  return (
    <div className="flex flex-col gap-6">
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
              onClick={() => router.push(`${basePath}/create-employee`)}
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Employee Directory</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TableToolbar
            placeholder="Search by name, ID, department, phone…"
            searchValue={query}
            onSearchChange={setQuery}
            total={total}
            className="mb-4"
            rightSlot={
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{total}</span> employees
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

      <DeleteEmployeeDialog
        employee={deleteTarget}
        open={!!deleteTarget}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}