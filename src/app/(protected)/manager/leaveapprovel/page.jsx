import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerLeaveApprovalTab from "../../../../containers/manager/ManagerLeaveApprovalTab";




export default function Page() {
  const breadcrumbData = [
    { name: "Leave Approvel Request", url: "/manager/leaveapprovel" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerLeaveApprovalTab />
    </>
  )
}