// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import axiosInstance from "@/lib/axiosInstance";
// import { getUser } from "@/lib/auth";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { DataTable } from "@/components/common/data-table";
// import TableToolbar from "@/components/common/table-toolbar";
// import { Badge } from "@/components/ui/badge";
// import { Plus, RefreshCw } from "lucide-react";
// import { toast } from "sonner";
// import { fmtPKR, getPermissions, normalizeSalaryStructure } from "@/components/modal-components/modalcomponents";
// import { salaryStructureColumns } from "./salary-structure-columns";
// import SalaryStructureModal from "@/components/modals/SalaryStructureModal";

// export default function SalaryStructurePage() {
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     setUser(getUser());
//   }, []);

//   const perms = useMemo(() => getPermissions(user), [user]);

//   const [structures, setStructures] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [pagination, setPagination] = useState({ total: 0, pages: 1 });
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStructure, setSelectedStructure] = useState(null);

//   const loadStructures = useCallback(
//     async () => {
//       setLoading(true);
//       try {
//         const empId = perms.selfEmployeeId;
//         if (!empId) {
//           toast.error("Cannot determine your employee ID.");
//           setStructures([]);
//           setPagination({ total: 0, pages: 1 });
//           return;
//         }
//         const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
//         const payload = res.data?.data ?? res.data ?? {};
//         const structure = payload.salary_structure || payload;
//         const records = structure?.id ? [structure] : [];
//         setStructures(records);
//         setPagination({ total: records.length, pages: 1 });
//       } catch (error) {
//         if (error.response?.status !== 404) {
//           toast.error(extractErrorMessage(error, "Failed to fetch salary structures"));
//         }
//         setStructures([]);
//         setPagination({ total: 0, pages: 1 });
//       } finally {
//         setLoading(false);
//       }
//     },
//     [perms.selfEmployeeId]
//   );

//   useEffect(() => {
//     if (!user) return;
//     loadStructures();
//   }, [user, loadStructures]);

//   const normalizedStructures = useMemo(
//     () => (Array.isArray(structures) ? structures.map((item) => normalizeSalaryStructure(item)) : []),
//     [structures]
//   );

//   const filteredStructures = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();
//     if (!term) return normalizedStructures;

//     return normalizedStructures.filter((structure) => {
//       const employeeName = `${structure?.employee?.first_name || ""} ${structure?.employee?.last_name || ""}`.trim();
//       const values = [
//         employeeName,
//         structure?.name || "",
//         structure?.employee?.designation || "",
//         structure?.currency || "",
//         structure?.is_active ? "active" : "inactive",
//       ];
//       return values.some((value) => String(value).toLowerCase().includes(term));
//     });
//   }, [normalizedStructures, searchTerm]);

//   const totalStructures = useMemo(() => {
//     const raw =
//       pagination?.total ??
//       pagination?.totalItems ??
//       pagination?.total_items ??
//       pagination?.count ??
//       pagination?.itemCount ??
//       pagination?.recordsTotal;

//     const parsed = Number(raw);
//     const computed = Number.isFinite(parsed) ? parsed : 0;
//     return Math.max(computed, normalizedStructures.length);
//   }, [pagination, normalizedStructures.length]);

//   const tableTotal = searchTerm.trim() ? filteredStructures.length : totalStructures;

//   // Use columns from separate file
//   const columns = useMemo(
//     () =>
//       salaryStructureColumns({
//         onView: setSelectedStructure,
//       }),
//     []
//   );
//   const handleRefresh = () => {
//     loadStructures();
//   };

//   return (
//     <div className="flex flex-col gap-6 mt-5">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">Salary Structure</h1>
//           <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
//             Review and manage salary structures without switching tabs.
//           </p>
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           <Button variant="outline" className="gap-2" onClick={handleRefresh}>
//             <RefreshCw className="h-4 w-4" />Refresh
//           </Button>
//           {perms.canCreateStructure && (
//             <Button className="gap-2" onClick={() => setShowCreateStructure(true)}>
//               <Plus className="h-4 w-4" />New Structure
//             </Button>
//           )}
//         </div>
//       </div>

