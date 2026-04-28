"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { AddEmployeeForm } from "@/containers/shared/admin-hr/employee-management/create-employee";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { getUser } from "@/lib/auth";

function makeBreadcrumb(basePath) {
  return [
    { name: "Employees", url: basePath },
    { name: "Update Employee", url: "#" },
  ];
}

export default function UpdateEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const user = getUser();

  const role = (user?.role ?? "").toLowerCase().trim();
  const isAdmin = role === "admin";
  const basePath = isAdmin ? "/admin/employee-management" : "/hr/employee-management";

  const [employeeData, setEmployeeData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosInstance
      .get(`/employee/${id}`)
      .then(({ data }) => setEmployeeData(data.employee))
      .catch((err) =>
        setError(err.response?.data?.message ?? err.message)
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading employee…
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

  return (
    <>
      <BreadcrumbComponent data={makeBreadcrumb(basePath)} />
      <div className=" py-6">
        <AddEmployeeForm
          mode="edit"
          initialData={employeeData}
          employeeId={id}
          currentUserRole={user?.role}
          onSuccess={() => router.push(basePath)}
          onCancel={() => router.push(basePath)}
        />
      </div>
    </>
  );
}