
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import LeaveTab from "../../../../containers/employee/leavetab";

export default function Page() {
  const breadcrumbData = [
    { name: "Leave", url: "/employee/leave" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <LeaveTab />
    </>
  )
}








