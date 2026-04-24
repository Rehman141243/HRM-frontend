
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component"
import Shift from "../../../../containers/employee/shift/shift";

export default function Page() {
  const breadcrumbData = [
    { name: "My Shifts", url: "/employee/shift" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <Shift />
    </>
  )
}





