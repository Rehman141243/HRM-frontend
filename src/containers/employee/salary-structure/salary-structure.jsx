"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fmtPKR, getPermissions, normalizeSalaryStructure } from "@/components/modal-components/modalcomponents";
import { salaryStructureColumns } from "./salary-structure-columns";
import SalaryStructureModal from "@/components/modals/SalaryStructureModal";

export default function SalaryStructurePage() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  const perms = useMemo(() => getPermissions(user), [user]);

  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStructure, setSelectedStructure] = useState(null);

  const loadStructures = useCallback(
    async () => {
      setLoading(true);
      try {
        const empId = perms.selfEmployeeId;
        if (!empId) {
          toast.error("Cannot determine your employee ID.");
          setStructures([]);
          setPagination({ total: 0, pages: 1 });
          return;
        }
        const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
        const payload = res.data?.data ?? res.data ?? {};
        const structure = payload.salary_structure || payload;
        const records = structure?.id ? [structure] : [];
        setStructures(records);
        setPagination({ total: records.length, pages: 1 });
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(extractErrorMessage(error, "Failed to fetch salary structures"));
        }
        setStructures([]);
        setPagination({ total: 0, pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [perms.selfEmployeeId]
  );

  useEffect(() => {
    if (!user) return;
    loadStructures();
  }, [user, loadStructures]);

  const normalizedStructures = useMemo(
    () => (Array.isArray(structures) ? structures.map((item) => normalizeSalaryStructure(item)) : []),
    [structures]
  );

  const filteredStructures = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedStructures;

    return normalizedStructures.filter((structure) => {
      const employeeName = `${structure?.employee?.first_name || ""} ${structure?.employee?.last_name || ""}`.trim();
      const values = [
        employeeName,
        structure?.name || "",
        structure?.employee?.designation || "",
        structure?.currency || "",
        structure?.is_active ? "active" : "inactive",
      ];
      return values.some((value) => String(value).toLowerCase().includes(term));
    });
  }, [normalizedStructures, searchTerm]);

  const totalStructures = useMemo(() => {
    const raw =
      pagination?.total ??
      pagination?.totalItems ??
      pagination?.total_items ??
      pagination?.count ??
      pagination?.itemCount ??
      pagination?.recordsTotal;

    const parsed = Number(raw);
    const computed = Number.isFinite(parsed) ? parsed : 0;
    return Math.max(computed, normalizedStructures.length);
  }, [pagination, normalizedStructures.length]);

  const tableTotal = searchTerm.trim() ? filteredStructures.length : totalStructures;

  // Use columns from separate file
  const columns = useMemo(
    () =>
      salaryStructureColumns({
        onView: setSelectedStructure,
      }),
    []
  );
  const handleRefresh = () => {
    loadStructures();
  };

  return (
    <div className="flex flex-col gap-6 mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Salary Structure</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Review and manage salary structures without switching tabs.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
          {perms.canCreateStructure && (
            <Button className="gap-2" onClick={() => setShowCreateStructure(true)}>
              <Plus className="h-4 w-4" />New Structure
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-4">
          <TableToolbar
            placeholder="Search employee, structure, designation..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            className="mb-4"
            rightSlot={
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{tableTotal}</span> structure(s)
              </span>
            }
          />

          <DataTable
            data={filteredStructures}
            columns={columns}
            page={pageIndex}
            pageSize={pageSize}
            total={tableTotal}
            setPage={(nextPage) => {
              setPageIndex(nextPage);
              if (!searchTerm.trim()) {
                loadStructures(nextPage + 1, pageSize);
              }
            }}
            setPageSize={(nextSize) => {
              setPageIndex(0);
              setPageSize(nextSize);
              if (!searchTerm.trim()) {
                loadStructures(1, nextSize);
              }
            }}
            isLoading={loading}
            columnsBtn={false}
            loadingText="Loading salary structures..."
          />
        </CardContent>
      </Card>

      <SalaryStructureModal
        structure={selectedStructure}
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        perms={perms}
      />

    </div>
  );
}

function extractErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}
