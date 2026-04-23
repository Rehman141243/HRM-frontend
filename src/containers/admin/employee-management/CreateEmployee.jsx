
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import axiosInstance from "@/lib/axiosInstance";
import { X, FileText } from "lucide-react";

const ALLOWED_ROLES = ["employee", "hr", "manager"];

export function RoleBadge({ role }) {
  const variants = { manager: "destructive", hr: "default", employee: "outline" };
  return (
    <Badge variant={variants[role] || "outline"} className="capitalize">
      {role || "employee"}
    </Badge>
  );
}

export function StatusBadge({ value }) {
  return (
    <Badge variant={value === true ? "default" : "secondary"}>
      {value === true ? "Active" : "Inactive"}
    </Badge>
  );
}

const inputCls =
  "rounded-md border bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const EMPTY_FORM = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  phone: "",
  address: "",
  employeeId: "",
  department: "",
  designation: "employee",   // ← always "designation" internally
  joiningDate: "",
  employmentType: "",
  emergencyName: "",
  emergencyPhone: "",
};

/**
 * Maps raw API response → internal form state.
 * The backend stores the role as "designation".
 */
function mapInitialData(d) {
  if (!d) return EMPTY_FORM;
  return {
    email: d.email ?? "",
    password: "",                                    // never pre-fill password
    firstName: d.first_name ?? "",
    lastName: d.last_name ?? "",
    dob: d.dob ? d.dob.slice(0, 10) : "",
    gender: d.gender ?? "",
    phone: d.phone ?? "",
    address: d.address ?? "",
    employeeId: d.employee_id ?? "",
    department: d.department ?? "",
    designation: d.designation ?? "employee",        // backend field name
    joiningDate: d.joining_date ? d.joining_date.slice(0, 10) : "",
    employmentType: d.employment_type ?? "",
    emergencyName: d.emergency_name ?? "",
    emergencyPhone: d.emergency_phone ?? "",
  };
}

