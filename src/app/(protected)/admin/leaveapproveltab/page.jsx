
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerLeaveApprovalTab from "../../../../containers/admin/adminleaveapprovel/ManagerLeaveApprovalTab";


export default function Page() {
  const breadcrumbData = [
    { name: "Leave Approvel", url: "/admin/leaveapprovetab" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerLeaveApprovalTab/>
    </>
  )
}

