'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CreditCard, TrendingUp, Users, CheckCircle, Clock, DollarSign,
  RefreshCw, FileText, Plus, ChevronLeft, ChevronRight,
  Banknote, Building2, UserCheck, AlertCircle, Download, Calendar,
  BarChart3, Percent, AlertTriangle, Info, Search, X,
  Eye, EyeIcon, PlayCircle, Pencil, Shield, Trash2, Settings,
  ChevronDown, ChevronUp, Tag, Zap, Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { DesignationBadge, EmptyState, fmtNum, fmtPKR, getPermissions, MONTH_NAMES, MONTH_SHORT, normalizePayroll, normalizeSalaryStructure, StatusBadge } from "../../../../components/modal-components/modalcomponents";
import PoliciesTab from "../../../../components/modal-components/policy-tab";
import EmployeePayrollHistoryModal from "../../../../components/modals/EmployeePayrollHistoryModal";
import SalaryStructureModal from "../../../../components/modals/SalaryStructureModal";
import EditStructureModal from "../../../../components/modals/EditStructureModal";
import CreateStructureModal from "../../../../components/modals/createstucturemodal";
import PayrollDetailModal from '../../../../components/modals/Payrolldetailsmodal'
import GenerateModal from '../../../../components/modals/generatemodal'

export default function PayrollService() {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  const [activeTab, setActiveTab] = useState("employees");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Employees
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empQuery, setEmpQuery] = useState("");
  const [empPage, setEmpPage] = useState(0);
  const [empPageSize] = useState(10);
  const [empTotal, setEmpTotal] = useState(0);

  // My payrolls
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myPage, setMyPage] = useState(1);
  const [myPagination, setMyPagination] = useState({ total: 0, pages: 1 });
  const [myFilterStatus, setMyFilterStatus] = useState("");
  const [myFilterMonth, setMyFilterMonth] = useState("");
  const [myFilterYear, setMyFilterYear] = useState(String(new Date().getFullYear()));

  // Structures
  const [structures, setStructures] = useState([]);
  const [structLoading, setStructLoading] = useState(false);
  const [structPage, setStructPage] = useState(1);
  const [structPagination, setStructPagination] = useState({ total: 0, pages: 1 });

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generateEmployee, setGenerateEmployee] = useState(null);
  const [showBulkGenerate, setShowBulkGenerate] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);
  const [showCreateStructure, setShowCreateStructure] = useState(false);

  const loadEmployees = useCallback(async () => {
    setEmpLoading(true); setError("");
    try {
      const res = await axiosInstance.get("/employee", {
        params: { search: empQuery || undefined, page: empPage + 1, limit: empPageSize, sortBy: "created_at", sortOrder: "desc" }
      });
      setEmployees(res.data.employees ?? []);
      setEmpTotal(res.data.pagination?.total ?? 0);
    } catch (e) { setError(extractErrorMessage(e, "Failed to load employees.")); }
    finally { setEmpLoading(false); }
  }, [empQuery, empPage, empPageSize]);

  useEffect(() => { if (user && perms.canViewAllPayrolls) loadEmployees(); }, [loadEmployees, user, perms.canViewAllPayrolls]);
  useEffect(() => { setEmpPage(0); }, [empQuery]);
  useEffect(() => { if (user) setActiveTab(perms.canViewAllPayrolls ? "employees" : "mine"); }, [user]);

  const loadMyPayrolls = useCallback(async (p) => {
    setMyLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (myFilterStatus) params.status = myFilterStatus;
      if (myFilterMonth) params.month = myFilterMonth;
      if (myFilterYear) params.year = myFilterYear;
      const res = await axiosInstance.get("/payroll/me", { params });
      const d = res.data;
      if (d.payroll) { setMyPayrolls([d.payroll]); setMyPagination({ total: 1, pages: 1 }); }
      else { setMyPayrolls(d.payrolls || []); setMyPagination(d.pagination || { total: 0, pages: 1 }); }
    } catch (e) {
      if (e.response?.status !== 404) toast.error(extractErrorMessage(e, "Failed to fetch your payrolls"));
      setMyPayrolls([]);
    } finally { setMyLoading(false); }
  }, [myFilterStatus, myFilterMonth, myFilterYear]);

  const loadStructures = useCallback(async (p) => {
    setStructLoading(true);
    try {
      if (perms.canViewAllStructures) {
        const res = await axiosInstance.get("/salary-structures", { params: { page: p, limit: 10 } });
        setStructures(res.data.salary_structures ?? []);
        setStructPagination(res.data.pagination ?? { total: 0, pages: 1 });
      } else {
        const empId = perms.selfEmployeeId;
        if (!empId) { toast.error("Cannot determine your employee ID."); setStructures([]); return; }
        const res = await axiosInstance.get(`/salary-structures/employee/${empId}`);
        const s = res.data?.salary_structure || res.data;
        setStructures(s?.id ? [s] : []);
        setStructPagination({ total: s?.id ? 1 : 0, pages: 1 });
      }
    } catch (e) {
      if (e.response?.status !== 404) toast.error(extractErrorMessage(e, "Failed to fetch salary structures"));
      setStructures([]);
    } finally { setStructLoading(false); }
  }, [perms.canViewAllStructures, perms.selfEmployeeId]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "mine") loadMyPayrolls(myPage);
    if (activeTab === "structures") loadStructures(structPage);
  }, [activeTab, user]);

  const handleGenerate = async (payload) => {
    setActionLoading(true);
    try {
      const res = await axiosInstance.post("/payroll/generate", payload);
      const d = res.data;
      const count = d.total ?? (Array.isArray(d.payrolls) ? d.payrolls.length : 1);
      toast.success(`Payroll generated for ${count} employee${count !== 1 ? "s" : ""}!`);
      setGenerateEmployee(null); setShowBulkGenerate(false);
      if (activeTab === "employees" && perms.canViewAllPayrolls) loadEmployees();
      if (activeTab === "mine") loadMyPayrolls(1);
    } catch (e) { toast.error(extractErrorMessage(e, "Payroll generation failed")); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/approve`);
      toast.success("Payroll approved and moved to Processed.");
      setSelectedPayroll(null);
      if (activeTab === "mine") loadMyPayrolls(myPage);
    } catch (e) { toast.error(extractErrorMessage(e, "Approval failed")); }
    finally { setActionLoading(false); }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/mark-paid`);
      toast.success("Payroll marked as Paid.");
      setSelectedPayroll(null);
      if (activeTab === "mine") loadMyPayrolls(myPage);
    } catch (e) { toast.error(extractErrorMessage(e, "Failed to mark as paid")); }
    finally { setActionLoading(false); }
  };

  const handleRegenerate = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/payroll/${id}/regenerate`);
      toast.success("Payroll regenerated from scratch.");
      setSelectedPayroll(null);
      if (activeTab === "mine") loadMyPayrolls(myPage);
    } catch (e) { toast.error(extractErrorMessage(e, "Regeneration failed")); }
    finally { setActionLoading(false); }
  };

  const handlePayslip = (payroll) => {
    try {
      const html = buildPayslipHtml(payroll);
      const win = window.open("", "_blank");
      if (!win) { toast.error("Pop-up blocked — allow pop-ups to download payslips."); return; }
      win.document.write(html); win.document.close();
      toast.success("Payslip opened — use Print → Save as PDF.");
    } catch (e) { toast.error("Failed to generate payslip: " + (e.message || "Unknown error")); }
  };

  const handleCreateStructure = async (payload) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/salary-structures", payload);
      toast.success("Salary structure created successfully!");
      setShowCreateStructure(false); setStructPage(1); loadStructures(1);
    } catch (e) { toast.error(extractErrorMessage(e, "Failed to create salary structure")); }
    finally { setActionLoading(false); }
  };

  const handleEditStructure = async (id, payload) => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/salary-structures/${id}`, payload);
      toast.success("Salary structure updated successfully!");
      setEditingStructure(null); setSelectedStructure(null); loadStructures(structPage);
    } catch (e) { toast.error(extractErrorMessage(e, "Failed to update salary structure")); }
    finally { setActionLoading(false); }
  };

  const handleRefresh = () => {
    if (activeTab === "employees" && perms.canViewAllPayrolls) loadEmployees();
    else if (activeTab === "mine") loadMyPayrolls(myPage);
    else if (activeTab === "structures") loadStructures(structPage);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Manage employee payrolls, salary structures, policies, and payment history.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-end">
          <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
          {perms.canGeneratePayroll && (
            <Button className="w-full sm:w-auto gap-2" onClick={() => setShowBulkGenerate(true)}>
              <TrendingUp className="h-4 w-4" />Generate All Payroll
            </Button>
          )}
          {perms.canCreateStructure && activeTab === "structures" && (
            <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => setShowCreateStructure(true)}>
              <Plus className="h-4 w-4" />New Structure
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(t) => { setActiveTab(t); setError(""); }}>
        <TabsList className="mb-2 h-9">
          {perms.canViewAllPayrolls && (
            <TabsTrigger value="employees" className="text-xs gap-1.5 h-full">
              <Users className="w-3.5 h-3.5" />All Employees
            </TabsTrigger>
          )}
          <TabsTrigger value="mine" className="text-xs gap-1.5 h-full" onClick={() => loadMyPayrolls(1)}>
            <UserCheck className="w-3.5 h-3.5" />My Payroll
          </TabsTrigger>
          <TabsTrigger value="structures" className="text-xs gap-1.5 h-full" onClick={() => loadStructures(1)}>
            <Building2 className="w-3.5 h-3.5" />{perms.canViewAllStructures ? "Salary Structures" : "My Structure"}
          </TabsTrigger>
          {perms.canManagePolicies && (
            <TabsTrigger value="policies" className="text-xs gap-1.5 h-full">
              <Shield className="w-3.5 h-3.5" />Policies
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── All Employees Tab ─────────────────────────────────────────────── */}
        {perms.canViewAllPayrolls && (
          <TabsContent value="employees" className="mt-0">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Employee Directory</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input className="h-9 pl-8 text-sm" placeholder="Search by name, ID, department…" value={empQuery} onChange={(e) => setEmpQuery(e.target.value)} />
                    {empQuery && <button onClick={() => setEmpQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{empTotal}</span> employees</div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                        {["Name", "Employee ID", "Department", "Designation", "Employment Type", "Status", "Actions"].map((h) => (
                          <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3 whitespace-nowrap">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empLoading ? (
                        <TableRow><TableCell colSpan={7} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading employees…" /></TableCell></TableRow>
                      ) : employees.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="py-0 border-0"><EmptyState icon={Users} message="No employees found." /></TableCell></TableRow>
                      ) : employees.map((emp, i) => {
                        const name = [emp.first_name, emp.last_name].filter(Boolean).join(" ") || "—";
                        return (
                          <TableRow key={emp.id || i} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="py-3">
                              <button className="text-left hover:underline" onClick={() => setSelectedEmployee(emp)}>
                                <div className="font-medium text-sm leading-tight">{name}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{emp.email || ""}</div>
                              </button>
                            </TableCell>
                            <TableCell><span className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">{emp.employee_id ?? "—"}</span></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{emp.department ?? "—"}</TableCell>
                            <TableCell><DesignationBadge designation={emp.designation} /></TableCell>
                            <TableCell><span className="capitalize text-sm text-muted-foreground">{(emp.employment_type ?? "").replace(/_/g, " ") || "—"}</span></TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs font-semibold", emp.is_active !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border")}>
                                {emp.is_active !== false ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1" onClick={() => setSelectedEmployee(emp)}>
                                  <EyeIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">History</span>
                                </Button>
                                {perms.canGeneratePayroll && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary" onClick={() => setGenerateEmployee(emp)}>
                                    <PlayCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Generate</span>
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

                {empTotal > empPageSize && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Showing {empPage * empPageSize + 1}–{Math.min((empPage + 1) * empPageSize, empTotal)} of {empTotal}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={empPage === 0} onClick={() => setEmpPage(empPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                      <span className="text-xs text-muted-foreground tabular-nums">Page {empPage + 1} of {Math.ceil(empTotal / empPageSize)}</span>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={(empPage + 1) * empPageSize >= empTotal} onClick={() => setEmpPage(empPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── My Payroll Tab ────────────────────────────────────────────────── */}
        <TabsContent value="mine" className="mt-0 space-y-4">
          <div className="flex flex-wrap gap-2.5 items-end">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
              <Select value={myFilterStatus || "all"} onValueChange={(v) => setMyFilterStatus(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Month</Label>
              <Select value={myFilterMonth || "all"} onValueChange={(v) => setMyFilterMonth(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Year</Label>
              <Input className="h-8 w-20 text-sm" type="number" min="2000" max="2100" value={myFilterYear} onChange={(e) => setMyFilterYear(e.target.value)} />
            </div>
            <Button size="sm" className="h-8" onClick={() => { setMyPage(1); loadMyPayrolls(1); }}>Apply</Button>
          </div>

          <Card className="border shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                    {["Period", "Working Days", "Payable Days", "Gross", "Deductions", "Net Salary", "Status", ""].map((h) => (
                      <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap py-3">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLoading ? (
                    <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading payrolls…" /></TableCell></TableRow>
                  ) : myPayrolls.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState message="No payroll records found." /></TableCell></TableRow>
                  ) : myPayrolls.map((p, i) => {
                    const n = normalizePayroll(p);
                    return (
                      <TableRow key={n.id || i} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setSelectedPayroll(n)}>
                        <TableCell className="text-sm font-medium whitespace-nowrap">{MONTH_SHORT[(n.period.month || 1) - 1]} {n.period.year}</TableCell>
                        <TableCell className="text-sm text-center tabular-nums text-muted-foreground">{fmtNum(n.period.working_days)}</TableCell>
                        <TableCell className="text-sm text-center tabular-nums font-bold text-primary">{fmtNum(n.attendance.payable_days)}</TableCell>
                        <TableCell className="text-sm font-mono tabular-nums text-muted-foreground">{fmtPKR(n.totals.gross_salary)}</TableCell>
                        <TableCell className="text-sm font-mono tabular-nums text-red-600 dark:text-red-400">-{fmtPKR(n.totals.deductions_total)}</TableCell>
                        <TableCell className="text-sm font-mono tabular-nums font-bold">{fmtPKR(n.totals.net_salary)}</TableCell>
                        <TableCell><StatusBadge status={n.status} /></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedPayroll(n); }}>View</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {myPagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                <span className="text-xs text-muted-foreground">{myPagination.total} record{myPagination.total !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={myPage <= 1} onClick={() => { setMyPage(myPage - 1); loadMyPayrolls(myPage - 1); }}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-xs tabular-nums text-muted-foreground">Page {myPage} of {myPagination.pages}</span>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={myPage >= myPagination.pages} onClick={() => { setMyPage(myPage + 1); loadMyPayrolls(myPage + 1); }}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Salary Structures Tab ─────────────────────────────────────────── */}
        <TabsContent value="structures" className="mt-0 space-y-4">
          {perms.canCreateStructure && (
            <div className="flex justify-end">
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowCreateStructure(true)}>
                <Plus className="w-3.5 h-3.5" />New Salary Structure
              </Button>
            </div>
          )}
          <Card className="border shadow-none overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{perms.canViewAllStructures ? "All Salary Structures" : "My Salary Structure"}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                    {["Employee", "Structure", "Basic Salary", "Allowances", "Deductions", "Currency", "Status", ""].map((h) => (
                      <TableHead key={h} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground py-3">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structLoading ? (
                    <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={RefreshCw} message="Loading structures…" /></TableCell></TableRow>
                  ) : structures.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-0 border-0"><EmptyState icon={Building2} message="No salary structures found." /></TableCell></TableRow>
                  ) : structures.map((s, i) => {
                    const ns = normalizeSalaryStructure(s);
                    const emp = ns.employee || {};
                    return (
                      <TableRow key={ns.id || i} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setSelectedStructure(ns)}>
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
                          <Badge variant="outline" className={cn("text-xs font-semibold", ns.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border")}>
                            {ns.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedStructure(ns)}>View</Button>
                            {perms.canEditStructure && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary hover:text-primary" onClick={() => setEditingStructure(ns)}>
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
                <span className="text-xs text-muted-foreground">{structPagination.total} structure{structPagination.total !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={structPage <= 1} onClick={() => { const p = structPage - 1; setStructPage(p); loadStructures(p); }}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-xs tabular-nums text-muted-foreground">Page {structPage} of {structPagination.pages}</span>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={structPage >= structPagination.pages} onClick={() => { const p = structPage + 1; setStructPage(p); loadStructures(p); }}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Policies Tab ──────────────────────────────────────────────────── */}
        {perms.canManagePolicies && (
          <TabsContent value="policies" className="mt-0">
            <PoliciesTab perms={perms} />
          </TabsContent>
        )}
      </Tabs>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <EmployeePayrollHistoryModal
        employee={selectedEmployee} open={!!selectedEmployee} onClose={() => setSelectedEmployee(null)}
        perms={perms} onSelectPayroll={(p) => setSelectedPayroll(p)}
        onGenerate={(emp) => { setSelectedEmployee(null); setGenerateEmployee(emp); }}
        actionLoading={actionLoading}
      />
      <PayrollDetailModal
        payroll={selectedPayroll} open={!!selectedPayroll} onClose={() => setSelectedPayroll(null)}
        perms={perms} onApprove={handleApprove} onMarkPaid={handleMarkPaid}
        onRegenerate={handleRegenerate} onPayslip={handlePayslip} actionLoading={actionLoading}
      />
      <GenerateModal open={!!generateEmployee} onClose={() => setGenerateEmployee(null)} onGenerate={handleGenerate} loading={actionLoading} prefilledEmployee={generateEmployee} />
      <GenerateModal open={showBulkGenerate} onClose={() => setShowBulkGenerate(false)} onGenerate={handleGenerate} loading={actionLoading} prefilledEmployee={null} />
      <SalaryStructureModal structure={selectedStructure} open={!!selectedStructure} onClose={() => setSelectedStructure(null)} perms={perms} onEdit={(s) => { setSelectedStructure(null); setEditingStructure(s); }} />
      <EditStructureModal structure={editingStructure} open={!!editingStructure} onClose={() => setEditingStructure(null)} onSave={handleEditStructure} loading={actionLoading} />
      <CreateStructureModal open={showCreateStructure} onClose={() => setShowCreateStructure(false)} onCreate={handleCreateStructure} loading={actionLoading} />
    </div>
  );
}