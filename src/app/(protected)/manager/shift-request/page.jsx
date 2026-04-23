
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerShiftRequestsTab from "../../../../containers/admin/ManagerShiftRequestsTab";



const breadcrumbData = [
    { name: " Change shift request ", url: "/manager/shift-request" },
  ]

export default function Page() {
 
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerShiftRequestsTab />
    </>
  )
}