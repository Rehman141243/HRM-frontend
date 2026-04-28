"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { RoleBadge, StatusBadge } from "@/containers/shared/admin-hr/employee-management/create-employee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { getUser } from "@/lib/auth";

function makeBreadcrumb(basePath) {
  return [
    { name: "Employees", url: basePath },
    { name: "Employee Details", url: "#" },
  ];
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

function DocLink({ label, url }) {
  if (!url) return null;
  const isImage = /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted transition-colors"
    >
      {isImage ? (
        <img src={url} alt={label} className="h-8 w-8 rounded object-cover border" />
      ) : (
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="flex-1 text-xs text-muted-foreground truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </a>
  );
}

export default function ViewEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();
  const role = (user?.role ?? "").toLowerCase().trim()
  const designation = (user?.designation ?? "").toLowerCase().trim()
  
  const isAdmin = role === "admin"
  
  // ✅ FIX HR detection (important)
  const isHr =
    role === "hr" || designation === "hr"
  
  const isAdminOrHr = isAdmin || isHr
  const basePath = isAdmin ? "/admin/employee-management" : "/hr/employee-management";
  const [employee, setEmployee] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    axiosInstance
      .get(`/employee/${id}`)
      .then(({ data }) => setEmployee(data.employee))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const fullName = [employee?.first_name, employee?.last_name].filter(Boolean).join(" ") || "—";
  const employmentTypeLabel = (employee?.employment_type ?? "").replace(/_/g, " ");

  return (
    <>
      <BreadcrumbComponent data={makeBreadcrumb(basePath)} />

      <div className=" py-6 flex flex-col gap-6">
        {/* ── Top bar ───────────────────────── */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push(basePath)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {isAdminOrHr  && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => router.push(`${basePath}/update-employee/${id}`)}
            >
              <Pencil className="h-4 w-4" /> Edit Employee
            </Button>
          )}
        </div>

        {/* ── Identity card ─────────────────── */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-5">
            {employee?.profile_pic_url ? (
              <img
                src={employee.profile_pic_url}
                alt={fullName}
                className="h-16 w-16 rounded-full object-cover border shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted border flex items-center justify-center text-2xl font-semibold text-muted-foreground shrink-0">
                {employee?.first_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <RoleBadge role={employee?.designation ?? employee?.role} />
                <StatusBadge value={employee?.is_active} />
                <span className="text-xs text-muted-foreground font-mono">
                  {employee?.employee_id}
                </span>
              </div>
              {/* <span className="text-sm text-muted-foreground">{employee?.email ?? "—"}</span> */}
            </div>
          </CardContent>
        </Card>

        {/* ── Details grid ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <DetailRow label="Date of Birth" value={employee?.dob?.slice(0, 10)} />
              <DetailRow label="Gender" value={employee?.gender} />
              <DetailRow label="Phone" value={employee?.phone} />
              <DetailRow label="Address" value={employee?.address} />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Employment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <DetailRow label="Department" value={employee?.department} />
              <DetailRow label="Employment Type" value={employmentTypeLabel} />
              <DetailRow label="Joining Date" value={employee?.joining_date?.slice(0, 10)} />
              <DetailRow label="Created At" value={employee?.created_at?.slice(0, 10)} />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <DetailRow label="Name" value={employee?.emergency_name} />
              <DetailRow label="Phone" value={employee?.emergency_phone} />
            </CardContent>
          </Card>

          {/* Documents card — only shown if any doc exists */}
          {(employee?.cnic_url || employee?.degree_url || employee?.passport_url ||
            employee?.contract_url || employee?.other_docs?.length) && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Documents</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <DocLink label="CNIC" url={employee?.cnic_url} />
                <DocLink label="Degree" url={employee?.degree_url} />
                <DocLink label="Passport" url={employee?.passport_url} />
                <DocLink label="Contract" url={employee?.contract_url} />
                {employee?.other_docs?.map((url, i) => (
                  <DocLink key={i} label={`Other Document ${i + 1}`} url={url} />
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </>
  );
}