"use client";

import AdminLeaveManagement from "@/containers/leave/Leave";
import { BreadcrumbComponent } from "../../../components/common/breadcrumb-component";


export default function Page() {
  const breadcrumbData = [
    { name: "Leave Request", url: "/leave" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AdminLeaveManagement />
    </>
  )
}