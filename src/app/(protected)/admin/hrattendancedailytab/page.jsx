import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import HRAttendanceDailyTab from "../../../../containers/admin/HRAttendanceDailyTab";



import ManagerLeaveApprovalTab from "../../../../containers/admin/ManagerLeaveApprovalTab";


export default function Page() {
  const breadcrumbData = [
    { name: "Daily Attendance Report ", url: "/admin/hrattendancedailytab" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <HRAttendanceDailyTab/>
    </>
  )
}

