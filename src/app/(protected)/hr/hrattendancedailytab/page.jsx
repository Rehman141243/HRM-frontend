import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import HRAttendanceDailyTab from "../../../../containers/hr/HRAttendanceDailyTab";


export default function Page() {
  const breadcrumbData = [
    { name: "Generate attendance report", url: "/hr/hrattendancedailytab" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <HRAttendanceDailyTab />
    </>
  )
}

