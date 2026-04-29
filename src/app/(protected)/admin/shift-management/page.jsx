


import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
import ShiftManagement from "../../../../containers/shared/admin-hr/shift-management/shift-management"

export default function Page() {
  const breadcrumbData = [
    { name: "Shift Management", url: "/admin/shift-mangement" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ShiftManagement />
    </>
  )
}