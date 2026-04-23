
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import HROvertimeTab from "../../../../containers/hr/hrovertimetab";



export default function Page() {
  const breadcrumbData = [
    { name: "OverTime Request", url: "/hr/overtime" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <HROvertimeTab />
    </>
  )
}

