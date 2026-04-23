
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
import ShiftRequestsTab from "../../../../containers/hr/ShiftRequestsTab";


export default function Page() {
  const breadcrumbData = [
    { name: "Shift Request", url: "/employee/shift-request" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ShiftRequestsTab />
    </>
  )
}





