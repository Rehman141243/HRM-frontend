import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerShiftRequestsTab from "../../../../containers/admin/ManagerShiftRequestsTab";




export default function Page() {
  const breadcrumbData = [
    { name: "Change Shift Request", url: "/admin/change-shift" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerShiftRequestsTab/>
    </>
  )
}

