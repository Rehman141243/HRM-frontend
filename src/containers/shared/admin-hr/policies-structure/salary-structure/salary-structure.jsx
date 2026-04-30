'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, RefreshCw, Plus, CreditCard } from "lucide-react";
import { getUser } from "@/lib/auth";
import {
  EmptyState,
  getPermissions,
} from "@/components/modal-components/modalcomponents";
import SalaryStructureModal from "@/components/modals/SalaryStructureModal";
import { usePolicies } from "@/components/modals/createstucturemodal";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { buildSalaryStructureColumns } from "./salary-structure-columns";

// ============= CONSTANTS =============
export const STRUCTURE_API_PATH = "/salary-structures";

// ============= SALARY STRUCTURE LIST =============
export function SalaryStructureList({ showHeader = true, onEdit, onCreateNew, basePath = "/hr" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  const [structures, setStructures] = useState([]);
  const [structLoading, setStructLoading] = useState(false);
  const [structPage, setStructPage] = useState(1);
  const [structPageSize, setStructPageSize] = useState(10);
  const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });
  const [selectedStructure, setSelectedStructure] = useState(null);

  const { policies, fetchAllPolicies } = usePolicies();
  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  const loadStructures = useCallback(async (p, pageSize = structPageSize) => {
    setStructLoading(true);
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get(STRUCTURE_API_PATH, { params: { page: p, limit: pageSize } });
        setStructures(res.data.salary_structures ?? []);
        setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
      } else {
        const empId = perms.selfEmployeeId;
        if (!empId) {
          toast.error("Cannot determine your employee ID.");
          setStructures([]);
          return;
        }
        const res = await axiosInstance.get(`${STRUCTURE_API_PATH}/employee/${empId}`);
        const s = res.data?.salary_structure || res.data;
        setStructures(s?.id ? [s] : []);
        setStructPagination({ total: s?.id ? 1 : 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) toast.error("Failed to fetch salary structures");
      setStructures([]);
    } finally {
      setStructLoading(false);
    }
  }, [perms.canViewAllStructures, perms.selfEmployeeId, structPageSize]);

  useEffect(() => { if (user) loadStructures(structPage); }, [user, loadStructures, structPage]);

  const handleEdit = (structure) => {
    if (onEdit) onEdit(structure);
    else router.push(`${basePath}/policies-structure/salary-structure/${structure.id}`);
  };

  const handleCreateNew = () => {
    if (onCreateNew) onCreateNew();
    else router.push(`${basePath}/policies-structure/salary-structure/create`);
  };

  const columns = useMemo(() => buildSalaryStructureColumns({
    onView: setSelectedStructure,
    onEdit: handleEdit,
    canEdit: perms.canEditStructure,
  }), [perms.canEditStructure]);

  return (
    <div className="flex flex-col gap-6">
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border bg-background p-2 shadow-xs">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {perms.canViewAllStructures ? "Salary Structures" : "My Salary Structure"}
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {perms.canViewAllStructures
                ? "Manage employee salary structures, allowances, and deductions."
                : "View your assigned salary structure, allowances, and deductions."}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold">
            {perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}
          </h2>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 w-full sm:w-auto shrink-0"
            onClick={() => loadStructures(structPage)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        <div className="p-4 border-gray-200 dark:border-gray-800">
          <TableToolbar
            placeholder="Search salary structures…"
            total={structures.length}
            rightSlot={perms.canCreateStructure ? (
              <Button size="sm" className="h-8 gap-1.5 shrink-0" onClick={handleCreateNew}>
                <Plus className="w-3.5 h-3.5" /> New Structure
              </Button>
            ) : null}
          />
        </div>

        <div className="p-4">
          {structLoading ? (
            <div className="py-16">
              <EmptyState icon={RefreshCw} message="Loading structures…" />
            </div>
          ) : structures.length === 0 ? (
            <div className="py-16">
              <EmptyState icon={Building2} message="No salary structures found." />
            </div>
          ) : (
            <DataTable
              data={structures}
              columns={columns}
              page={structPage - 1}
              pageSize={structPageSize}
              total={structPagination.total}
              setPage={(nextPage) => {
                const pageNumber = nextPage + 1;
                setStructPage(pageNumber);
                loadStructures(pageNumber, structPageSize);
              }}
              setPageSize={(nextPageSize) => {
                setStructPageSize(nextPageSize);
                setStructPage(1);
                loadStructures(1, nextPageSize);
              }}
              pagination={true}
              columnsBtn={false}
              isLoading={false}
            />
          )}
        </div>
      </div>

      <SalaryStructureModal
        structure={selectedStructure}
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        perms={perms}
        policies={policies}
      />
    </div>
  );
}

export default SalaryStructureList;
