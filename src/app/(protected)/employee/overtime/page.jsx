import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import OvertimeTab from "../../../../containers/employee/overtime/overtime";

export default function Page() {
  const breadcrumbData = [
    { name: "Over Time Request", url: "/employee/overtime" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <OvertimeTab />
    </>
  )
}

