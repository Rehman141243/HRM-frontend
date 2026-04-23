
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import LeaveTab from "../../../../containers/hr/leavetab";


export default function Page() {
  const breadcrumbData = [
    { name: "Leave Request", url: "/leave" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <LeaveTab />
    </>
  )
}