// ── File preview ──────────────────────────────────────────────
function FilePreview({ label, existingUrl, newFile, onClear }) {
  const isImage = (src) => /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(src ?? "");
  const previewSrc = newFile ? URL.createObjectURL(newFile) : existingUrl ?? null;
  const fileName = newFile?.name ?? existingUrl?.split("/").pop() ?? null;

  if (!previewSrc) return null;

  return (
    <div className="relative flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm">
      {isImage(previewSrc) ? (
        <img src={previewSrc} alt={label} className="h-10 w-10 rounded object-cover border" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded border bg-background">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <span className="flex-1 truncate text-xs text-muted-foreground">{fileName}</span>
      <button
        type="button"
        onClick={onClear}
        className="text-muted-foreground hover:text-red-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── API helpers ───────────────────────────────────────────────
async function createEmployee(formData) {
  const { data } = await axiosInstance.post("/employee", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

async function updateEmployee(id, formData) {
  const { data } = await axiosInstance.put(`/employee/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

function buildEmployeeFormData(fields = {}, files = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, value);
    }
  });
  Object.entries(files).forEach(([field, file]) => {
    if (!file) return;
    if (Array.isArray(file)) file.forEach((f) => fd.append(field, f));
    else fd.append(field, file);
  });
  return fd;
}

// ── Document field definitions ────────────────────────────────
const DOC_FIELDS = [
  { key: "profilePic", label: "Profile Picture", accept: "image/jpeg,image/png,image/webp" },
  { key: "cnic", label: "CNIC", accept: "application/pdf,image/jpeg,image/png" },
  { key: "degree", label: "Degree", accept: "application/pdf,image/jpeg,image/png" },
  { key: "passport", label: "Passport", accept: "application/pdf,image/jpeg,image/png" },
  { key: "contract", label: "Contract", accept: "application/pdf" },
];

// ── Main Form ─────────────────────────────────────────────────
export function AddEmployeeForm({
  onSuccess,
  onCancel,
  currentUserRole,
  mode = "create",      // "create" | "edit"
  initialData = null,   // raw API employee object
  employeeId = null,    // UUID from URL params (edit mode)
}) {
  const user = getUser();

  const [form, setForm] = React.useState(() =>
    mode === "edit" ? mapInitialData(initialData) : EMPTY_FORM
  );
  const [files, setFiles] = React.useState({});
  const [clearedFiles, setClearedFiles] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  // Re-populate form if initialData arrives after mount (edit mode)
  React.useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm(mapInitialData(initialData));
    }
  }, [initialData, mode]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setFile = (k, file) => {
    setFiles((p) => ({ ...p, [k]: file }));
    setClearedFiles((p) => ({ ...p, [k]: false }));
  };

  const clearFile = (k) => {
    setFiles((p) => ({ ...p, [k]: null }));
    setClearedFiles((p) => ({ ...p, [k]: true }));
  };

  // HR can only create "employee"; admin can assign any allowed role
  const availableRoles =
    currentUserRole === "hr" ? ["employee"] : ALLOWED_ROLES;

  // Existing file URLs from the API response
  const existingFiles = {
    profilePic: initialData?.profile_pic_url ?? null,
    cnic: initialData?.cnic_url ?? null,
    degree: initialData?.degree_url ?? null,
    passport: initialData?.passport_url ?? null,
    contract: initialData?.contract_url ?? null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");

    try {
      if (mode === "create") {
        // createEmployeeService reads "designation" from body
        const fd = buildEmployeeFormData(form, files);
        await createEmployee(fd);
      } else {
        // updateEmployeeService reads "role" from body (inconsistent with create, but backend is fixed)
        const { email, password, designation, ...rest } = form;
        const payload = {
          ...form,
          ...(form.password ? { password: form.password } : {}),
        };

        const fd = buildEmployeeFormData(payload, files);
        await updateEmployee(employeeId, fd);
      }
      onSuccess?.();
    } catch (error) {
      setErr(error.response?.data?.message ?? error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          {mode === "edit" ? "Update Employee" : "Add New Employee"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {err && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
              {err}
            </p>
          )}

          {/* ── Account ───────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Email — shown in create; read-only in edit */}
              <Field label="Email" required={mode === "create"}>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required={mode === "create"}
                  disabled={mode === "edit"}   // email cannot be changed
                  title={mode === "edit" ? "Email cannot be changed" : undefined}
                />
              </Field>

              {/* Password — required on create, optional on edit */}
              <Field
                label={mode === "edit" ? "New Password (optional)" : "Password"}
                required={mode === "create"}
              >
                <input
                  type="password"
                  className={inputCls}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={
                    mode === "edit"
                      ? "Leave blank to keep current password"
                      : "Min 8 chars, upper+lower+digit+symbol"
                  }
                  required={mode === "create"}
                />
              </Field>

              {/* Role / Designation */}
              {mode === "create" && (
                <Field label="Role">
                  <select
                    className={inputCls}
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </section>

          {/* ── Personal Info ──────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Personal Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input
                  className={inputCls}
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  className={inputCls}
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Date of Birth" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  required
                />
              </Field>
              <Field label="Gender" required>
                <select
                  className={inputCls}
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Phone" required>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  required
                />
              </Field>
              <Field label="Address" required>
                <input
                  className={inputCls}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          {/* ── Employment ─────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Employment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employee ID" required>
                <input
                  className={inputCls}
                  value={form.employeeId}
                  onChange={(e) => set("employeeId", e.target.value)}
                  required
                />
              </Field>
              <Field label="Department" required>
                <input
                  className={inputCls}
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  required
                />
              </Field>
              <Field label="Joining Date" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.joiningDate}
                  onChange={(e) => set("joiningDate", e.target.value)}
                  required
                />
              </Field>
              <Field label="Employment Type" required>
                <select
                  className={inputCls}
                  value={form.employmentType}
                  onChange={(e) => set("employmentType", e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </Field>
            </div>
          </section>

          {/* ── Emergency Contact ──────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name" required>
                <input
                  className={inputCls}
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                  required
                />
              </Field>
              <Field label="Contact Phone" required>
                <input
                  className={inputCls}
                  value={form.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          {/* ── Documents ──────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Documents <span className="normal-case font-normal">(optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOC_FIELDS.map(({ key, label, accept }) => {
                const hasNewFile = !!files[key];
                const hasExisting = !clearedFiles[key] && !!existingFiles[key];
                const showPreview = hasNewFile || hasExisting;

                return (
                  <Field key={key} label={label}>
                    {showPreview ? (
                      <FilePreview
                        label={label}
                        existingUrl={hasExisting ? existingFiles[key] : null}
                        newFile={files[key] ?? null}
                        onClear={() => clearFile(key)}
                      />
                    ) : (
                      <input
                        type="file"
                        accept={accept}
                        className="text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium"
                        onChange={(e) => setFile(key, e.target.files[0])}
                      />
                    )}
                  </Field>
                );
              })}

              {/* Other Documents (multi-upload) */}
              <Field label="Other Documents (multiple)">
                {files.otherDocs?.length > 0 && (
                  <div className="flex flex-col gap-2 mb-2">
                    {files.otherDocs.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((p) => ({
                              ...p,
                              otherDocs: p.otherDocs.filter((_, j) => j !== i),
                            }))
                          }
                          className="hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  multiple
                  className="text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium"
                  onChange={(e) =>
                    setFiles((p) => ({
                      ...p,
                      otherDocs: [...(p.otherDocs ?? []), ...Array.from(e.target.files)],
                    }))
                  }
                />
              </Field>
            </div>
          </section>

          {/* ── Actions ────────────────────────────────────────── */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? mode === "edit" ? "Saving…" : "Creating…"
                : mode === "edit" ? "Save Changes" : "Create Employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}