//       <Card className="border-border/60 shadow-sm">
//         <CardContent className="pt-4">
//           <TableToolbar
//             placeholder="Search employee, structure, designation..."
//             searchValue={searchTerm}
//             onSearchChange={setSearchTerm}
//             className="mb-4"
//             rightSlot={
//               <span className="text-sm text-muted-foreground">
//                 <span className="font-medium text-foreground">{tableTotal}</span> structure(s)
//               </span>
//             }
//           />

//           <DataTable
//             data={filteredStructures}
//             columns={columns}
//             page={pageIndex}
//             pageSize={pageSize}
//             total={tableTotal}
//             setPage={(nextPage) => {
//               setPageIndex(nextPage);
//               if (!searchTerm.trim()) {
//                 loadStructures(nextPage + 1, pageSize);
//               }
//             }}
//             setPageSize={(nextSize) => {
//               setPageIndex(0);
//               setPageSize(nextSize);
//               if (!searchTerm.trim()) {
//                 loadStructures(1, nextSize);
//               }
//             }}
//             isLoading={loading}
//             columnsBtn={false}
//             loadingText="Loading salary structures..."
//           />
//         </CardContent>
//       </Card>

//       <SalaryStructureModal
//         structure={selectedStructure}
//         open={!!selectedStructure}
//         onClose={() => setSelectedStructure(null)}
//         perms={perms}
//       />

//     </div>
//   );
// }

// function extractErrorMessage(error, fallback) {
//   return (
//     error?.response?.data?.message ||
//     error?.response?.data?.error ||
//     error?.message ||
//     fallback
//   );
// }






"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import { MobileCardList } from "../../../components/responsiveness/late-regulation-card";
import TableToolbar from "@/components/common/table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fmtPKR, getPermissions, normalizeSalaryStructure } from "@/components/modal-components/modalcomponents";
import { salaryStructureColumns } from "./salary-structure-columns";
import SalaryStructureModal from "@/components/modals/SalaryStructureModal";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function extractErrorMessage(error, fallback) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
}

function safeFmt(value) {
    if (value == null || value === "") return "--";
    try { return fmtPKR(value); } catch { return String(value); }
}

/* ─── Mobile card fields — exact keys from salaryStructureColumns ───────────
 *
 * Confirmed keys from columns file:
 *   row.original.employee.first_name / last_name / designation  → Employee
 *   row.original.name                                           → Structure
 *   row.original.basic_salary                                   → Basic Salary
 *   row.original.allowance_total                                → Allowances
 *   row.original.deduction_total                                → Deductions
 *   row.original.currency                                       → Currency
 *   row.original.is_active                                      → Status
 *
 * Card layout:
 *   HEADER   Employee name + designation         [Active/Inactive badge]
 *   ──────────────────────────────────────────────────────────────────
 *   Structure                 │  Currency
 *   ──────────────────────────────────────────────────────────────────
 *   FULL  Basic Salary
 *   FULL  Allowances
 *   FULL  Deductions
 */
const salaryStructureCardFields = [
    // ── Header title ──────────────────────────────────────────────────────────
    {
        label: "Employee",
        accessor: (row) => {
            const emp = row?.employee || {};
            const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
            const designation = emp.designation || "";
            return (
                <span>
                    <span className="font-semibold text-sm leading-tight">
                        {name || "—"}
                    </span>
                    {designation && (
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                            {designation}
                        </span>
                    )}
                </span>
            );
        },
    },

    // ── 2-col grid ────────────────────────────────────────────────────────────
    {
        label: "Structure",
        accessor: (row) => row?.name || "—",
        className: "text-sm text-muted-foreground",
    },
    {
        label: "Currency",
        accessor: (row) => row?.currency || "PKR",
        className: "text-sm text-muted-foreground",
    },

    // ── Full-width: Basic Salary ──────────────────────────────────────────────
    {
        label: "Basic Salary",
        accessor: (row) => (
            <span className="text-sm font-mono tabular-nums font-bold text-primary">
                {safeFmt(row?.basic_salary)}
            </span>
        ),
        fullWidth: true,
    },

    // ── Full-width: Allowances ────────────────────────────────────────────────
    {
        label: "Allowances",
        accessor: (row) => (
            <span className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {safeFmt(row?.allowance_total)}
            </span>
        ),
        fullWidth: true,
    },

    // ── Full-width: Deductions ────────────────────────────────────────────────
    {
        label: "Deductions",
        accessor: (row) => (
            <span className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">
                {safeFmt(row?.deduction_total)}
            </span>
        ),
        fullWidth: true,
    },
];

