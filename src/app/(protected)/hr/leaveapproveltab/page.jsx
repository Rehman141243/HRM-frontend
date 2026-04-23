import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import HRLeaveApprovalTab from "../../../../containers/hr/hrleaveapproveltab";


export default function Page() {
  const breadcrumbData = [
    { name: "Leave Approvel", url: "/hr/leaveapprovetab" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <HRLeaveApprovalTab />
    </>
  )
}

