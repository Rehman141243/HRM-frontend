import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import ManagerOvertimeTab from "../../../../containers/manager/ManagerOvertimeTab";



export default function Page() {
  const breadcrumbData = [
    { name: "OverTIme Request", url: "/manager/overtime" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerOvertimeTab />
    </>
  )
}