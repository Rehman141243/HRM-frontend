

import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerOvertimeTab from "../../../../containers/admin/ManagerOvertimeTab";



export default function Page() {
  const breadcrumbData = [
    { name: "Manage OverTime Request", url: "/admin/overtime" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerOvertimeTab/>
    </>
  )
}

