"use client";

import { useRouter } from "next/navigation";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";
import { AddEmployeeForm } from "@/containers/shared/admin-hr/employee-management/create-employee";
import { getUser } from "@/lib/auth";


const breadcrumbData = [
    { name: "Employees", url: "/admin/employee-management" },
     { name: "Create Employe", url: "/admin/employee-management/create-employee" },
  ];
export default function Page() {

    const user = getUser();
    const router=useRouter();
  return (
  <>
<BreadcrumbComponent data={breadcrumbData}/>
<div className="mt-5">
    <AddEmployeeForm
      currentUserRole={user?.role}
      onSuccess={() => router.push("/admin/employee-management")}
      onCancel={() => router.push("/admin/employee-management")}
    />
    </div>

  </>);
}

