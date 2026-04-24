
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import Leave from "../../../../containers/employee/leave/leave";

export default function Page() {
  const breadcrumbData = [
    { name: "Leave", url: "/employee/leave" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <Leave />
    </>
  )
}








