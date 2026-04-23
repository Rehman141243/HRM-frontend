import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

// ─── Role detection ────────────────────────────────────────────────────────────
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtPKR = (n) => `PKR ${fmt(n)}`;
const STATUS_COLOR = {
  draft: { bg: "#FFF8E1", text: "#8B6914", border: "#F9A825" },
  processed: { bg: "#E3F2FD", text: "#0D47A1", border: "#1976D2" },
  paid: { bg: "#E8F5E9", text: "#1B5E20", border: "#388E3C" },
};
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.border }} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E8E0", borderRadius: 12,
      padding: "16px 20px", borderLeft: `4px solid ${accent || "#4F46E5"}`
    }}>
      <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</p>
      <p style={{ margin: "6px 0 2px", fontSize: 22, fontWeight: 700, color: "#1A1A2E", fontFamily: "'DM Mono', monospace" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 11, color: "#999" }}>{sub}</p>}
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const colors = { success: "#16A34A", error: "#DC2626", info: "#2563EB" };
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: colors[type] || colors.info, color: "#fff",
      padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 12,
      maxWidth: 360, animation: "slideIn 0.2s ease"
    }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
    </div>
  );
}

function Modal({ title, children, onClose, width = 600 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: width,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #F0F0EC", position: "sticky", top: 0, background: "#fff", zIndex: 1
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "#F5F5F0", border: "none", borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#666"
          }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

function FieldRow({ label, value, mono = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F7F7F3" }}>
      <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 600, fontFamily: mono ? "'DM Mono', monospace" : "inherit" }}>{value}</span>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>{label}</label>}
      <input style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8",
        fontSize: 14, color: "#1A1A2E", outline: "none", boxSizing: "border-box",
        fontFamily: "inherit", background: "#FAFAF8", transition: "border 0.2s"
      }} {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>{label}</label>}
      <select style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8",
        fontSize: 14, color: "#1A1A2E", outline: "none", boxSizing: "border-box",
        fontFamily: "inherit", background: "#FAFAF8", cursor: "pointer"
      }} {...props}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, loading, small }) {
  const styles = {
    primary: { background: "#4F46E5", color: "#fff", border: "none" },
    secondary: { background: "#F5F5F0", color: "#444", border: "1px solid #E0E0D8" },
    danger: { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" },
    success: { background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" },
    ghost: { background: "none", color: "#4F46E5", border: "1px solid #4F46E5" },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...s, borderRadius: 8, padding: small ? "6px 12px" : "9px 18px",
        fontSize: small ? 12 : 14, fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "inherit", whiteSpace: "nowrap", transition: "opacity 0.2s"
      }}
    >
      {loading ? "..." : children}
    </button>
  );
}

