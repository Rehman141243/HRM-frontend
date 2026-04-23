import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import OvertimeTab from "../../../../containers/trash/components/OvertimeTab";

export default function Page() {
  const breadcrumbData = [
    { name: "OverTime Request", url: "/employee/overtime" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <OvertimeTab />
    </>
  )
}

