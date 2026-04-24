import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerLeaveApprovalTab from "../../../../containers/hr/hrleaveapproveltab";


export default function Page() {
  const breadcrumbData = [
    { name: "Leave Approvel", url: "/hr/leaveapprovetab" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerLeaveApprovalTab />
    </>
  )
}