// ─── Payroll Detail Modal ─────────────────────────────────────────────────────
function PayrollDetail({ payroll, onClose, isAdminOrHr, onApprove, onMarkPaid, onRegenerate, onPayslip }) {
  if (!payroll) return null;
  const emp = payroll.employee || {};
  const period = payroll.period || {};
  const attendance = payroll.attendance || {};
  const totals = payroll.totals || {};
  const components = payroll.components || {};

  return (
    <Modal title={`Payroll — ${MONTH_NAMES[(period.month || 1) - 1]} ${period.year}`} onClose={onClose} width={720}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Employee */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Employee</p>
          <FieldRow label="Name" value={`${emp.first_name || ""} ${emp.last_name || ""}`} />
          <FieldRow label="Designation" value={emp.designation || "—"} />
          <FieldRow label="Department" value={emp.department || "—"} />
          <FieldRow label="Status" value={<StatusBadge status={payroll.status} />} />
        </div>
        {/* Period */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Period</p>
          <FieldRow label="Period" value={`${period.start_date} → ${period.end_date}`} />
          <FieldRow label="Working Days" value={period.working_days} />
          <FieldRow label="Present Days" value={attendance.present_days} />
          <FieldRow label="Payable Days" value={attendance.payable_days} />
          <FieldRow label="Unpaid Leaves" value={attendance.unpaid_leaves} />
          <FieldRow label="Paid Leaves" value={attendance.paid_leaves} />
          <FieldRow label="Late Arrivals" value={attendance.late_arrivals} />
          <FieldRow label="Overtime (hrs)" value={attendance.overtime_hours} />
        </div>
      </div>

      {/* Earnings */}
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Earnings</p>
        <div style={{ background: "#FAFAF8", borderRadius: 10, padding: "12px 16px" }}>
          <FieldRow label="Basic Salary" value={fmtPKR(totals.basic_salary)} mono />
          <FieldRow label="Allowances" value={fmtPKR(totals.allowances_total)} mono />
          {(components.allowances || []).map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 4px 16px" }}>
              <span style={{ fontSize: 12, color: "#999" }}>↳ {a.name}</span>
              <span style={{ fontSize: 12, color: "#666", fontFamily: "'DM Mono', monospace" }}>{fmtPKR(a.amount)}</span>
            </div>
          ))}
          <FieldRow label="Bonuses" value={fmtPKR(totals.bonuses_total)} mono />
          <FieldRow label="Overtime" value={fmtPKR(totals.overtime_amount)} mono />
          <div style={{ borderTop: "2px solid #E8E8E0", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Gross Salary</span>
            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono', monospace", color: "#4F46E5" }}>{fmtPKR(totals.gross_salary)}</span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Deductions</p>
        <div style={{ background: "#FFF8F8", borderRadius: 10, padding: "12px 16px" }}>
          <FieldRow label="Tax" value={fmtPKR(totals.tax_amount)} mono />
          <FieldRow label="Other Deductions" value={fmtPKR(totals.non_tax_deductions_total)} mono />
          {(components.deductions || []).map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 4px 16px" }}>
              <span style={{ fontSize: 12, color: "#999" }}>↳ {d.name}</span>
              <span style={{ fontSize: 12, color: "#666", fontFamily: "'DM Mono', monospace" }}>{fmtPKR(d.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: "2px solid #F0D0D0", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Total Deductions</span>
            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Mono', monospace", color: "#DC2626" }}>{fmtPKR(totals.deductions_total)}</span>
          </div>
        </div>
      </div>

      {/* Net */}
      <div style={{
        marginTop: 20, background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
        borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ color: "#C7D2FE", fontWeight: 600, fontSize: 15 }}>Net Salary</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 28, fontFamily: "'DM Mono', monospace" }}>{fmtPKR(totals.net_salary)}</span>
      </div>

      {/* Actions */}
      {isAdminOrHr && (
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {payroll.status === "draft" && (
            <Btn variant="success" onClick={() => onApprove(payroll.id)}>Approve</Btn>
          )}
          {payroll.status === "processed" && (
            <Btn variant="success" onClick={() => onMarkPaid(payroll.id)}>Mark as Paid</Btn>
          )}
          {(payroll.status === "draft") && (
            <Btn variant="secondary" onClick={() => onRegenerate(payroll.id)}>Regenerate</Btn>
          )}
          <Btn variant="ghost" onClick={() => onPayslip(payroll.id)}>Download Payslip</Btn>
        </div>
      )}
      {!isAdminOrHr && (
        <div style={{ marginTop: 20 }}>
          <Btn variant="ghost" onClick={() => onPayslip(payroll.id)}>Download Payslip</Btn>
        </div>
      )}
    </Modal>
  );
}

// ─── Generate Payroll Modal ───────────────────────────────────────────────────
function GenerateModal({ onClose, onGenerate, loading }) {
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), employee_id: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Generate Payroll" onClose={onClose} width={440}>
      <Select label="Month" value={form.month} onChange={set("month")}>
        {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </Select>
      <Input label="Year" type="number" min="2000" max="2100" value={form.year} onChange={set("year")} />
      <Input label="Employee ID (leave blank for all)" placeholder="UUID or leave empty" value={form.employee_id} onChange={set("employee_id")} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} onClick={() => onGenerate(form)}>Generate</Btn>
      </div>
    </Modal>
  );
}

