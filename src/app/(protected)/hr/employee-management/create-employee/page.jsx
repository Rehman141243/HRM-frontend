"use client";

import { useRouter } from "next/navigation";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";
import { AddEmployeeForm } from "../../../../../containers/hr/employee-management/CreateEmployee";
import { getUser } from "@/lib/auth";


const breadcrumbData = [
    { name: "Employees", url: "/hr/employee-management" },
     { name: "Create Employe", url: "/hr/employee-management/create-employee" },
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
      onSuccess={() => router.push("/hr/employee-management")}
      onCancel={() => router.push("/hr/employee-management")}
    />
    </div>

  </>);
}