/* ─── Status highlight badge ─────────────────────────────────────────────── */
const salaryStructureCardHighlight = {
    accessor: (row) => (
        <Badge
            variant="outline"
            className={
                row?.is_active
                    ? "text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "text-xs font-semibold bg-muted text-muted-foreground border-border"
            }
        >
            {row?.is_active ? "Active" : "Inactive"}
        </Badge>
    ),
};

/* ─── Page component ─────────────────────────────────────────────────────── */

export default function SalaryStructurePage() {
    const [user, setUser] = useState(null);
    useEffect(() => { setUser(getUser()); }, []);

    const perms = useMemo(() => getPermissions(user), [user]);

    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [showCreateStructure, setShowCreateStructure] = useState(false);

    const loadStructures = useCallback(async () => {
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
    }, [perms.selfEmployeeId]);

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
        return normalizedStructures.filter((s) => {
            const emp = s?.employee || {};
            const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
            return [
                name,
                s?.name || "",
                emp.designation || "",
                s?.currency || "",
                s?.is_active ? "active" : "inactive",
            ].some((v) => String(v).toLowerCase().includes(term));
        });
    }, [normalizedStructures, searchTerm]);

    const totalStructures = useMemo(() => {
        const raw =
            pagination?.total ?? pagination?.totalItems ?? pagination?.total_items ??
            pagination?.count ?? pagination?.itemCount ?? pagination?.recordsTotal;
        const parsed = Number(raw);
        return Math.max(Number.isFinite(parsed) ? parsed : 0, normalizedStructures.length);
    }, [pagination, normalizedStructures.length]);

    const tableTotal = searchTerm.trim() ? filteredStructures.length : totalStructures;

    const columns = useMemo(
        () => salaryStructureColumns({ onView: setSelectedStructure }),
        []
    );

    const handlePageChange = (nextPage) => {
        setPageIndex(nextPage);
        if (!searchTerm.trim()) loadStructures(nextPage + 1, pageSize);
    };

    const handlePageSizeChange = (nextSize) => {
        setPageIndex(0);
        setPageSize(nextSize);
        if (!searchTerm.trim()) loadStructures(1, nextSize);
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
                    <Button variant="outline" className="gap-2" onClick={loadStructures} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    {perms.canCreateStructure && (
                        <Button className="gap-2" onClick={() => setShowCreateStructure(true)}>
                            <Plus className="h-4 w-4" />
                            New Structure
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-4 space-y-4">
                    <TableToolbar
                        placeholder="Search employee, structure, designation..."
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        rightSlot={
                            <span className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{tableTotal}</span> structure(s)
                            </span>
                        }
                    />

                    {/* Desktop */}
                    <div className="hidden md:block">
                        <DataTable
                            data={filteredStructures}
                            columns={columns}
                            page={pageIndex}
                            pageSize={pageSize}
                            total={tableTotal}
                            setPage={handlePageChange}
                            setPageSize={handlePageSizeChange}
                            isLoading={loading}
                            columnsBtn={false}
                            loadingText="Loading salary structures..."
                        />
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        <MobileCardList
                            data={filteredStructures}
                            fields={salaryStructureCardFields}
                            highlight={salaryStructureCardHighlight}
                            actions={(row) => (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="w-full h-8 rounded-md px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                                    onClick={() => setSelectedStructure(row)}
                                >
                                    View
                                </Button>
                            )}
                            keyExtractor={(row) => row?.id || row?.employee?.id || String(Math.random())}
                            isLoading={loading}
                            loadingText="Loading salary structures..."
                            emptyText="No salary structures found."
                            pagination
                            page={pageIndex}
                            pageSize={pageSize}
                            total={tableTotal}
                            setPage={handlePageChange}
                            setPageSize={handlePageSizeChange}
                        />
                    </div>
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