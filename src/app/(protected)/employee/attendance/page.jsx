import Employee from "../../../../containers/employee/Employee"
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
const breadcrumbData = [
  { name: "My Attendance", url: "/employee/attendance" },
]

export default function Page() {
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <Employee />;
    </>
  )
}




