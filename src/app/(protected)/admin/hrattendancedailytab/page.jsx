import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import HRAttendanceDailyTab from "../../../../containers/admin/hrattendance/HRAttendanceDailyTab";




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

