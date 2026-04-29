// 'use client'
// import { useState, useEffect, useCallback, useMemo } from "react";
// import axiosInstance from "@/lib/axiosInstance";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import {
//   Building2, RefreshCw, Plus, ChevronLeft, ChevronRight, Pencil, CreditCard,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { getUser } from "@/lib/auth";
// import {
//   EmptyState, fmtPKR, getPermissions, normalizeSalaryStructure,
// } from "@/components/modal-components/modalcomponents";
// import SalaryStructureModal from "@/components/modals/SalaryStructureModal";
// import EditStructureModal from "@/components/modals/EditStructureModal";
// import CreateStructureModal, { usePolicies } from "@/components/modals/createstucturemodal";

// export default function SalaryStructuresPage() {
//   const [user, setUser] = useState(null);
//   useEffect(() => { setUser(getUser()); }, []);
//   const perms = useMemo(() => getPermissions(user), [user]);

//   const [actionLoading, setActionLoading] = useState(false);

//   // Structures state
//   const [structures, setStructures] = useState([]);
//   const [structLoading, setStructLoading] = useState(false);
//   const [structPage, setStructPage] = useState(1);
//   const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });

//   // Policies — fetched once so SalaryStructureModal can resolve names from IDs
//   const { policies, fetchAllPolicies } = usePolicies();
//   useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

//   // Modal states
//   const [selectedStructure, setSelectedStructure] = useState(null);
//   const [editingStructure, setEditingStructure] = useState(null);
//   const [showCreateStructure, setShowCreateStructure] = useState(false);

//   const loadStructures = useCallback(async (p) => {
//     setStructLoading(true);
//     try {
//       if (perms.canViewAllStructures) {
//         const res = await axiosInstance.get("/salary-structures", { params: { page: p, limit: 10 } });
//         setStructures(res.data.salary_structures ?? []);
//         setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
//       } else {
//         const empId = perms.selfEmployeeId;
//         if (!empId) {
//           toast.error("Cannot determine your employee ID.");
//           setStructures([]);
//           return;
//         }
//         const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
//         const s = res.data?.salary_structure || res.data;
//         setStructures(s?.id ? [s] : []);
//         setStructPagination({ total: s?.id ? 1 : 0, pages: 1 });
//       }
//     } catch (e) {
//       if (e.response?.status !== 404) toast.error("Failed to fetch salary structures");
//       setStructures([]);
//     } finally {
//       setStructLoading(false);
//     }
//   }, [perms.canViewAllStructures, perms.selfEmployeeId]);

//   useEffect(() => {
//     if (user) loadStructures(structPage);
//   }, [user, loadStructures]);

//   const handleCreateStructure = async (payload) => {
//     setActionLoading(true);
//     try {
//       await axiosInstance.post("/salary-structures", payload);
//       toast.success("Salary structure created successfully!");
//       setShowCreateStructure(false);
//       setStructPage(1);
//       loadStructures(1);
//     } catch (e) {
//       const d = e?.response?.data;
//       toast.error(d?.message || d?.error || e?.message || "Failed to create salary structure");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleEditStructure = async (id, payload) => {
//     setActionLoading(true);
//     try {
//       await axiosInstance.patch(`/salary-structures/${id}`, payload);
//       toast.success("Salary structure updated successfully!");
//       setEditingStructure(null);
//       setSelectedStructure(null);
//       loadStructures(structPage);
//     } catch (e) {
//       const d = e?.response?.data;
//       toast.error(d?.message || d?.error || e?.message || "Failed to update salary structure");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-5">
//         {/* <div>
//           <div className="flex items-center gap-2">
//             <div className="rounded-lg border bg-background p-2 shadow-xs">
//               <CreditCard className="h-4 w-4 text-muted-foreground" />
//             </div>
//             <h1 className="text-2xl font-semibold tracking-tight">
//               {perms.canViewAllStructures ? "Salary Structures" : "My Salary Structure"}
//             </h1>
//           </div>
//           <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
//             {perms.canViewAllStructures
//               ? "Manage employee salary structures, allowances, and deductions."
//               : "View your assigned salary structure, allowances, and deductions."}
//           </p>
//         </div> */}

//       </div>

//       {/* Table */}
//       <Card className="border-border/60 shadow-sm overflow-hidden">
//         <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <CardTitle className="text-base">
//             {perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}
//           </CardTitle>