// ─── Salary Structure Modal ───────────────────────────────────────────────────
function SalaryStructureModal({ structure, onClose }) {
  if (!structure) return null;
  const emp = structure.employee || {};
  return (
    <Modal title="Salary Structure" onClose={onClose} width={660}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Employee</p>
          <FieldRow label="Name" value={`${emp.first_name || ""} ${emp.last_name || ""}`} />
          <FieldRow label="Designation" value={emp.designation || "—"} />
          <FieldRow label="Department" value={emp.department || "—"} />
          <FieldRow label="Currency" value={structure.currency || "PKR"} />
          <FieldRow label="Active" value={structure.is_active ? "Yes" : "No"} />
          <FieldRow label="Effective From" value={structure.effective_from || "—"} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Salary</p>
          <FieldRow label="Basic Salary" value={fmtPKR(structure.basic_salary)} mono />
          <FieldRow label="Allowances Total" value={fmtPKR(structure.allowance_total)} mono />
          <FieldRow label="Deductions Total" value={fmtPKR(structure.deduction_total)} mono />
        </div>
      </div>

      {(structure.allowances || []).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Allowances</p>
          {(structure.allowances || []).map((a, i) => (
            <FieldRow key={i} label={a.name} value={`${a.type === "percentage" ? a.value + "%" : fmtPKR(a.value)} ${a.basis ? `(${a.basis})` : ""}`} />
          ))}
        </div>
      )}

      {(structure.deductions || []).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Deductions</p>
          {(structure.deductions || []).map((d, i) => (
            <FieldRow key={i} label={d.name} value={`${d.type === "percentage" ? d.value + "%" : fmtPKR(d.value)} ${d.basis ? `(${d.basis})` : ""}`} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Linked Policies</p>
        <FieldRow label="Attendance Policy" value={structure.attendance_policy?.name || (structure.attendance_policy_id ? "Linked" : "None")} />
        <FieldRow label="Overtime Policy" value={structure.overtime_policy?.name || (structure.overtime_policy_id ? "Linked" : "None")} />
        <FieldRow label="Tax Policy" value={structure.tax_policy?.name || (structure.tax_policy_id ? "Linked" : "None")} />
        <FieldRow label="Bonus Policy" value={structure.bonus_policy?.name || (structure.bonus_policy_id ? "Linked" : "None")} />
      </div>
    </Modal>
  );
}

// ─── Create Salary Structure Modal ───────────────────────────────────────────
function CreateStructureModal({ onClose, onCreate, loading }) {
  const [form, setForm] = useState({
    employee_id: "", basic_salary: "", currency: "PKR", name: "",
    attendance_policy_id: "", overtime_policy_id: "", tax_policy_id: "", bonus_policy_id: "",
    effective_from: new Date().toISOString().split("T")[0],
    allowances: [{ name: "House Allowance", type: "percentage", value: 40, basis: "basic_salary" }],
    deductions: [],
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const payload = {
      ...form,
      basic_salary: parseFloat(form.basic_salary),
      allowances: form.allowances.map(a => ({ ...a, value: parseFloat(a.value) })),
      deductions: form.deductions.map(d => ({ ...d, value: parseFloat(d.value) })),
    };
    if (!payload.bonus_policy_id) delete payload.bonus_policy_id;
    onCreate(payload);
  };

  return (
    <Modal title="Create Salary Structure" onClose={onClose} width={560}>
      <Input label="Employee ID *" value={form.employee_id} onChange={set("employee_id")} placeholder="UUID" />
      <Input label="Structure Name" value={form.name} onChange={set("name")} placeholder="e.g., Senior Dev Package" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Basic Salary *" type="number" min="0" value={form.basic_salary} onChange={set("basic_salary")} />
        <Input label="Currency" value={form.currency} onChange={set("currency")} />
      </div>
      <Input label="Effective From" type="date" value={form.effective_from} onChange={set("effective_from")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Attendance Policy ID *" value={form.attendance_policy_id} onChange={set("attendance_policy_id")} placeholder="UUID" />
        <Input label="Overtime Policy ID *" value={form.overtime_policy_id} onChange={set("overtime_policy_id")} placeholder="UUID" />
        <Input label="Tax Policy ID *" value={form.tax_policy_id} onChange={set("tax_policy_id")} placeholder="UUID" />
        <Input label="Bonus Policy ID" value={form.bonus_policy_id} onChange={set("bonus_policy_id")} placeholder="UUID (optional)" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} onClick={handleSubmit}>Create Structure</Btn>
      </div>
    </Modal>
  );
}

// ─── Main Payroll Service Component ──────────────────────────────────────────
export default function PayrollService() {
  const user = getUser();
  const isAdmin = user.role === "admin";
  const isHr = user.designation === "hr";
  const isManager = user.designation === "manager";
  const isEmployee = user.designation === "employee";
  const isAdminOrHr = isAdmin || isHr;

  const [tab, setTab] = useState("payrolls");
  const [payrolls, setPayrolls] = useState([]);
  const [structures, setStructures] = useState([]);
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "info" });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCreateStructure, setShowCreateStructure] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [employeeFilter, setEmployeeFilter] = useState("");

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 4000);
  };

  // ── Fetch payrolls (admin/hr: by employee, employee: my own) ───────────────
  const fetchMyPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;

      const res = await axiosInstance.get("/payroll/me", { params });
      const d = res.data;
      if (d.payroll) {
        setMyPayrolls([d.payroll]);
        setPagination({ total: 1, pages: 1 });
      } else {
        setMyPayrolls(d.payrolls || []);
        setPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to fetch payrolls", "error");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterMonth, filterYear]);

  const fetchPayrollByEmployee = useCallback(async () => {
    if (!employeeFilter) return;
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const res = await axiosInstance.get(`/api/payroll/${employeeFilter}`, { params });
      const d = res.data;
      if (d.payroll) {
        setPayrolls([d.payroll]);
        setPagination({ total: 1, pages: 1 });
      } else {
        setPayrolls(d.payrolls || []);
        setPagination(d.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to fetch payrolls", "error");
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, page, filterStatus, filterMonth, filterYear]);

  // ── Fetch salary structures ────────────────────────────────────────────────
  const fetchStructures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/salary-structures", { params: { page, limit: 10 } });
      setStructures(res.data.salary_structures || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to fetch structures", "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchMyStructure = useCallback(async () => {
    setLoading(true);
    try {
      const empId = user.employee_id || user.id;
      if (!empId) return;
      const res = await axiosInstance.get(`/api/salary-structures/employee/${empId}`);
      setStructures([res.data.salary_structure]);
    } catch (e) {
      if (e.response?.status !== 404) {
        showToast(e.response?.data?.message || "Failed to fetch structure", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [user.employee_id, user.id]);

  useEffect(() => {
    if (tab === "payrolls") {
      if (isAdminOrHr || isManager) {
        if (employeeFilter) fetchPayrollByEmployee();
      } else {
        fetchMyPayrolls();
      }
    }
    if (tab === "structures") {
      if (isAdminOrHr) fetchStructures();
      else fetchMyStructure();
    }
    if (tab === "mine") {
      fetchMyPayrolls();
    }
  }, [tab, page, filterStatus, filterMonth, filterYear, employeeFilter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleGenerate = async (form) => {
    setActionLoading(true);
    try {
      const payload = { month: Number(form.month), year: Number(form.year) };
      if (form.employee_id) payload.employee_id = form.employee_id;
      const res = await axiosInstance.post("/api/payroll/generate", payload);
      showToast(res.data.message || "Payroll generated!", "success");
      setShowGenerate(false);
      if (tab === "payrolls" && employeeFilter) fetchPayrollByEmployee();
    } catch (e) {
      showToast(e.response?.data?.message || "Generation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/payroll/${id}/approve`);
      showToast("Payroll approved!", "success");
      setSelectedPayroll(null);
      if (employeeFilter) fetchPayrollByEmployee();
      else fetchMyPayrolls();
    } catch (e) {
      showToast(e.response?.data?.message || "Approval failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/payroll/${id}/mark-paid`);
      showToast("Payroll marked as paid!", "success");
      setSelectedPayroll(null);
      if (employeeFilter) fetchPayrollByEmployee();
      else fetchMyPayrolls();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to mark paid", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/payroll/${id}/regenerate`);
      showToast("Payroll regenerated!", "success");
      setSelectedPayroll(null);
      if (employeeFilter) fetchPayrollByEmployee();
    } catch (e) {
      showToast(e.response?.data?.message || "Regeneration failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayslip = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/payslip/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Payslip downloaded!", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to download payslip", "error");
    }
  };

  const handleCreateStructure = async (payload) => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/salary-structures", payload);
      showToast("Salary structure created!", "success");
      setShowCreateStructure(false);
      fetchStructures();
    } catch (e) {
      showToast(e.response?.data?.message || "Creation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Build tabs based on role ───────────────────────────────────────────────
  const tabs = [];
  if (isAdminOrHr || isManager) {
    tabs.push({ key: "payrolls", label: "Payrolls" });
    tabs.push({ key: "mine", label: "My Payroll" });
  } else {
    tabs.push({ key: "mine", label: "My Payroll" });
  }
  if (isAdminOrHr) {
    tabs.push({ key: "structures", label: "Salary Structures" });
  } else {
    tabs.push({ key: "structures", label: "My Structure" });
  }

  const displayedPayrolls = (tab === "mine" || isEmployee) ? myPayrolls : payrolls;

  // ── Summary stats (for admin/hr header) ───────────────────────────────────
  const totalNet = displayedPayrolls.reduce((s, p) => s + (p.totals?.net_salary || 0), 0);
  const draftCount = displayedPayrolls.filter(p => p.status === "draft").length;
  const processedCount = displayedPayrolls.filter(p => p.status === "processed").length;
  const paidCount = displayedPayrolls.filter(p => p.status === "paid").length;

  return (
    <div style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", background: "#F8F8F4", minHeight: "100vh", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #D0D0C8; border-radius: 3px; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "" })} />

      {/* Header */}
      <div style={{ background: "#1A1A2E", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 16 }}>Payroll Service</p>
              <p style={{ margin: 0, color: "#8882BE", fontSize: 11 }}>
                {isAdmin ? "Administrator" : isHr ? "HR Manager" : isManager ? "Manager" : "Employee"} Portal
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isAdminOrHr && (
              <>
                <Btn onClick={() => setShowGenerate(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  Generate Payroll
                </Btn>
                {tab === "structures" && (
                  <Btn variant="ghost" onClick={() => setShowCreateStructure(true)} style={{ color: "#fff" }}>
                    + New Structure
                  </Btn>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} style={{
              padding: "10px 20px", background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #818CF8" : "2px solid transparent",
              color: tab === t.key ? "#818CF8" : "#888", fontWeight: 600, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Filters & Search */}
        {(tab === "payrolls" || tab === "mine") && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            {(isAdminOrHr || isManager) && tab === "payrolls" && (
              <div style={{ flex: "0 0 260px" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>Employee ID</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder="Search by Employee UUID"
                    value={employeeFilter}
                    onChange={e => setEmployeeFilter(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchPayrollByEmployee()}
                    style={{
                      flex: 1, padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8",
                      fontSize: 13, background: "#fff", fontFamily: "inherit", outline: "none"
                    }}
                  />
                  <Btn small onClick={fetchPayrollByEmployee}>Search</Btn>
                </div>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
                padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8",
                fontSize: 13, background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer"
              }}>
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>Month</label>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{
                padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8",
                fontSize: 13, background: "#fff", fontFamily: "inherit", outline: "none", cursor: "pointer"
              }}>
                <option value="">All Months</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>Year</label>
              <input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)} min="2000" max="2100" style={{
                padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E0E0D8", width: 90,
                fontSize: 13, background: "#fff", fontFamily: "inherit", outline: "none"
              }} />
            </div>
            <Btn small onClick={() => { tab === "mine" ? fetchMyPayrolls() : fetchPayrollByEmployee(); }}>
              Apply Filters
            </Btn>
          </div>
        )}

        {/* Stats row */}
        {(tab === "payrolls" || tab === "mine") && displayedPayrolls.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            <MetricCard label="Total Records" value={displayedPayrolls.length} accent="#4F46E5" />
            <MetricCard label="Draft" value={draftCount} accent="#F59E0B" />
            <MetricCard label="Processed" value={processedCount} accent="#3B82F6" />
            <MetricCard label="Paid" value={paidCount} sub={`Net: ${fmtPKR(totalNet)}`} accent="#10B981" />
          </div>
        )}

        {/* Payroll Table */}
        {(tab === "payrolls" || tab === "mine") && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E8E0", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#F8F8F4", borderBottom: "1px solid #E8E8E0" }}>
                    {[
                      "Employee", "Period", "Working Days", "Payable Days",
                      "Gross", "Deductions", "Net Salary", "Status", ""
                    ].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#999", fontSize: 14 }}>Loading payrolls…</td></tr>
                  ) : displayedPayrolls.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#999", fontSize: 14 }}>
                      {(isAdminOrHr || isManager) && tab !== "mine" ? "Enter an Employee ID to search payrolls." : "No payrolls found."}
                    </td></tr>
                  ) : displayedPayrolls.map((p, i) => {
                    const emp = p.employee || {};
                    const period = p.period || {};
                    const attendance = p.attendance || {};
                    const totals = p.totals || {};
                    return (
                      <tr key={p.id || i} style={{ borderBottom: "1px solid #F0F0EC", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div style={{ fontSize: 11, color: "#999" }}>{emp.designation || "—"}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>
                          {MONTH_NAMES[(period.month || 1) - 1]} {period.year}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#555", textAlign: "center" }}>
                          {period.working_days || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#555", textAlign: "center" }}>
                          {attendance.payable_days}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#444" }}>
                          {fmtPKR(totals.gross_salary)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#DC2626" }}>
                          -{fmtPKR(totals.deductions_total)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#1A1A2E" }}>
                          {fmtPKR(totals.net_salary)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Btn small variant="secondary" onClick={() => setSelectedPayroll(p)}>View</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0EC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#888" }}>Total: {pagination.total} records</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
                  <span style={{ padding: "6px 12px", fontSize: 13, color: "#555" }}>Page {page} of {pagination.pages}</span>
                  <Btn small variant="secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Salary Structures Tab */}
        {tab === "structures" && (
          <div>
            {isAdminOrHr && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <Btn onClick={() => setShowCreateStructure(true)}>+ New Salary Structure</Btn>
              </div>
            )}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E8E0", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: "#F8F8F4", borderBottom: "1px solid #E8E8E0" }}>
                      {["Employee", "Structure Name", "Basic Salary", "Allowances", "Deductions", "Currency", "Active", ""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#999" }}>Loading…</td></tr>
                    ) : structures.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#999" }}>No salary structures found.</td></tr>
                    ) : structures.map((s, i) => {
                      const emp = s.employee || {};
                      return (
                        <tr key={s.id || i} style={{ borderBottom: "1px solid #F0F0EC" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{emp.first_name} {emp.last_name}</div>
                            <div style={{ fontSize: 11, color: "#999" }}>{emp.designation}</div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{s.name || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmtPKR(s.basic_salary)}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#16A34A" }}>{fmtPKR(s.allowance_total)}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#DC2626" }}>{fmtPKR(s.deduction_total)}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{s.currency || "PKR"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                              background: s.is_active ? "#F0FDF4" : "#FEF2F2",
                              color: s.is_active ? "#16A34A" : "#DC2626"
                            }}>{s.is_active ? "Active" : "Inactive"}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Btn small variant="secondary" onClick={() => setSelectedStructure(s)}>View</Btn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPayroll && (
        <PayrollDetail
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
          isAdminOrHr={isAdminOrHr}
          onApprove={handleApprove}
          onMarkPaid={handleMarkPaid}
          onRegenerate={handleRegenerate}
          onPayslip={handlePayslip}
        />
      )}
      {selectedStructure && (
        <SalaryStructureModal structure={selectedStructure} onClose={() => setSelectedStructure(null)} />
      )}
      {showGenerate && (
        <GenerateModal onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} loading={actionLoading} />
      )}
      {showCreateStructure && (
        <CreateStructureModal onClose={() => setShowCreateStructure(false)} onCreate={handleCreateStructure} loading={actionLoading} />
      )}
    </div>
  );
}