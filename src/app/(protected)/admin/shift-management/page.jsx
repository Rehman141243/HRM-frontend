


import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
import AdminShiftManagement from "../../../../containers/admin/shift-management/admin-shift"

export default function Page() {
  const breadcrumbData = [
    { name: "Shift Management", url: "/admin/shift-mangement" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <AdminShiftManagement />
    </>
  )
}