//           <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
//             <Button
//               variant="outline"
//               className="w-full sm:w-auto gap-2"
//               onClick={() => loadStructures(structPage)}
//             >
//               <RefreshCw className="h-4 w-4" /> Refresh
//             </Button>

//             {perms.canCreateStructure && (
//               <Button
//                 className="w-full sm:w-auto gap-2"
//                 onClick={() => setShowCreateStructure(true)}
//               >
//                 <Plus className="h-4 w-4" /> New Structure
//               </Button>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent className="pt-0 px-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
//                   {["Employee", "Structure", "Basic Salary", "Allowances", "Deductions", "Currency", "Status", ""].map((h) => (
//                     <TableHead
//                       key={h}
//                       className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3"
//                     >
//                       {h}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {structLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="py-0 border-0">
//                       <EmptyState icon={RefreshCw} message="Loading structures…" />
//                     </TableCell>
//                   </TableRow>
//                 ) : structures.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="py-0 border-0">
//                       <EmptyState icon={Building2} message="No salary structures found." />
//                     </TableCell>
//                   </TableRow>
//                 ) : structures.map((s, i) => {
//                   const ns = normalizeSalaryStructure(s);
//                   const emp = ns.employee || {};
//                   return (
//                     <TableRow
//                       key={ns.id || i}
//                       className="hover:bg-muted/20 cursor-pointer transition-colors"
//                       onClick={() => setSelectedStructure(ns)}
//                     >
//                       <TableCell className="py-3">
//                         <div className="font-semibold text-sm leading-tight">
//                           {emp.first_name} {emp.last_name}
//                         </div>
//                         <div className="text-xs text-muted-foreground mt-0.5">
//                           {emp.designation || "—"}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm text-muted-foreground">
//                         {ns.name || "—"}
//                       </TableCell>
//                       <TableCell className="text-sm font-mono tabular-nums font-bold text-primary">
//                         {fmtPKR(ns.basic_salary)}
//                       </TableCell>
//                       <TableCell className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
//                         {fmtPKR(ns.allowance_total)}
//                       </TableCell>
//                       <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">
//                         {fmtPKR(ns.deduction_total)}
//                       </TableCell>
//                       <TableCell className="text-sm text-muted-foreground">
//                         {ns.currency || "PKR"}
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={cn(
//                             "text-xs font-semibold",
//                             ns.is_active
//                               ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                               : "bg-muted text-muted-foreground border-border"
//                           )}
//                         >
//                           {ns.is_active ? "Active" : "Inactive"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center gap-1">
//                           <Button
//                             size="sm" variant="ghost" className="h-7 px-2 text-xs"
//                             onClick={() => setSelectedStructure(ns)}
//                           >
//                             View
//                           </Button>
//                           {perms.canEditStructure && (
//                             <Button
//                               size="sm" variant="ghost"
//                               className="h-7 px-2 text-xs text-primary hover:text-primary"
//                               onClick={() => setEditingStructure(ns)}
//                             >
//                               <Pencil className="w-3 h-3" />
//                             </Button>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>

//           {structPagination.pages > 1 && (
//             <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
//               <span className="text-xs text-muted-foreground">
//                 {structPagination.total} structure{structPagination.total !== 1 ? "s" : ""}
//               </span>
//               <div className="flex items-center gap-2">
//                 <Button
//                   size="sm" variant="outline" className="h-7 w-7 p-0"
//                   disabled={structPage <= 1}
//                   onClick={() => { const p = structPage - 1; setStructPage(p); loadStructures(p); }}
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </Button>
//                 <span className="text-xs tabular-nums text-muted-foreground">
//                   Page {structPage} of {structPagination.pages}
//                 </span>
//                 <Button
//                   size="sm" variant="outline" className="h-7 w-7 p-0"
//                   disabled={structPage >= structPagination.pages}
//                   onClick={() => { const p = structPage + 1; setStructPage(p); loadStructures(p); }}
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Modals */}
//       <SalaryStructureModal
//         structure={selectedStructure}
//         open={!!selectedStructure}
//         onClose={() => setSelectedStructure(null)}
//         perms={perms}
//         onEdit={(s) => { setSelectedStructure(null); setEditingStructure(s); }}
//         policies={policies}
//       />
//       <EditStructureModal
//         structure={editingStructure}
//         open={!!editingStructure}
//         onClose={() => setEditingStructure(null)}
//         onSave={handleEditStructure}
//         loading={actionLoading}
//       />
//       <CreateStructureModal
//         open={showCreateStructure}
//         onClose={() => setShowCreateStructure(false)}
//         onCreate={handleCreateStructure}
//         loading={actionLoading}
//       />
//     </div>
//   );
// }

'use client'
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Building2, RefreshCw, Plus, ChevronLeft, ChevronRight, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import {
  EmptyState, fmtPKR, getPermissions, normalizeSalaryStructure,
} from "@/components/modal-components/modalcomponents";
import SalaryStructureModal from "@/components/modals/SalaryStructureModal";
import { usePolicies } from "@/components/modals/createstucturemodal";

export default function SalaryStructuresPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  // Structures state
  const [structures, setStructures]             = useState([]);
  const [structLoading, setStructLoading]       = useState(false);
  const [structPage, setStructPage]             = useState(1);
  const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });

  // Only view modal remains
  const [selectedStructure, setSelectedStructure] = useState(null);

  // Policies — needed for the view modal to resolve names
  const { policies, fetchAllPolicies } = usePolicies();
  useEffect(() => { fetchAllPolicies(); }, [fetchAllPolicies]);

  // ── navigation ────────────────────────────────────────────────────────────
  const goToCreate = () => router.push("/hr/policies_structure/salary-stucture/create-stucutre");
  const goToEdit   = (s) => router.push(`/hr/policies_structure/salary-stucture/${s.id}`);

  // ── load ──────────────────────────────────────────────────────────────────
  const loadStructures = useCallback(async (p) => {
    setStructLoading(true);
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get("/salary-structures", { params: { page: p, limit: 10 } });
        setStructures(res.data.salary_structures ?? []);
        setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
      } else {
        const empId = perms.selfEmployeeId;
        if (!empId) {
          toast.error("Cannot determine your employee ID.");
          setStructures([]);
          return;
        }
        const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
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
  }, [perms.canViewAllStructures, perms.selfEmployeeId]);

  useEffect(() => { if (user) loadStructures(structPage); }, [user, loadStructures]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base">
            {perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => loadStructures(structPage)}
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            {perms.canCreateStructure && (
              <Button
                className="w-full sm:w-auto gap-2"
                onClick={goToCreate}
              >
                <Plus className="h-4 w-4" /> New Structure
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                  {["Employee", "Structure", "Basic Salary", "Allowances", "Deductions", "Currency", "Status", "action"].map((h) => (
                    <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {structLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-0 border-0">
                      <EmptyState icon={RefreshCw} message="Loading structures…" />
                    </TableCell>
                  </TableRow>
                ) : structures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-0 border-0">
                      <EmptyState icon={Building2} message="No salary structures found." />
                    </TableCell>
                  </TableRow>
                ) : structures.map((s, i) => {
                  const ns  = normalizeSalaryStructure(s);
                  const emp = ns.employee || {};
                  return (
                    <TableRow
                      key={ns.id || i}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => setSelectedStructure(ns)}
                    >
                      <TableCell className="py-3">
                        <div className="font-semibold text-sm leading-tight">{emp.first_name} {emp.last_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{emp.designation || "—"}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ns.name || "—"}</TableCell>
                      <TableCell className="text-sm font-mono tabular-nums font-bold text-primary">{fmtPKR(ns.basic_salary)}</TableCell>
                      <TableCell className="text-sm font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{fmtPKR(ns.allowance_total)}</TableCell>
                      <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">{fmtPKR(ns.deduction_total)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ns.currency || "PKR"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-semibold",
                            ns.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {ns.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm" variant="ghost" className="h-7 px-2 text-xs"
                            onClick={() => setSelectedStructure(ns)}
                          >
                            View
                          </Button>
                          {perms.canEditStructure && (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs text-primary hover:text-primary"
                              onClick={() => goToEdit(ns)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {structPagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <span className="text-xs text-muted-foreground">
                {structPagination.total} structure{structPagination.total !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm" variant="outline" className="h-7 w-7 p-0"
                  disabled={structPage <= 1}
                  onClick={() => { const p = structPage - 1; setStructPage(p); loadStructures(p); }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Page {structPage} of {structPagination.pages}
                </span>
                <Button
                  size="sm" variant="outline" className="h-7 w-7 p-0"
                  disabled={structPage >= structPagination.pages}
                  onClick={() => { const p = structPage + 1; setStructPage(p); loadStructures(p); }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View modal only — create/edit are now separate pages */}
      <SalaryStructureModal
        structure={selectedStructure}
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        perms={perms}
        onEdit={(s) => { setSelectedStructure(null); goToEdit(s); }}
        policies={policies}
      />
    </div>
  );
}