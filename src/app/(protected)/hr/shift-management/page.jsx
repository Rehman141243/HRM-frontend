


import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
import AdminShiftManagement from "../../../../containers/hr/shift-management/admin-shift";

export default function Page() {
  const breadcrumbData = [
    { name: "Shift Management", url: "/hr/shift-mangement" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AdminShiftManagement />
    </>
  )
}